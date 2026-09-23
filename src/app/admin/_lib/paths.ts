type Branch = Record<string, unknown>;

export function getPath(source: unknown, path: string): unknown {
  return path.split(".").reduce<unknown>((node, key) => {
    if (node === null || typeof node !== "object") return undefined;
    return (node as Branch)[key];
  }, source);
}

function copy(node: unknown, key: string): Branch | unknown[] {
  if (Array.isArray(node)) return [...node];
  if (node !== null && typeof node === "object") return { ...(node as Branch) };
  return /^\d+$/.test(key) ? [] : {};
}

export function setPath<T>(source: T, path: string, value: unknown): T {
  const keys = path.split(".");

  const write = (node: unknown, depth: number): unknown => {
    const key = keys[depth];
    const next = copy(node, key) as Branch;

    next[key] = depth === keys.length - 1 ? value : write(next[key], depth + 1);

    return next;
  };

  return write(source, 0) as T;
}

export function getList(source: unknown, path: string): unknown[] {
  const value = getPath(source, path);
  return Array.isArray(value) ? value : [];
}

export function setList<T>(
  source: T,
  path: string,
  change: (list: unknown[]) => unknown[],
): T {
  return setPath(source, path, change(getList(source, path)));
}

export function move<V>(list: V[], from: number, to: number): V[] {
  if (from === to) return list;

  const next = [...list];
  const [item] = next.splice(from, 1);
  next.splice(to, 0, item);

  return next;
}

export function renumber(list: unknown[], orderKey: string): unknown[] {
  return list.map((item, index) =>
    item !== null && typeof item === "object"
      ? { ...(item as Branch), [orderKey]: index + 1 }
      : item,
  );
}
