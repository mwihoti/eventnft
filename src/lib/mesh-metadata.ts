export function normalizeMeshMetadata<T>(value: T): T {
  return normalizeMeshMetadataValue(value) as T;
}

// CIP-25 caps each metadatum string at 64 UTF-8 bytes. Longer strings must
// be split into an array of ≤64-byte chunks so the wallet/node will accept
// the metadata. Recursive over objects/arrays so receiver/preview/etc. get
// chunked wherever they appear.
export function chunkCip25Metadata<T>(value: T): T {
  return chunkCip25Value(value) as T;
}

const MAX_METADATUM_BYTES = 64;
const encoder = typeof TextEncoder !== 'undefined' ? new TextEncoder() : null;

function byteLength(str: string): number {
  if (encoder) return encoder.encode(str).length;
  return Buffer.byteLength(str, 'utf8');
}

function chunkString(str: string): string | string[] {
  if (byteLength(str) <= MAX_METADATUM_BYTES) return str;
  const chunks: string[] = [];
  let current = '';
  for (const ch of str) {
    if (byteLength(current + ch) > MAX_METADATUM_BYTES) {
      chunks.push(current);
      current = ch;
    } else {
      current += ch;
    }
  }
  if (current) chunks.push(current);
  return chunks;
}

function chunkCip25Value(value: any): any {
  if (typeof value === 'string') return chunkString(value);
  if (Array.isArray(value)) return value.map(chunkCip25Value);
  if (value && typeof value === 'object' && !(value instanceof Uint8Array) && !(value instanceof Map)) {
    return Object.fromEntries(
      Object.entries(value).map(([k, v]) => [k, chunkCip25Value(v)]),
    );
  }
  return value;
}

function normalizeMeshMetadataValue(value: any): any {
  if (value === null || value === undefined) {
    return undefined;
  }

  if (typeof value === 'boolean') {
    return value ? 1 : 0;
  }

  if (
    typeof value === 'string' ||
    typeof value === 'number' ||
    typeof value === 'bigint' ||
    value instanceof Uint8Array
  ) {
    return value;
  }

  if (Array.isArray(value)) {
    return value
      .map((item) => normalizeMeshMetadataValue(item))
      .filter((item) => item !== undefined);
  }

  if (value instanceof Map) {
    const map = new Map();

    value.forEach((mapValue, mapKey) => {
      const normalizedKey = normalizeMeshMetadataValue(mapKey);
      const normalizedValue = normalizeMeshMetadataValue(mapValue);

      if (normalizedKey !== undefined && normalizedValue !== undefined) {
        map.set(normalizedKey, normalizedValue);
      }
    });

    return map;
  }

  if (typeof value === 'object') {
    return Object.fromEntries(
      Object.entries(value)
        .map(([key, entryValue]) => [key, normalizeMeshMetadataValue(entryValue)] as const)
        .filter(([, entryValue]) => entryValue !== undefined),
    );
  }

  throw new Error('Unsupported metadata type.');
}
