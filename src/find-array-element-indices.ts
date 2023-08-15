import {
  FIND_END_OF_ARRAY_ELEMENT_INDEX_INVALID_CHARACTER,
  findEndOfArrayElement,
} from "./find-end-of-array-element.js";

export function findArrayElementIndices(
  haystack: string,
): [start: number, end: number][] {
  if (haystack.at(0) !== "[") {
    throw new Error(
      `findArrayElementIndices(haystack): Expected haystack to begin with "[", got: "${haystack.at(
        0,
      )}"`,
    );
  }

  const elementIndices: [start: number, end: number][] = [];
  // eslint-disable-next-line no-constant-condition
  while (true) {
    const lastElementIndices = elementIndices.at(-1);

    if (typeof lastElementIndices === "undefined") {
      const index = findEndOfArrayElement(haystack, 1);

      if (index === FIND_END_OF_ARRAY_ELEMENT_INDEX_INVALID_CHARACTER) {
        throw new Error(
          `Expected to find end for all elements, got -1 for element #${elementIndices.length}`,
        );
      }

      elementIndices.push([1, index]);
      continue;
    }

    const lastEnd = lastElementIndices[1];
    const nextStart = lastEnd + 1;
    if (nextStart >= haystack.length - 1) {
      return elementIndices;
    }

    const index = findEndOfArrayElement(haystack, nextStart);
    elementIndices.push([nextStart, index]);
  }
}
