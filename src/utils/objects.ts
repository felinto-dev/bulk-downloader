export const removeNullObjectValues = (obj: Record<string, unknown>) => {
  return Object.entries(obj).reduce(
    (a, [k, v]) => (v === null ? a : ((a[k] = v), a)),
    {},
  );
};

export interface SimpleObject {
  [key: string]: number;
}

// TODO: Use TypeScript generics for objA, objB and return
export const subtractObjects = (
  objA: SimpleObject,
  objB: SimpleObject,
): SimpleObject => {
  return Object.keys(removeNullObjectValues(objA)).reduce((a, k) => {
    a[k] = objA[k] - objB[k];
    return a;
  }, {});
};

export const getMinValueFromObjectValues = (obj: SimpleObject): number => {
  return Math.min(...Object.values(obj).filter((value) => !!value));
};
