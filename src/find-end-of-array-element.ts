export const FIND_END_OF_ARRAY_ELEMENT_INDEX_INVALID_CHARACTER = -1

export function findEndOfArrayElement(haystack: string, arrayElementCharacterIndex: number): number {
    if (arrayElementCharacterIndex < 0) {
        throw new Error(`Expected findEndOfArrayElement(haystack, arrayElementCharacterIndex) => arrayElementCharacterIndex == ${arrayElementCharacterIndex} > 0`)
    }

    if (arrayElementCharacterIndex >= haystack.length) {
        throw new Error(`Expected findEndOfArrayElement(haystack, arrayElementCharacterIndex) => arrayElementCharacterIndex == ${arrayElementCharacterIndex} <= haystack.length == ${haystack.length}`)
    }

    const characterMatchStack = []
    let isCurrentlyInString = false
    let isCurrentlyEscaping = false

    for (let i = arrayElementCharacterIndex; i < haystack.length; i++) {
        switch (haystack[i]) {
            case "{": {
                if (!isCurrentlyInString) {
                    characterMatchStack.push("{")
                }
                break
            }
            case "}": {
                if (!isCurrentlyInString) {
                    const lastStackElement = characterMatchStack.at(-1)
                    if (lastStackElement === "{") {
                        characterMatchStack.pop()
                    }
                }
                break
            }
            case "[": {
                if (!isCurrentlyInString) {
                    characterMatchStack.push("[")
                }
                break
            }
            case "]": {
                if (!isCurrentlyInString) {
                    const lastStackElement = characterMatchStack.at(-1)

                    if (characterMatchStack.length === 0) {
                        if (["[", ","].includes(haystack[i - 1] ?? "")) {
                            return FIND_END_OF_ARRAY_ELEMENT_INDEX_INVALID_CHARACTER
                        }

                        return i
                    }

                    if (lastStackElement === "[") {
                        characterMatchStack.pop()
                    }
                }
                break
            }
            case '"': {
                if (isCurrentlyEscaping) {
                    isCurrentlyEscaping = false
                    break
                }

                const lastStackElement = characterMatchStack.at(-1)
                if (lastStackElement === '"') {
                    characterMatchStack.pop()
                    isCurrentlyInString = false
                    break
                }
                characterMatchStack.push('"')
                isCurrentlyInString = true
                break
            }
            case "\\": {
                if (isCurrentlyEscaping) {
                    isCurrentlyEscaping = false
                    break
                }

                isCurrentlyEscaping = true
                break
            }
            case ",": {
                if (isCurrentlyEscaping) {
                    isCurrentlyEscaping = false
                }

                if (characterMatchStack.length === 0) {
                    return i
                }

                break
            }
            default: {
                if (i === haystack.length - 1) {
                    return FIND_END_OF_ARRAY_ELEMENT_INDEX_INVALID_CHARACTER
                }

                if (isCurrentlyEscaping) {
                    isCurrentlyEscaping = false
                }
                break
            }
        }
    }

    return FIND_END_OF_ARRAY_ELEMENT_INDEX_INVALID_CHARACTER
}
