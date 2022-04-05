export const convertMaptoJson = (map: Map<any, any>) => Object.fromEntries(map);

export const convertObjectEntriesToMap = (obj: Record<any, any>) =>
  new Map(Object.entries(obj));

export const parseMap = (obj: string) =>
  convertObjectEntriesToMap(JSON.parse(obj));

export const serializeMap = (map: Map<any, any>) =>
  JSON.stringify(convertMaptoJson(map));
