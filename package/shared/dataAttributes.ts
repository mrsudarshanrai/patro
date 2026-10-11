type DataAttributes = Record<`data-${string}`, string | number | boolean | undefined>;

const isDataAttribute = (key: string): key is `data-${string}` => key.startsWith('data-');

const splitDataAttributes = <T extends object>(props: T) => {
  const data: DataAttributes = {};
  const rest: Record<string, unknown> = {};
  for (const [key, value] of Object.entries(props)) {
    if (isDataAttribute(key)) data[key] = value as DataAttributes[`data-${string}`];
    else rest[key] = value;
  }
  return { data, rest: rest as T };
};

export { splitDataAttributes };
export type { DataAttributes };
