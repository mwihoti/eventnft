type AttendeeDatumInput = {
  name: string;
  image: string;
  mediaType: string;
  event_name: string;
  event_date: string;
  venue: string;
  location: string;
  attendee_number: number;
  tier: string;
  attended_count: number;
  perks: string[];
  graffiti_image: string;
  edition: string;
  shareable: boolean;
  poster_embedded: boolean;
  version: number;
};

// Build the CIP-68 reference-token datum in Mesh "Mesh" Data format:
//   Constr 0 [ metadata (Map), version (Int), extra (Constr) ]
// `metadata` is the standard CIP-68 display map that wallets read; `extra`
// carries the typed app fields the Aiken validator enforces on UpdateMetadata.
export function buildAttendeeDatum(metadata: AttendeeDatumInput) {
  const displayMap = new Map<string, unknown>();
  displayMap.set('name', chunk(metadata.name));
  displayMap.set('image', chunk(metadata.image));
  displayMap.set('mediaType', chunk(metadata.mediaType));
  displayMap.set('description', chunk(`Attendee #${metadata.attendee_number} — ${metadata.event_name}`));
  displayMap.set('event_name', chunk(metadata.event_name));
  displayMap.set('event_date', chunk(metadata.event_date));
  displayMap.set('venue', chunk(metadata.venue));
  displayMap.set('location', chunk(metadata.location));
  displayMap.set('tier', chunk(metadata.tier));
  displayMap.set('edition', chunk(metadata.edition));
  displayMap.set('graffiti_image', chunk(metadata.graffiti_image));

  const extra = {
    alternative: 0,
    fields: [
      metadata.attendee_number,
      metadata.event_name,
      metadata.event_date,
      metadata.venue,
      metadata.location,
      metadata.tier,
      metadata.attended_count,
      metadata.perks,
      metadata.edition,
      boolToDatum(metadata.shareable),
      boolToDatum(metadata.poster_embedded),
    ],
  };

  return {
    alternative: 0,
    fields: [displayMap, metadata.version, extra],
  };
}

function boolToDatum(value: boolean) {
  return {
    alternative: value ? 1 : 0,
    fields: [],
  };
}

const MAX_PLUTUS_BYTES = 64;
const encoder = typeof TextEncoder !== 'undefined' ? new TextEncoder() : null;

function byteLength(str: string): number {
  if (encoder) return encoder.encode(str).length;
  return Buffer.byteLength(str, 'utf8');
}

// Plutus data byte strings are capped at 64 bytes on-chain. Longer display
// values must be split into a list of ≤64-byte chunks (same convention CIP-25
// uses), which CIP-68-aware wallets re-concatenate.
function chunk(str: string): string | string[] {
  if (byteLength(str) <= MAX_PLUTUS_BYTES) return str;
  const chunks: string[] = [];
  let current = '';
  for (const ch of str) {
    if (byteLength(current + ch) > MAX_PLUTUS_BYTES) {
      chunks.push(current);
      current = ch;
    } else {
      current += ch;
    }
  }
  if (current) chunks.push(current);
  return chunks;
}
