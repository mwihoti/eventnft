const MAX_SUPPLY = 200;

export function buildAttendeeMetadata(attendeeNumber: number) {
  const attendedCount = 1;
  const attendeeId = attendeeNumber.toString().padStart(3, '0');
  const tier =
    attendedCount >= 10
      ? 'Legend'
      : attendedCount >= 7
        ? 'OG'
        : attendedCount >= 3
          ? 'Regular'
          : 'Newcomer';

  return {
    name: `BCN Meetup - Attendee #${attendeeId}`,
    image: 'ipfs://REPLACE_WITH_ACTUAL_PNG_CID',
    event_name: 'Community Meetup',
    event_date: 'June 15 - 2025',
    venue: 'Blockchain Centre NBO',
    location: 'Argwings Kodhek Rd, Nairobi',
    attendee_number: attendeeNumber,
    tier,
    attended_count: attendedCount,
    perks: [],
    graffiti_image: 'ipfs://REPLACE_WITH_ACTUAL_SVG_CID',
    edition: `#${attendeeId} of ${MAX_SUPPLY}`,
    shareable: true,
    poster_embedded: true,
    version: 1,
  };
}
