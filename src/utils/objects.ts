const removeNullObjectValues = (obj: object): object =>
  Object.entries(obj || {}).reduce(
    (a, [k, v]) => (v === null ? a : ((a[k] = v), a)),
    {},
  );

export const subtractObjects = <K extends PropertyKey>(
  objA: Record<K, number>,
  objB: Record<K, number>,
) =>
  (Object.keys(removeNullObjectValues(objA)) as K[]).reduce((a, k) => {
    a[k] = objA[k] - objB[k];
    return a;
  }, {} as { [P in K]: number });

export const getMinValueFromObjectValues = (obj: object): number =>
  Math.min(...Object.values(removeNullObjectValues(obj) || {}));

export const checkIfNumberExistsInObjectValues = (
  obj: object,
  value: number,
): boolean => Object.values(obj || {}).some((element) => element === value);
