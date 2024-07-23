/**
 * Predicate with type guard, used to filter out null or undefined values
 * in a filter operation.
 */
// eslint-disable-next-line prefer-arrow/prefer-arrow-functions
export function notNullOrUndefined<T>(val: T | undefined | null): val is T {
  return val !== undefined && val !== null;
}
