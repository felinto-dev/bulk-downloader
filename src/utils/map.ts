export const convertMaptoJson = (map: Map<unknown, unknown>) =>
  Object.fromEntries(map);

export const convertMaptoJsonStringify = (map: Map<unknown, unknown>) =>
  JSON.stringify(convertMaptoJson(map));

export const convertObjectEntriesToMap = (obj: Record<string, unknown>) =>
  new Map(Object.entries(obj));

export const convertObjectEntriesInStringToMap = (obj: string) =>
  convertObjectEntriesToMap(JSON.parse(obj));
