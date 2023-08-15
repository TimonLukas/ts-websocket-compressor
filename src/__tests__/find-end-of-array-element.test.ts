import { describe, expect, it } from "vitest"

import { FIND_END_OF_ARRAY_ELEMENT_INDEX_INVALID_CHARACTER, findEndOfArrayElement } from "../find-end-of-array-element.js"

describe("findEndOfArrayElement(haystack, arrayElementCharacterIndex)", () => {
    describe("with well-formed array strings", () => {
        it("matches primitive values correctly", () => {
            expect(findEndOfArrayElement("[1,2,3]", 1)).toEqual(2)
            expect("[1,2,3]".substring(1, 2)).toEqual("1")
            expect(findEndOfArrayElement("[1,2,3]", 3)).toEqual(4)
            expect("[1,2,3]".substring(3, 4)).toEqual("2")
            expect(findEndOfArrayElement("[1,2,3]", 5)).toEqual(6)
            expect("[1,2,3]".substring(5, 6)).toEqual("3")

            expect(findEndOfArrayElement("[true,false,null]", 1)).toEqual(5)
            expect("[true,false,null]".substring(1, 5)).toEqual("true")
            expect(findEndOfArrayElement("[true,false,null]", 6)).toEqual(11)
            expect("[true,false,null]".substring(6, 11)).toEqual("false")
            expect(findEndOfArrayElement("[true,false,null]", 12)).toEqual(16)
            expect("[true,false,null]".substring(12, 16)).toEqual("null")

            expect(findEndOfArrayElement('["foo","barrington","bazzzuuuuuuor"]', 1)).toEqual(6)
            expect('["foo","barrington","bazzzuuuuuuor"]'.substring(1, 6)).toEqual('"foo"')
            expect(findEndOfArrayElement('["foo","barrington","bazzzuuuuuuor"]', 7)).toEqual(19)
            expect('["foo","barrington","bazzzuuuuuuor"]'.substring(7, 19)).toEqual('"barrington"')
            expect(findEndOfArrayElement('["foo","barrington","bazzzuuuuuuor"]', 20)).toEqual(35)
            expect('["foo","barrington","bazzzuuuuuuor"]'.substring(20, 35)).toEqual('"bazzzuuuuuuor"')
        })

        it("doesn't get confused by parantheses nested in strings", () => {
            expect(findEndOfArrayElement('["[\\"foo\\"]"]', 1)).toEqual(12)
            expect('["[\\"foo\\"]"]'.substring(1, 12)).toEqual('"[\\"foo\\"]"')

            expect(findEndOfArrayElement('["[\\"foo\\"]","[\\"foo\\"]"]', 1)).toEqual(12)
            expect('["[\\"foo\\"]","[\\"foo\\"]"]'.substring(1, 12)).toEqual('"[\\"foo\\"]"')
            expect(findEndOfArrayElement('["[\\"foo\\"]","[\\"foo\\"]"]', 13)).toEqual(24)
            expect('["[\\"foo\\"]","[\\"foo\\"]"]'.substring(13, 24)).toEqual('"[\\"foo\\"]"')
        })

        it("correctly matches nested objects", () => {
            expect(findEndOfArrayElement('["foo",{"bar": true, "baz": false}]', 1)).toEqual(6)
            expect('["foo",{"bar": true, "baz": false}]'.substring(1, 6)).toEqual('"foo"')
            expect(findEndOfArrayElement('["foo",{"bar": true, "baz": false}]', 7)).toEqual(34)
            expect('["foo",{"bar": true, "baz": false}]'.substring(7, 34)).toEqual('{"bar": true, "baz": false}')
        })

        it("correctly matches nested arrays", () => {
            expect(findEndOfArrayElement('["foo",["bar"],"baz"]', 1)).toEqual(6)
            expect('["foo",["bar"],"baz"]'.substring(1, 6)).toEqual('"foo"')
            expect(findEndOfArrayElement('["foo",["bar"],"baz"]', 7)).toEqual(14)
            expect('["foo",["bar"],"baz"]'.substring(7, 14)).toEqual('["bar"]')
            expect(findEndOfArrayElement('["foo",["bar"],"baz"]', 15)).toEqual(20)
            expect('["foo",["bar"],"baz"]'.substring(15, 20)).toEqual('"baz"')
        })
    })

    describe("with malformed array strings", () => {
        it("handles empty arrays correctly", () => {
            expect(findEndOfArrayElement("[]", 0)).toEqual(FIND_END_OF_ARRAY_ELEMENT_INDEX_INVALID_CHARACTER)
        })

        it("handles non-terminated arrays correctly", () => {
            expect(findEndOfArrayElement("[true,false", 7)).toEqual(FIND_END_OF_ARRAY_ELEMENT_INDEX_INVALID_CHARACTER)
        })
    })
})