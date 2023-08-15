import { describe, expect, it } from "vitest"

import { FIND_MATCHING_CHARACTER_INDEX_INVALID_CHARACTER, findMatchingCharacterIndex } from "../find-matching-character-index.js"

describe("findMatchingCharacterIndex(haystack, openingCharacterIndex)", () => {
    describe("with non-nested matching characters", () => {
        it("matches paired curly brackets correctly", () => {
            expect(findMatchingCharacterIndex("{}", 0)).toEqual(1)
            expect(findMatchingCharacterIndex("{foo}", 0)).toEqual(4)
            expect(findMatchingCharacterIndex("{ true }", 0)).toEqual(7)

            expect(findMatchingCharacterIndex("foo{}", 3)).toEqual(4)
            expect(findMatchingCharacterIndex("foo{foo}", 3)).toEqual(7)
            expect(findMatchingCharacterIndex("foo{ true }", 3)).toEqual(10)

            expect(findMatchingCharacterIndex("{}{}", 0)).toEqual(1)
            expect(findMatchingCharacterIndex("{foo}{foo}", 0)).toEqual(4)
            expect(findMatchingCharacterIndex("{ true }{ true }", 0)).toEqual(7)

            expect(findMatchingCharacterIndex("foo{}foo{}", 3)).toEqual(4)
            expect(findMatchingCharacterIndex("foo{foo}foo{foo}", 3)).toEqual(7)
            expect(findMatchingCharacterIndex("foo{ true }foo { true }", 3)).toEqual(10)
        })

        it("matches paired square brackets correctly", () => {
            expect(findMatchingCharacterIndex("[]", 0)).toEqual(1)
            expect(findMatchingCharacterIndex("[foo]", 0)).toEqual(4)
            expect(findMatchingCharacterIndex("[ true ]", 0)).toEqual(7)

            expect(findMatchingCharacterIndex("foo[]", 3)).toEqual(4)
            expect(findMatchingCharacterIndex("foo[foo]", 3)).toEqual(7)
            expect(findMatchingCharacterIndex("foo[ true ]", 3)).toEqual(10)

            expect(findMatchingCharacterIndex("[][]", 0)).toEqual(1)
            expect(findMatchingCharacterIndex("[foo][foo]", 0)).toEqual(4)
            expect(findMatchingCharacterIndex("[ true ][ true ]", 0)).toEqual(7)

            expect(findMatchingCharacterIndex("foo[]foo[]", 3)).toEqual(4)
            expect(findMatchingCharacterIndex("foo[foo]foo[foo]", 3)).toEqual(7)
            expect(findMatchingCharacterIndex("foo[ true ]foo[ true ]", 3)).toEqual(10)
        })

        it("matches paired double quotation marks correctly", () => {
            expect(findMatchingCharacterIndex('""', 0)).toEqual(1)
            expect(findMatchingCharacterIndex('"foo"', 0)).toEqual(4)
            expect(findMatchingCharacterIndex('" true "', 0)).toEqual(7)

            expect(findMatchingCharacterIndex('foo""', 3)).toEqual(4)
            expect(findMatchingCharacterIndex('foo"foo"', 3)).toEqual(7)
            expect(findMatchingCharacterIndex('foo" true "', 3)).toEqual(10)

            expect(findMatchingCharacterIndex('""""', 0)).toEqual(1)
            expect(findMatchingCharacterIndex('"foo""foo"', 0)).toEqual(4)
            expect(findMatchingCharacterIndex('" true "" true "', 0)).toEqual(7)

            expect(findMatchingCharacterIndex('foo""foo""', 3)).toEqual(4)
            expect(findMatchingCharacterIndex('foo"foo"foo"foo"', 3)).toEqual(7)
            expect(findMatchingCharacterIndex('foo" true "foo" true "', 3)).toEqual(10)
        })
    })

    describe("with non-nested non-matching characters", () => {
        it("matches non-paired curly brackets as invalid", () => {
            expect(findMatchingCharacterIndex("{", 0)).toEqual(FIND_MATCHING_CHARACTER_INDEX_INVALID_CHARACTER)
            expect(findMatchingCharacterIndex("{foo", 0)).toEqual(FIND_MATCHING_CHARACTER_INDEX_INVALID_CHARACTER)
            expect(findMatchingCharacterIndex("foo{", 3)).toEqual(FIND_MATCHING_CHARACTER_INDEX_INVALID_CHARACTER)
        })

        it("matches non-paired curly brackets as invalid", () => {
            expect(findMatchingCharacterIndex("[", 0)).toEqual(FIND_MATCHING_CHARACTER_INDEX_INVALID_CHARACTER)
            expect(findMatchingCharacterIndex("[foo", 0)).toEqual(FIND_MATCHING_CHARACTER_INDEX_INVALID_CHARACTER)
            expect(findMatchingCharacterIndex("foo[", 3)).toEqual(FIND_MATCHING_CHARACTER_INDEX_INVALID_CHARACTER)
        })

        it("matches non-paired curly brackets as invalid", () => {
            expect(findMatchingCharacterIndex('"', 0)).toEqual(FIND_MATCHING_CHARACTER_INDEX_INVALID_CHARACTER)
            expect(findMatchingCharacterIndex('"foo', 0)).toEqual(FIND_MATCHING_CHARACTER_INDEX_INVALID_CHARACTER)
            expect(findMatchingCharacterIndex('foo"', 3)).toEqual(FIND_MATCHING_CHARACTER_INDEX_INVALID_CHARACTER)
        })
    })

    describe("with nested matching characters", () => {
        it("matches paired curly brackets with nested quotation marks", () => {
            expect(findMatchingCharacterIndex('{"foo"}', 0)).toEqual(6)
            expect(findMatchingCharacterIndex('{"foo": "bar"}', 0)).toEqual(13)
            expect(findMatchingCharacterIndex('{"foo": "bar", "baz": true}', 0)).toEqual(26)
        })

        it("matches paired curly brackets with nested square brackets", () => {
            expect(findMatchingCharacterIndex("{[], [[]]}", 0)).toEqual(9)
        })

        it("matches deeply-nested objects", () => {
            expect(findMatchingCharacterIndex('{ "foo": [true, false, { "baz": "\\"\\"" }]}', 0)).toEqual(41)
            expect(findMatchingCharacterIndex('{ "foo": [true, false, { "baz": "\\"\\"" }]}', 2)).toEqual(6)
            expect(findMatchingCharacterIndex('{ "foo": [true, false, { "baz": "\\"\\"" }]}', 9)).toEqual(40)
        })
    })

    describe("with complex strings", () => {
        it("doesn't try to match brackets inside of a string", () => {
            expect(findMatchingCharacterIndex('"{"', 0)).toEqual(2)
            expect(findMatchingCharacterIndex('"["', 0)).toEqual(2)

            expect(findMatchingCharacterIndex('"{} {{}}"', 0)).toEqual(8)
            expect(findMatchingCharacterIndex('"[] [[]]"', 0)).toEqual(8)
        })

        it("ignores escaped quotation marks", () => {
            expect(findMatchingCharacterIndex('"\\""', 0)).toEqual(3)
            expect(findMatchingCharacterIndex('["\\""]', 0)).toEqual(5)
        })

        it("correctly handles double-backslashes", () => {
            expect(findMatchingCharacterIndex('"\\\\"', 0)).toEqual(3)
        })

        it("ignores escaped characters", () => {
            expect(findMatchingCharacterIndex('"\\n"', 0)).toEqual(3)
        })
    })
})