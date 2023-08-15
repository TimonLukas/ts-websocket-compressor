import { describe, expect, it } from "vitest"

import { findArrayElementIndices } from "../find-array-element-indices.js"

describe("findArrayElementIndices(haystack)", () => {
  describe("with well-formed array strings", () => {
    it("works with boolean array strings without spaces", () => {
      const string = "[true,false,null]"
      expect(findArrayElementIndices(string)).toEqual([
        [1, 5],
        [6, 11],
        [12, 16],
      ])
      expect(string.substring(1, 5).trim()).toEqual("true")
      expect(string.substring(6, 11).trim()).toEqual("false")
      expect(string.substring(12, 16).trim()).toEqual("null")
    })

    it("works with boolean array strings with spaces", () => {
      const string = "[true, false, null]"
      expect(findArrayElementIndices(string)).toEqual([
        [1, 5],
        [6, 12],
        [13, 18],
      ])
      expect(string.substring(1, 5).trim()).toEqual("true")
      expect(string.substring(6, 12).trim()).toEqual("false")
      expect(string.substring(13, 18).trim()).toEqual("null")
    })

    it("works with string array strings without spaces", () => {
      const string = '["foo","bar","baz"]'
      expect(findArrayElementIndices(string)).toEqual([
        [1, 6],
        [7, 12],
        [13, 18],
      ])
      expect(string.substring(1, 6).trim()).toEqual('"foo"')
      expect(string.substring(7, 12).trim()).toEqual('"bar"')
      expect(string.substring(13, 18).trim()).toEqual('"baz"')
    })

    it("works with string array strings with spaces", () => {
      const string = '["foo", "bar", "baz"]'
      expect(findArrayElementIndices(string)).toEqual([
        [1, 6],
        [7, 13],
        [14, 20],
      ])
      expect(string.substring(1, 6).trim()).toEqual('"foo"')
      expect(string.substring(7, 13).trim()).toEqual('"bar"')
      expect(string.substring(14, 20).trim()).toEqual('"baz"')
    })

    it("works with nested array strings", () => {
      const string = '["foo", ["foo", "bar", "baz"], "baz"]'
      expect(findArrayElementIndices(string)).toEqual([
        [1, 6],
        [7, 29],
        [30, 36],
      ])
      expect(string.substring(1, 6).trim()).toEqual('"foo"')
      expect(string.substring(7, 29).trim()).toEqual('["foo", "bar", "baz"]')
      expect(string.substring(30, 36).trim()).toEqual('"baz"')
    })

    it("works with nested array and object strings with strange spacing", () => {
      const string =
        '["foo", { "foo": ["bar"], "baz": ["acme"] }, [ "foo" , "bar" ]    ]'
      expect(findArrayElementIndices(string)).toEqual([
        [1, 6],
        [7, 43],
        [44, 66],
      ])
      expect(string.substring(1, 6).trim()).toEqual('"foo"')
      expect(string.substring(7, 43).trim()).toEqual(
        '{ "foo": ["bar"], "baz": ["acme"] }',
      )
      expect(string.substring(44, 66).trim()).toEqual('[ "foo" , "bar" ]')
    })
  })
})
