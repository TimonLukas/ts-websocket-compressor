/* eslint-disable @typescript-eslint/no-explicit-any */
export function mapToRecord<T, V>(
  map: Map<any, T>,
  valueTransformer?: (value: T) => V,
): Record<string, V>;
export function mapToRecord<T>(
  map: Map<any, T>,
  valueTransformer?: null,
): Record<string, T>;
export function mapToRecord<T, V>(
  map: Map<any, T>,
  valueTransformer: ((value: T) => V) | null = null,
): Record<string, T> | Record<string, V> {
  const record: Record<string, T> | Record<string, V> = {};

  for (const [key, value] of map.entries()) {
    if (valueTransformer === null) {
      record[`${key}`] = value;
    } else {
      record[`${key}`] = valueTransformer(value);
    }
  }

  return record;
}
/* eslint-enable @typescript-eslint/no-explicit-any */

export function setToArray<T>(set: Set<T>): T[] {
  return [...set];
}

export function sleep(timeInMs: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, timeInMs));
}

export function isRecord(value: unknown): boolean {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}
