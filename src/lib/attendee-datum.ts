type AttendeeDatumInput = {
  name: string;
  image: string;
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

export function buildAttendeeDatum(metadata: AttendeeDatumInput) {
  return {
    alternative: 0,
    fields: [
      metadata.name,
      metadata.image,
      metadata.event_name,
      metadata.event_date,
      metadata.venue,
      metadata.location,
      metadata.attendee_number,
      metadata.tier,
      metadata.attended_count,
      metadata.perks,
      metadata.graffiti_image,
      metadata.edition,
      boolToDatum(metadata.shareable),
      boolToDatum(metadata.poster_embedded),
      metadata.version,
    ],
  };
}

function boolToDatum(value: boolean) {
  return {
    alternative: value ? 1 : 0,
    fields: [],
  };
}
