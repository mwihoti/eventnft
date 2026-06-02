pub type AttendeeMetadata {
  name: ByteArray,
  image: ByteArray,
  event_name: ByteArray,
  event_date: ByteArray,
  venue: ByteArray,
  location: ByteArray,
  attendee_number: Int,
  tier: ByteArray,
  attended_count: Int,
  perks: List<ByteArray>,
  graffiti_image: ByteArray,
  edition: ByteArray,
  shareable: Bool,
  poster_embedded: Bool,
  version: Int,
}

pub type ReferenceAction {
  UpdateMetadata { new_metadata: AttendeeMetadata }
  BurnTokens
}

pub type MintAction {
  MintAttendance { attendee_number: Int }
  BurnAttendance
}
