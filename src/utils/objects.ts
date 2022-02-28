export const removeNullObjectValues = (obj: Record<string, unknown>) =>
  Object.entries(obj).reduce(
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
  Math.min(...Object.values(obj || {}).filter((value) => !!value));

export const checkValueExistsInObjectValues = (
  obj: object,
  value: any,
): boolean => Object.values(obj || {}).some((element) => element === value);

export const isObjectEmpty = (obj: Record<string, unknown>) =>
  obj &&
  Object.keys(obj).length === 0 &&
  Object.getPrototypeOf(obj) === Object.prototype;
