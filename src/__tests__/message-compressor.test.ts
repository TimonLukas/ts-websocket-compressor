import { describe, expect, it, vi } from "vitest"

import { MessageCompressor } from "../message-compressor.js"
import { sleep } from "../util.js"

describe("MessageCompressor", () => {
  describe("compress(message)", () => {
    it("can compress registered message types", () => {
      const compressor = new MessageCompressor()

      compressor.registerMessageType(["foo", "bar", "baz"])
      expect(
        compressor.compress({
          foo: true,
          bar: false,
          baz: null,
        }),
      ).toEqual("1[false,null,true]")
      expect(
        compressor.compress({
          foo: "foo",
          bar: "bar",
          baz: "baz",
        }),
      ).toEqual('1["bar","baz","foo"]')

      expect(compressor.compress({
        foo: true,
        bar: false,
        baz: {
          foo: "foo",
          bar: "bar",
          baz: "baz",
        },
      })).toEqual('1[false,1["bar","baz","foo"],true]')

      compressor.registerMessageType(["foo", "bar"])
      expect(
        compressor.compress({
          foo: true,
          bar: false,
        }),
      ).toEqual("2[false,true]")
      expect(
        compressor.compress({
          foo: "foo",
          bar: "bar",
        }),
      ).toEqual('2["bar","foo"]')
    })

    it("can compress general messages", () => {
      const compressor = new MessageCompressor()

      expect(
        compressor.compress({
          foo: true,
          bar: false,
          baz: null,
        }),
      ).toEqual("0[0,true,1,false,2,null]")
    })

    it("keeps previously-seen general keys with the same ID", () => {
      const compressor = new MessageCompressor()

      compressor.compress({
        foo: true,
        bar: false,
        baz: null,
      })

      expect(
        compressor.compress({
          foo: true,
          bar: false,
          baz: null,
        }),
      ).toEqual("0[0,true,1,false,2,null]")

      expect(
        compressor.compress({
          foo: true,
          bar: false,
          baz: [
            {
              foo: true,
              bar: false,
              baz: {
                foo: [true, false],
                bar: [false, true],
                baz: [null, { null: null }],
              },
            },
          ],
        }),
      ).toEqual(
        '0[0,true,1,false,2,[{"foo":true,"bar":false,"baz":{"foo":[true,false],"bar":[false,true],"baz":[null,{"null":null}]}}]]',
      )

      expect(
        compressor.compress({
          foo: true,
          bar: false,
          baz: {
            foo: true,
            bar: false,
            baz: {
              foo: [true, false],
              bar: [false, true],
              baz: [null, { null: null }],
            },
          },
        }),
      ).toEqual(
        '0[0,true,1,false,2,0[0,true,1,false,2,0[0,[true,false],1,[false,true],2,[null,{"null":null}]]]]',
      )
    })
  })

  describe("decompress(message)", () => {
    it("can decompress registered message types", () => {
      const compressor = new MessageCompressor()

      compressor.registerMessageType(["foo", "bar", "baz"])
      expect(compressor.decompress("1[false,null,true]")).toEqual({
        foo: true,
        bar: false,
        baz: null,
      })
      expect(compressor.decompress('1["bar","baz","foo"]')).toEqual({
        foo: "foo",
        bar: "bar",
        baz: "baz",
      })

      expect(compressor.decompress('1[false,1["bar","baz","foo"],true]')).toEqual({
        foo: true,
        bar: false,
        baz: {
          foo: "foo",
          bar: "bar",
          baz: "baz",
        },
      })

      compressor.registerMessageType(["foo", "bar"])
      expect(compressor.decompress("2[false,true]")).toEqual({
        foo: true,
        bar: false,
      })
      expect(compressor.decompress('2["bar","foo"]')).toEqual({
        foo: "foo",
        bar: "bar",
      })
    })

    it("can decompress general messages", () => {
      const compressor = new MessageCompressor()

      compressor.compress({ foo: true, bar: false, baz: null })
      expect(compressor.decompress("0[0,true,1,false,2,null]")).toEqual({
        foo: true,
        bar: false,
        baz: null,
      })
    })
  })

  describe("dictionary updates", () => {
    it("emits a dictionary update on the next tick after every change", async () => {
      const compressor = new MessageCompressor()

      const handlers = {
        handleDictionaryUpdate: () => {},
      }
      const spy = vi.spyOn(handlers, "handleDictionaryUpdate")
      compressor.on(
        "send-dictionary-updates-to-clients",
        handlers.handleDictionaryUpdate,
      )

      compressor.registerMessageType(["foo"])

      await sleep(1)

      expect(spy).toHaveBeenCalledOnce()
    })

    it("emits a single dictionary update for multiple changes in the same tick", async () => {
      const compressor = new MessageCompressor()

      const handlers = {
        handleDictionaryUpdate: () => {},
      }
      const spy = vi.spyOn(handlers, "handleDictionaryUpdate")
      compressor.on(
        "send-dictionary-updates-to-clients",
        handlers.handleDictionaryUpdate,
      )

      compressor.registerMessageType(["foo"])
      compressor.registerMessageType(["foo", "bar"])

      await sleep(1)

      expect(spy).toHaveBeenCalledOnce()
    })

    it("emits multiple dictionary update for multiple changes over multiple tick", async () => {
      const compressor = new MessageCompressor()

      const handlers = {
        handleDictionaryUpdate: () => {},
      }
      const spy = vi.spyOn(handlers, "handleDictionaryUpdate")
      compressor.on(
        "send-dictionary-updates-to-clients",
        handlers.handleDictionaryUpdate,
      )

      compressor.registerMessageType(["foo"])
      compressor.registerMessageType(["foo", "bar"])
      await sleep(1)
      expect(spy).toHaveBeenCalledOnce()

      compressor.registerMessageType(["foo", "bar", "baz"])
      await sleep(1)
      expect(spy).toHaveBeenCalledTimes(2)
    })
  })

  describe("end-to-end workflow with multiple compressors", () => {
    it("can correctly exchange dictionaries to compress with one compressor and decompress with another", async () => {
      const compressorIn = new MessageCompressor()
      const compressorOut = new MessageCompressor(false)

      compressorIn.on("send-dictionary-updates-to-clients", (dictionary) =>
        compressorOut.handleDictionaryUpdates(dictionary),
      )

      const message1 = {
        foo: true,
        bar: false,
        baz: [
          {
            foo: true,
            bar: false,
            baz: {
              foo: [true, false],
              bar: [false, true],
              baz: [null, { null: null }],
            },
          },
        ],
      }
      const message2 = {
        foo: true,
        bar: false,
        baz: {
          foo: true,
          bar: false,
          baz: {
            foo: [true, false],
            bar: [false, true],
            baz: [null, { null: null }],
          },
        },
      }

      const compressedMessage1 = compressorIn.compress(message1)
      const compressedMessage2 = compressorIn.compress(message2)

      await sleep(2)

      const decompressedMessage1 = compressorOut.decompress(compressedMessage1)
      expect(decompressedMessage1).toEqual(message1)
      const decompressedMessage2 = compressorOut.decompress(compressedMessage2)
      expect(decompressedMessage2).toEqual(message2)
    })
  })
})
