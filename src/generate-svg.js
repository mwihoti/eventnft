/**
 * Deterministic graffiti SVG generator for BCN Meetup
 */

const PALETTES = [
  { main: '#FF0055', accent: '#00FFCC', bg: '#0F0F0F' }, // Neon Pink / Teal
  { main: '#FFCC00', accent: '#5500FF', bg: '#0F0F0F' }, // Gold / Purple
  { main: '#00FFAA', accent: '#FF00AA', bg: '#0F0F0F' }, // Mint / Magenta
  { main: '#00CCFF', accent: '#FF6600', bg: '#0F0F0F' }, // Sky / Orange
  { main: '#AAFF00', accent: '#AA00FF', bg: '#0F0F0F' }, // Lime / Violet
  { main: '#FFFFFF', accent: '#FF3333', bg: '#0F0F0F' }, // White / Red
];

const TIER_COLORS = {
  'Newcomer': '#00FF00',
  'Regular': '#BF40BF',
  'OG': '#FFBF00',
  'Legend': '#FF0000',
};

function seededRand(seed, index) {
  const x = Math.sin(seed * 9301 + index * 49297 + 233) * 10000;
  return x - Math.floor(x);
}

function escapeXml(value) {
  return String(value)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

export function generateSVG(attendeeNumber, attendedCount = 1, attendeeName = '') {
  const seed = attendeeNumber + 12345;
  const palette = PALETTES[attendeeNumber % PALETTES.length];
  const displayName = escapeXml(attendeeName.trim().slice(0, 32));
  
  let tier = 'Newcomer';
  if (attendedCount >= 10) tier = 'Legend';
  else if (attendedCount >= 7) tier = 'OG';
  else if (attendedCount >= 3) tier = 'Regular';

  const tierColor = TIER_COLORS[tier];

  // Generate spray dots
  let sprayDots = '';
  for (let i = 0; i < 40; i++) {
    const x = seededRand(seed, i * 2) * 800;
    const y = seededRand(seed, i * 2 + 1) * 300; // Top area
    const r = seededRand(seed, i * 3) * 3 + 1;
    const opacity = seededRand(seed, i * 4) * 0.6 + 0.2;
    sprayDots += `<circle cx="${x}" cy="${y}" r="${r}" fill="${palette.accent}" fill-opacity="${opacity}" />`;
  }

  // Generate drips for "NAIROBI"
  let drips = '';
  const letters = "NAIROBI";
  const startX = 140;
  const spacing = 85;
  for (let i = 0; i < letters.length; i++) {
    const dripLen = seededRand(seed, i + 50) * 60 + 20;
    const dripX = startX + i * spacing + 30;
    drips += `<rect x="${dripX}" y="110" width="4" height="${dripLen}" fill="${palette.main}" rx="2" />`;
    drips += `<circle cx="${dripX + 2}" cy="${110 + dripLen}" r="4" fill="${palette.main}" />`;
  }

  return `
<svg width="800" height="1120" viewBox="0 0 800 1120" xmlns="http://www.w3.org/2000/svg">
  <rect width="800" height="1120" fill="${palette.bg}" />
  
  <!-- Spray Accents -->
  <g>${sprayDots}</g>
  
  <!-- Top Zone: Graffiti -->
  <g transform="translate(400, 100)" text-anchor="middle">
    ${drips}
    <text y="0" font-family="Impact, sans-serif" font-size="120" fill="${palette.main}" style="letter-spacing: 5px;">NAIROBI</text>
    <text y="50" font-family="Arial, sans-serif" font-size="24" fill="${palette.accent}" font-weight="bold" style="letter-spacing: 12px;">WEB3 DAO</text>
  </g>

  <!-- Dashed Divider -->
  <line x1="100" y1="180" x2="700" y2="180" stroke="${palette.accent}" stroke-width="2" stroke-dasharray="10,10" opacity="0.5" />

  <!-- Centre: Event Poster -->
  <g transform="translate(100, 220)">
    <rect width="600" height="650" fill="#1A1A1A" stroke="${palette.accent}" stroke-width="4" rx="10" />
    
    <!-- Tacks -->
    <circle cx="15" cy="15" r="8" fill="#D4AF37" />
    <circle cx="585" cy="15" r="8" fill="#D4AF37" />
    <circle cx="15" cy="635" r="8" fill="#D4AF37" />
    <circle cx="585" cy="635" r="8" fill="#D4AF37" />

    <!-- Cardano Logo Pattern (6 dots) -->
    <g transform="translate(300, 100)">
      <circle r="30" fill="none" stroke="${palette.main}" stroke-width="2" />
      <circle cx="0" cy="-20" r="4" fill="${palette.main}" />
      <circle cx="17.3" cy="-10" r="4" fill="${palette.main}" />
      <circle cx="17.3" cy="10" r="4" fill="${palette.main}" />
      <circle cx="0" cy="20" r="4" fill="${palette.main}" />
      <circle cx="-17.3" cy="10" r="4" fill="${palette.main}" />
      <circle cx="-17.3" cy="-10" r="4" fill="${palette.main}" />
    </g>

    <text x="300" y="180" text-anchor="middle" font-family="Arial, sans-serif" font-size="42" fill="white" font-weight="bold">COMMUNITY MEETUP</text>
    <text x="300" y="230" text-anchor="middle" font-family="Arial, sans-serif" font-size="24" fill="${palette.main}">June 15 · 2025</text>
    
    <g transform="translate(60, 280)" font-family="Arial, sans-serif" font-size="18" fill="#CCCCCC">
      <text y="0" font-weight="bold" fill="white">VENUE</text>
      <text y="30">Blockchain Centre NBO, Argwings Kodhek Rd, Nairobi</text>
      
      <text y="80" font-weight="bold" fill="white">SPEAKERS</text>
      <text y="110">Ada Okonkwo · Kwame Asante</text>
      <text y="135">Amina Wanjiku · Dev Patel</text>
      
      <text y="185" font-weight="bold" fill="white">TOPICS</text>
      <text y="215">CIP-68 · DeFi · NFT Tools · Governance</text>
      
      <text y="270" font-weight="bold" fill="white">PERKS</text>
      <rect y="285" width="480" height="60" fill="#222" rx="5" />
      <text y="320" x="240" text-anchor="middle" fill="#555" font-style="italic">Unlocks post-event</text>
    </g>

    <g transform="translate(300, 600)" text-anchor="middle">
      <rect x="-80" y="-20" width="160" height="40" rx="20" fill="${palette.main}" fill-opacity="0.2" stroke="${palette.main}" />
      <text y="8" font-family="Arial, sans-serif" font-size="16" fill="${palette.main}" font-weight="bold">₳ NAIROBI DAO</text>
    </g>
  </g>

  <!-- Side Walls -->
  <g transform="translate(40, 500) rotate(-90)" font-family="Impact" font-size="40" fill="${palette.main}" opacity="0.3">
    <text x="0" y="0">BLOCK / CHAIN</text>
  </g>
  <g transform="translate(760, 500) rotate(90)" font-family="Impact" font-size="40" fill="${palette.main}" opacity="0.3">
    <text x="0" y="0">CARDANO / ₳ 2025</text>
  </g>

  <!-- Bottom Badge Strip -->
  <g transform="translate(100, 920)">
    <!-- Attendee ID -->
    <rect width="100" height="60" rx="5" fill="#222" />
    <text x="50" y="25" text-anchor="middle" font-family="Arial" font-size="12" fill="#888">ATTENDEE</text>
    <text x="50" y="50" text-anchor="middle" font-family="Impact" font-size="24" fill="white">#${attendeeNumber.toString().padStart(3, '0')}</text>
    
    <!-- Tier -->
    <rect x="110" width="120" height="60" rx="5" fill="#222" />
    <text x="170" y="25" text-anchor="middle" font-family="Arial" font-size="12" fill="#888">TIER</text>
    <text x="170" y="50" text-anchor="middle" font-family="Arial" font-size="18" fill="${tierColor}" font-weight="bold">${tier}</text>
    
    <!-- CIP-68 -->
    <rect x="240" width="100" height="60" rx="5" fill="#222" />
    <text x="290" y="38" text-anchor="middle" font-family="Impact" font-size="20" fill="${palette.accent}">CIP-68</text>

    <!-- Share Badge -->
    <rect x="350" width="250" height="60" rx="5" fill="${palette.main}" />
    <text x="475" y="38" text-anchor="middle" font-family="Impact" font-size="20" fill="black">₳ ON-CHAIN / SHARE IT</text>
  </g>

  ${displayName ? `
  <!-- Claimed By -->
  <g transform="translate(100, 990)" font-family="Arial" text-anchor="middle">
    <rect width="600" height="42" rx="8" fill="#222" stroke="${palette.accent}" stroke-opacity="0.5" />
    <text x="300" y="17" font-size="10" fill="#888" style="letter-spacing: 2px;">CLAIMED BY</text>
    <text x="300" y="34" font-size="20" fill="white" font-weight="bold">${displayName}</text>
  </g>
  ` : ''}

  <!-- Footer -->
  <g transform="translate(100, 1060)" font-family="Arial" font-size="12" fill="#555">
    <text y="0">EDITION: ${attendeeNumber} of 200 · VERSION: 1</text>
    <text y="20">minted via mesh sdk · aiken validator · cardano mainnet</text>
    <text x="600" y="40" text-anchor="end" font-weight="bold" fill="#777">BLOCKCHAIN CENTRE NBO × CARDANO</text>
  </g>
</svg>
`;
}
