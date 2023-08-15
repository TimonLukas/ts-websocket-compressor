import { describe, expect, it } from "vitest"

import {
  FIND_MATCHING_CHARACTER_INDEX_INVALID_CHARACTER,
  findMatchingCharacterIndex,
} from "../find-matching-character-index.js"

describe("findMatchingCharacterIndex(haystack, openingCharacterIndex)", () => {
  describe("with non-nested matching characters", () => {
    it("matches paired curly brackets correctly", () => {
      expect(findMatchingCharacterIndex("{}", 0)).toEqual(1)
      expect("{}".at(1)).toEqual("}")
      expect(findMatchingCharacterIndex("{foo}", 0)).toEqual(4)
      expect("{foo}".at(4)).toEqual("}")
      expect(findMatchingCharacterIndex("{ true }", 0)).toEqual(7)
      expect("{ true }".at(7)).toEqual("}")

      expect(findMatchingCharacterIndex("foo{}", 3)).toEqual(4)
      expect("foo{}".at(4)).toEqual("}")
      expect(findMatchingCharacterIndex("foo{foo}", 3)).toEqual(7)
      expect("foo{foo}".at(7)).toEqual("}")
      expect(findMatchingCharacterIndex("foo{ true }", 3)).toEqual(10)
      expect("foo{ true }".at(10)).toEqual("}")

      expect(findMatchingCharacterIndex("{}{}", 0)).toEqual(1)
      expect("{}{}".at(1)).toEqual("}")
      expect(findMatchingCharacterIndex("{foo}{foo}", 0)).toEqual(4)
      expect("{foo}{foo}".at(4)).toEqual("}")
      expect(findMatchingCharacterIndex("{ true }{ true }", 0)).toEqual(7)
      expect("{ true }{ true }".at(7)).toEqual("}")

      expect(findMatchingCharacterIndex("foo{}foo{}", 3)).toEqual(4)
      expect("foo{}foo{}".at(4)).toEqual("}")
      expect(findMatchingCharacterIndex("foo{foo}foo{foo}", 3)).toEqual(7)
      expect("foo{foo}foo{foo}".at(7)).toEqual("}")
      expect(findMatchingCharacterIndex("foo{ true }foo { true }", 3)).toEqual(
        10,
      )
      expect("foo{ true }foo { true }".at(10)).toEqual("}")
    })

    it("matches paired square brackets correctly", () => {
      expect(findMatchingCharacterIndex("[]", 0)).toEqual(1)
      expect("[]".at(1)).toEqual("]")
      expect(findMatchingCharacterIndex("[foo]", 0)).toEqual(4)
      expect("[foo]".at(4)).toEqual("]")
      expect(findMatchingCharacterIndex("[ true ]", 0)).toEqual(7)
      expect("[ true ]".at(7)).toEqual("]")

      expect(findMatchingCharacterIndex("foo[]", 3)).toEqual(4)
      expect("foo[]".at(4)).toEqual("]")
      expect(findMatchingCharacterIndex("foo[foo]", 3)).toEqual(7)
      expect("foo[foo]".at(7)).toEqual("]")
      expect(findMatchingCharacterIndex("foo[ true ]", 3)).toEqual(10)
      expect("foo[ true ]".at(10)).toEqual("]")

      expect(findMatchingCharacterIndex("[][]", 0)).toEqual(1)
      expect("[][]".at(1)).toEqual("]")
      expect(findMatchingCharacterIndex("[foo][foo]", 0)).toEqual(4)
      expect("[foo][foo]".at(4)).toEqual("]")
      expect(findMatchingCharacterIndex("[ true ][ true ]", 0)).toEqual(7)
      expect("[ true ][ true ]".at(7)).toEqual("]")

      expect(findMatchingCharacterIndex("foo[]foo[]", 3)).toEqual(4)
      expect("foo[]foo[]".at(4)).toEqual("]")
      expect(findMatchingCharacterIndex("foo[foo]foo[foo]", 3)).toEqual(7)
      expect("foo[foo]foo[foo]".at(7)).toEqual("]")
      expect(findMatchingCharacterIndex("foo[ true ]foo[ true ]", 3)).toEqual(
        10,
      )
      expect("foo[ true ]foo[ true ]".at(10)).toEqual("]")
    })

    it("matches paired double quotation marks correctly", () => {
      expect(findMatchingCharacterIndex('""', 0)).toEqual(1)
      expect('""'.at(1)).toEqual('"')
      expect(findMatchingCharacterIndex('"foo"', 0)).toEqual(4)
      expect('"foo"'.at(4)).toEqual('"')
      expect(findMatchingCharacterIndex('" true "', 0)).toEqual(7)
      expect('" true "'.at(7)).toEqual('"')

      expect(findMatchingCharacterIndex('foo""', 3)).toEqual(4)
      expect('foo""'.at(4)).toEqual('"')
      expect(findMatchingCharacterIndex('foo"foo"', 3)).toEqual(7)
      expect('foo"foo"'.at(7)).toEqual('"')
      expect(findMatchingCharacterIndex('foo" true "', 3)).toEqual(10)
      expect('foo" true "'.at(10)).toEqual('"')

      expect(findMatchingCharacterIndex('""""', 0)).toEqual(1)
      expect('""""'.at(1)).toEqual('"')
      expect(findMatchingCharacterIndex('"foo""foo"', 0)).toEqual(4)
      expect('"foo""foo"'.at(4)).toEqual('"')
      expect(findMatchingCharacterIndex('" true "" true "', 0)).toEqual(7)
      expect('" true "" true "'.at(7)).toEqual('"')

      expect(findMatchingCharacterIndex('foo""foo""', 3)).toEqual(4)
      expect('foo""foo""'.at(4)).toEqual('"')
      expect(findMatchingCharacterIndex('foo"foo"foo"foo"', 3)).toEqual(7)
      expect('foo"foo"foo"foo"'.at(7)).toEqual('"')
      expect(findMatchingCharacterIndex('foo" true "foo" true "', 3)).toEqual(
        10,
      )
      expect('foo" true "foo" true "'.at(10)).toEqual('"')
    })
  })

  describe("with non-nested non-matching characters", () => {
    it("matches non-paired curly brackets as invalid", () => {
      expect(findMatchingCharacterIndex("{", 0)).toEqual(
        FIND_MATCHING_CHARACTER_INDEX_INVALID_CHARACTER,
      )
      expect(findMatchingCharacterIndex("{foo", 0)).toEqual(
        FIND_MATCHING_CHARACTER_INDEX_INVALID_CHARACTER,
      )
      expect(findMatchingCharacterIndex("foo{", 3)).toEqual(
        FIND_MATCHING_CHARACTER_INDEX_INVALID_CHARACTER,
      )
    })

    it("matches non-paired curly brackets as invalid", () => {
      expect(findMatchingCharacterIndex("[", 0)).toEqual(
        FIND_MATCHING_CHARACTER_INDEX_INVALID_CHARACTER,
      )
      expect(findMatchingCharacterIndex("[foo", 0)).toEqual(
        FIND_MATCHING_CHARACTER_INDEX_INVALID_CHARACTER,
      )
      expect(findMatchingCharacterIndex("foo[", 3)).toEqual(
        FIND_MATCHING_CHARACTER_INDEX_INVALID_CHARACTER,
      )
    })

    it("matches non-paired curly brackets as invalid", () => {
      expect(findMatchingCharacterIndex('"', 0)).toEqual(
        FIND_MATCHING_CHARACTER_INDEX_INVALID_CHARACTER,
      )
      expect(findMatchingCharacterIndex('"foo', 0)).toEqual(
        FIND_MATCHING_CHARACTER_INDEX_INVALID_CHARACTER,
      )
      expect(findMatchingCharacterIndex('foo"', 3)).toEqual(
        FIND_MATCHING_CHARACTER_INDEX_INVALID_CHARACTER,
      )
    })
  })

  describe("with nested matching characters", () => {
    it("matches paired curly brackets with nested quotation marks", () => {
      expect(findMatchingCharacterIndex('{"foo"}', 0)).toEqual(6)
      expect('{"foo"}'.at(6)).toEqual("}")
      expect(findMatchingCharacterIndex('{"foo": "bar"}', 0)).toEqual(13)
      expect('{"foo": "bar"}'.at(13)).toEqual("}")
      expect(
        findMatchingCharacterIndex('{"foo": "bar", "baz": true}', 0),
      ).toEqual(26)
      expect('{"foo": "bar", "baz": true}'.at(26)).toEqual("}")
    })

    it("matches paired curly brackets with nested square brackets", () => {
      expect(findMatchingCharacterIndex("{[], [[]]}", 0)).toEqual(9)
      expect("{[], [[]]}".at(9)).toEqual("}")
    })

    it("matches deeply-nested objects", () => {
      expect(
        findMatchingCharacterIndex(
          '{ "foo": [true, false, { "baz": "\\"\\"" }]}',
          0,
        ),
      ).toEqual(41)
      expect('{ "foo": [true, false, { "baz": "\\"\\"" }]}'.at(41)).toEqual("}")
      expect(
        findMatchingCharacterIndex(
          '{ "foo": [true, false, { "baz": "\\"\\"" }]}',
          2,
        ),
      ).toEqual(6)
      expect('{ "foo": [true, false, { "baz": "\\"\\"" }]}'.at(6)).toEqual('"')
      expect(
        findMatchingCharacterIndex(
          '{ "foo": [true, false, { "baz": "\\"\\"" }]}',
          9,
        ),
      ).toEqual(40)
      expect('{ "foo": [true, false, { "baz": "\\"\\"" }]}'.at(40)).toEqual("]")
    })
  })

  describe("with complex strings", () => {
    it("doesn't try to match brackets inside of a string", () => {
      expect(findMatchingCharacterIndex('"{"', 0)).toEqual(2)
      expect('"{"'.at(2)).toEqual('"')
      expect(findMatchingCharacterIndex('"["', 0)).toEqual(2)
      expect('"["'.at(2)).toEqual('"')

      expect(findMatchingCharacterIndex('"{} {{}}"', 0)).toEqual(8)
      expect('"{} {{}}"'.at(8)).toEqual('"')
      expect(findMatchingCharacterIndex('"[] [[]]"', 0)).toEqual(8)
      expect('"[] [[]]"'.at(8)).toEqual('"')
    })

    it("ignores escaped quotation marks", () => {
      expect(findMatchingCharacterIndex('"\\""', 0)).toEqual(3)
      expect('"\\""'.at(3)).toEqual('"')
      expect(findMatchingCharacterIndex('["\\""]', 0)).toEqual(5)
      expect('["\\""]'.at(5)).toEqual("]")
    })

    it("correctly handles double-backslashes", () => {
      expect(findMatchingCharacterIndex('"\\\\"', 0)).toEqual(3)
      expect('"\\\\"'.at(3)).toEqual('"')
    })

    it("ignores escaped characters", () => {
      expect(findMatchingCharacterIndex('"\\n"', 0)).toEqual(3)
      expect('"\\n"'.at(3)).toEqual('"')
    })
  })
})
