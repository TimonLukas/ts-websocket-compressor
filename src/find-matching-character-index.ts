export const FIND_MATCHING_CHARACTER_INDEX_INVALID_CHARACTER = -1;

export function findMatchingCharacterIndex(
  haystack: string,
  openingCharacterIndex: number,
): number {
  if (openingCharacterIndex < 0) {
    throw new Error(
      `Expected findMatchingCharacterIndex(haystack, openingCharacterIndex) => openingCharacterIndex == ${openingCharacterIndex} > 0`,
    );
  }

  if (openingCharacterIndex >= haystack.length) {
    throw new Error(
      `Expected findMatchingCharacterIndex(haystack, openingCharacterIndex) => openingCharacterIndex == ${openingCharacterIndex} <= haystack.length == ${haystack.length}`,
    );
  }

  const characterMatchStack = [];
  let isCurrentlyInString = false;
  let isCurrentlyEscaping = false;

  for (let i = openingCharacterIndex; i < haystack.length; i++) {
    switch (haystack[i]) {
      case "{": {
        if (!isCurrentlyInString) {
          characterMatchStack.push("{");
        }
        break;
      }
      case "}": {
        if (!isCurrentlyInString) {
          const lastStackElement = characterMatchStack.at(-1);
          if (lastStackElement === "{") {
            characterMatchStack.pop();
          }
        }
        break;
      }
      case "[": {
        if (!isCurrentlyInString) {
          characterMatchStack.push("[");
        }
        break;
      }
      case "]": {
        if (!isCurrentlyInString) {
          const lastStackElement = characterMatchStack.at(-1);
          if (lastStackElement === "[") {
            characterMatchStack.pop();
          }
        }
        break;
      }
      case '"': {
        if (isCurrentlyEscaping) {
          isCurrentlyEscaping = false;
          break;
        }

        const lastStackElement = characterMatchStack.at(-1);
        if (lastStackElement === '"') {
          characterMatchStack.pop();
          isCurrentlyInString = false;
          break;
        }
        characterMatchStack.push('"');
        isCurrentlyInString = true;
        break;
      }
      case "\\": {
        if (isCurrentlyEscaping) {
          isCurrentlyEscaping = false;
          break;
        }

        isCurrentlyEscaping = true;
        break;
      }
      default: {
        if (isCurrentlyEscaping) {
          isCurrentlyEscaping = false;
        }
        break;
      }
    }

    if (characterMatchStack.length === 0) {
      return i;
    }
  }

  return FIND_MATCHING_CHARACTER_INDEX_INVALID_CHARACTER;
}
