export const removeNullObjectValues = (obj: Record<string, unknown>) =>
  Object.entries(obj).reduce(
    (a, [k, v]) => (v === null ? a : ((a[k] = v), a)),
    {},
  );

export interface SimpleObject {
  [key: string]: number;
}

// TODO: Use TypeScript generics for objA, objB and return
export const subtractObjects = <T extends SimpleObject>(objA: T, objB: T) =>
  Object.keys(objA).reduce<SimpleObject>((a, k) => {
    a[k] = (objA[k] ?? 0) - (objB[k] ?? 0);
    return a;
  }, {});

export const getMinValueFromObjectValues = (obj: SimpleObject): number =>
  Math.min(...Object.values(obj || {}).filter((value) => !!value));

export const isObjectEmpty = (obj: Record<string, unknown>) =>
  obj &&
  Object.keys(obj).length === 0 &&
  Object.getPrototypeOf(obj) === Object.prototype;
