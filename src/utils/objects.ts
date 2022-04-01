export const getMinValueFromObjectValues = (obj: object): number =>
  Math.min(...Object.values(obj || {}).filter((v) => v !== null));

export const checkIfNumberExistsInObjectValues = (
  obj: object,
  value: number,
): boolean => Object.values(obj || {}).some((element) => element === value);

export const sumMapValues = <K extends PropertyKey>(map: Map<K, number>) =>
  Array.from(map.values()).reduce((a, v) => a + v, 0);
