// App-specific attendee fields the validator enforces. Stored in the CIP-68
// datum's `extra` field (the third element), which wallets ignore — so the
// display attributes in `metadata` stay standards-compliant while the contract
// keeps the typed data it needs for the UpdateMetadata rules.
pub type AttendeeExtra {
  attendee_number: Int,
  event_name: ByteArray,
  event_date: ByteArray,
  venue: ByteArray,
  location: ByteArray,
  tier: ByteArray,
  attended_count: Int,
  perks: List<ByteArray>,
  edition: ByteArray,
  shareable: Bool,
  poster_embedded: Bool,
}

// CIP-68 datum metadata standard: Constr 0 [ metadata, version, extra ].
// `metadata` is a map (Aiken `Pairs` serializes to a Plutus data Map) of the
// display attributes — name, image, mediaType, … — which is what CIP-68
// wallets read to render the NFT.
pub type Cip68Datum {
  metadata: Pairs<ByteArray, Data>,
  version: Int,
  extra: AttendeeExtra,
}

pub type ReferenceAction {
  UpdateMetadata { new_metadata: Cip68Datum }
  BurnTokens
}

pub type MintAction {
  MintAttendance { attendee_number: Int }
  BurnAttendance
}
