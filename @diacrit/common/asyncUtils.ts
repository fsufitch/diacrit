export const isIterable = (obj: unknown): boolean => !!(obj as never)[Symbol.iterator];
export const isAsyncIterable = (obj: unknown): boolean =>
  !!(obj as never)[Symbol.asyncIterator];

export function setOf<T>(iter: Iterable<T>): Set<T>;
export function setOf<T>(iter: AsyncIterable<T>): Promise<Set<T>>;
export function setOf<T>(
  iter: Iterable<T> | AsyncIterable<T>
): Set<T> | Promise<Set<T>> {
  switch (true) {
    case isIterable(iter):
      return new Set(iter as Iterable<T>);
    case isAsyncIterable(iter):
      return (async (aiter: AsyncIterable<T>) => {
        const s = new Set<T>();
        for await (const it of aiter) {
          s.add(it);
        }
        return s;
      })(iter as AsyncIterable<T>);
  }
  throw `input was not iterable or async iterable`;
}
