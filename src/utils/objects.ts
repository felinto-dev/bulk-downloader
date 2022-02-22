export const sanitizeObject = (obj: Record<string, unknown>) => {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  return Object.fromEntries(Object.entries(obj).filter(([_, v]) => v != null));
};

export interface SimpleObject {
  [key: string]: number;
}

// TODO: Use TypeScript generics for objA, objB and return
export const subtractObjects = (
  objA: SimpleObject,
  objB: SimpleObject,
): SimpleObject => {
  return Object.keys(sanitizeObject(objA)).reduce((a, k) => {
    a[k] = objA[k] - objB[k];
    return a;
  }, {});
};

export const getMinValueFromObjectValues = (obj: SimpleObject): number => {
  return Math.min(...Object.values(obj).filter((value) => !!value));
};
