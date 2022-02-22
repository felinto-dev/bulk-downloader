interface SimpleObject {
  [key: string]: number;
}

export const subtractObjects = (
  objA: SimpleObject,
  objB: SimpleObject,
): SimpleObject => {
  return Object.keys(objA).reduce((a, k) => {
    a[k] = objA[k] - objB[k];
    return a;
  }, {});
};

export const getMinValueFromObjectValues = (obj: SimpleObject): number => {
  return Math.min(...Object.values(obj).filter((value) => !!value));
};
