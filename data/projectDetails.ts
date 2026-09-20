/**
 * ============================================================================
 *  PROJECT DETAIL PAGES — /projects/[slug]
 * ============================================================================
 *
 *  One entry per project page. The page component renders only the sections
 *  an entry has content for, so a project with no brochure, map or plans
 *  simply has no such section — nothing is filled in to make pages match.
 *
 *  SOURCES — every line below comes from one of these, and each field says
 *  which:
 *    · data/avenue.ts (the official site, tabd.in) — via getProject()
 *    · the project brochures supplied by The Avenue, now in /public/brochures:
 *        Milestone  "Milestone E-Brochure New.pdf"                   26 pp
 *        Aura       "The Avenue - AURA Brochure Revised (July'25) L"  19 pp
 *        Bliss      "The Avenue Bliss E-Brochure (Apr'24)"             8 pp
 *        Flora      "The Avenue Flora Commercial Without Area -
 *                    Booklet - (Sept'23)"                              7 pp
 *    · the "Our ongoing project" page those brochures share (Urbania's
 *      configuration and locality)
 *    · Urbania's own page on the official site, tabd.in/urbania/ — its words,
 *      renders, unit plans and location map
 *    · two further brochures supplied by The Avenue:
 *        Aaryana       "The Avenue - Aaryana Brochure"                11 pp
 *        Viraj Avenue  "Viraj Avenue Brochure"                         7 pp
 *
 *  Brochure copy is quoted as printed, apart from obvious typos ("Viewing
 *  Desk" → "Viewing Deck"). Images are the brochures' own renders and pages,
 *  and The Avenue's Milestone renders — cropped and re-encoded, never altered.
 *
 *  Deliberately left out: prices, availability, possession dates (the Aura
 *  brochure says "Ready Possession" while data/avenue.ts says "Ongoing";
 *  the Bliss brochure's "Possession in 3 months" dates from April 2024),
 *  MahaRERA numbers, and unit areas — the plans themselves carry those.
 * ============================================================================
 */

import { company, getProject, type Project } from "./avenue";

export type Media = {
  src: string;
  alt: string;
  caption?: string;
  w: number;
  h: number;
};

export type Fact = { value: string; label: string; note?: string };

export type FeaturedAmenity = { title: string; line?: string; image: Media };

export type ProjectDetail = {
  slug: string;
  /** Display name, e.g. "Milestone". */
  name: string;
  /** "The Avenue Milestone" — used in enquiries and file names. */
  fullName: string;
  flagship?: boolean;
  category: string;
  /** Locality line shown above the name. */
  eyebrow: string;
  tagline: string;
  subline?: string;
  hero: Media;
  /** object-position for the hero image. */
  heroPosition?: string;
  /** The first three appear in the hero; all of them in the overview. */
  facts: Fact[];
  story: { heading: string; paragraphs: string[]; source: string };
  /** The image story. */
  gallery: Media[];
  amenities?: {
    heading: string;
    intro?: string;
    source: string;
    /** "arch" frames echo the Milestone brochure's own arched renders. */
    frame: "arch" | "rect";
    featured: FeaturedAmenity[];
    groups: { title: string; items: string[] }[];
  };
  location?: {
    address: string;
    image?: Media;
    /** "map" = the brochure's location map; "setting" = an aerial render. */
    kind: "map" | "setting";
    connectivity?: string[];
    source: string;
  };
  plans?: {
    /** Index of the plan shown first. */
    primary: number;
    items: { title: string; image: Media }[];
    source: string;
  };
  specifications?: { heading: string; groups: { title: string; items: string[] }[] };
  brochure?: { href: string; fileName: string; pages: number; sizeMb: number; edition: string; cover: Media };
  enquiry: { phone: string; phoneHref: string };
  disclaimer?: string;
};

const img = (src: string, w: number, h: number, alt: string, caption?: string): Media => ({ src, w, h, alt, caption });
const req = (slug: string): Project => {
  const p = getProject(slug);
  if (!p) throw new Error(`No project "${slug}" in data/avenue.ts`);
  return p;
};

const urbania = req("urbania");
const flora = req("flora");
const aura = req("aura");
const bliss = req("bliss");
const aaryana = req("aaryana");
const viraj = req("viraj-avenue");

const PROJECT_PHONE = { phone: "+91 72779 95566", phoneHref: "tel:+917277995566" };

/* -------------------------------------------------------------------------- */
/*  MILESTONE — the flagship                                                  */
/* -------------------------------------------------------------------------- */

const M = "/projects/milestone";
const milestonePlan = (file: string, title: string) => ({ title, image: img(`${M}/plan-${file}.webp`, 2640, 1540, `Milestone — ${title}`) });

const milestone: ProjectDetail = {
  slug: "milestone",
  name: "Milestone",
  fullName: "The Avenue Milestone",
  flagship: true,
  category: "Residential",
  eyebrow: "Karmayogi Nagar, Nashik",
  // Brochure p3: "The Avenue Builders & Developers marks a new Milestone."
  tagline: "Marks a new milestone.",
  // Brochure p3, verbatim.
  subline: "Nashik's first-ever 4.5 BHK prestigious homes, offering world-class amenities with 12.5 ft ceiling height.",
  hero: img(`${M}/hero.webp`, 2428, 1366, "The Avenue Milestone — the two towers at dusk"),
  heroPosition: "48% 50%",
  // Brochure p3, p7, p8, p9 and p11.
  facts: [
    { value: "4.5 BHK", label: "Prestigious homes" },
    { value: "2", label: "Towers", note: "Rise above imagination" },
    { value: "60", label: "Units", note: "Redefining luxury" },
    { value: "12.5 ft", label: "High ceilings" },
    { value: "50+", label: "Unique experiences" },
  ],
  // Brochure p4, "Celebrating Your Achievements", verbatim.
  story: {
    heading: "Celebrating your achievements.",
    paragraphs: [
      "A milestone is a symbol of progress, a testament to our journey through life.",
      "Owning a home is not just a financial milestone; it's a representation of dreams, hard work, and aspirations realized. It's where the little big moments of life unfold, where each day is a celebration of our achievements.",
      "At Milestone, we understand the profound significance of these moments. We don't just offer you a prestigious home; we offer you a stage for your life's greatest acts.",
      "Our project isn't just about luxurious living; it's about cherishing every step of your journey. We're not simply providing amenities; we're offering direction and coaching support to ensure that you make the most of your milestones.",
      "Welcome to Milestone, where your achievements are celebrated, and your life is enriched in every way.",
    ],
    source: "From the Milestone brochure",
  },
  // One image per view, none repeated elsewhere on the page — the p3 view is
  // the hero, and the lobby and street frontage are the homepage's Values and
  // CTA images. Ordered so each lands in a slot its own shape fits (full,
  // pair, full), so none is cropped to fit.
  gallery: [
    img(`${M}/porte-cochere.webp`, 2400, 1400, "The arched porte-cochère at the Milestone entrance, at dusk", "The porte-cochère"),
    img(`${M}/front-view.webp`, 1315, 840, "The two Milestone towers side by side, face-on, at dusk", "Side by side"),
    img(`${M}/towers-day.webp`, 1320, 1540, "The Milestone towers above the trees", "Above the trees"),
    img(`${M}/towers-night.webp`, 2600, 1137, "The Milestone towers lit at night, seen from above, with the podium gardens between them", "The towers at night"),
  ],
  // Brochure p11 (the lists) and p12–14 (the spaces, each with its own line).
  amenities: {
    heading: "50+ unique experiences.",
    source: "From the Milestone brochure",
    frame: "arch",
    featured: [
      { title: "The Clubhouse", line: "Elevate your lifestyle at", image: img(`${M}/amenity-clubhouse.webp`, 572, 591, "The Milestone clubhouse") },
      { title: "The Kids Play Zone", line: "Play and grow at", image: img(`${M}/amenity-kids-play-zone.webp`, 1004, 1168, "The Milestone kids play zone") },
      { title: "State-of-the-art Gym", line: "Sculpt your body in our", image: img(`${M}/amenity-gym.webp`, 1004, 1168, "The Milestone gym") },
      { title: "Our Array of Activities", line: "Indoor fun, outdoor style —", image: img(`${M}/amenity-activities.webp`, 1004, 1168, "The Milestone indoor games room") },
      { title: "The Yoga Studio", line: "Find your zen at", image: img(`${M}/amenity-yoga-studio.webp`, 1004, 1168, "The Milestone yoga studio") },
      { title: "The Music Room", line: "Harmonize your passion in", image: img(`${M}/amenity-music-room.webp`, 572, 590, "The Milestone music room") },
      { title: "The Cards Room", line: "Ace your moves at", image: img(`${M}/amenity-cards-room.webp`, 571, 589, "The Milestone cards room") },
      { title: "The Stylish Lobby", line: "Welcome home at", image: img(`${M}/amenity-lobby.webp`, 571, 590, "The Milestone lobby") },
    ],
    groups: [
      {
        title: "Lifestyle experiences",
        items: [
          "Outdoor Fitness Zone",
          "Indoor Game Zone",
          "Multifunctional Space for Aerobics, Zumba, Dance, Yoga & more",
          "Toddlers' Creative Studio",
          "Card Room",
          "World-Class Luxury Spa",
        ],
      },
      { title: "Therapeutic experiences", items: ["Aroma Garden", "Reflexology Path", "Rooftop Observatory", "Sky Walkway"] },
      { title: "Networking experiences", items: ["The 'Milestone' Cafe", "Celebration Lawn"] },
    ],
  },
  // Brochure p26. The brochure has no location map, so the page shows the
  // development in its setting instead, with a link to search the address.
  location: {
    address: "Survey No 773, Near Sambhaji Raje Gymnastic Centre, Karmayogi Nagar, Nashik - 422009",
    image: img("/hero-mobile-2026.webp", 1823, 1366, "The Milestone towers in their setting at dusk, from above", "The towers in their setting"),
    kind: "setting",
    source: "Address from the Milestone brochure",
  },
  // Brochure p15–24; titles as printed.
  plans: {
    primary: 2,
    items: [
      milestonePlan("ground-floor", "Ground Floor Plan"),
      milestonePlan("first-floor", "1st Floor Plan"),
      milestonePlan("wing-a-flat-1", "Wing A Flat No. 1 Floor Plan"),
      milestonePlan("wing-a-flat-2", "Wing A Flat No. 2 Floor Plan"),
      milestonePlan("wing-a-typical", "Wing A 2nd to 15th Floor Plan"),
      milestonePlan("wing-b-flat-1", "Wing B Flat No. 1 Floor Plan"),
      milestonePlan("wing-b-flat-2", "Wing B Flat No. 2 Floor Plan"),
      milestonePlan("wing-b-typical", "Wing B 2nd to 15th Floor Plan"),
      milestonePlan("recreational-floor", "Typical Recreational Floor Plan"),
      milestonePlan("terrace", "Wing A & Wing B Terrace Floor Plans"),
    ],
    source: "From the Milestone brochure",
  },
  // Brochure p25, "Crafted with Expertise", verbatim.
  specifications: {
    heading: "Crafted with expertise.",
    groups: [
      { title: "RCC", items: ["RCC Earthquake Frame Structure"] },
      { title: "Brick work & plaster", items: ["AAC Block Work", "External Double Coat Sand Faced Plaster", "Internal Smooth Finish Gypsum"] },
      { title: "Flooring", items: ["Premium Vitrified Tiles Flooring"] },
      { title: "Door", items: ["Main Door Decorative Both Side Veneer", "Laminated Internal Doors & Doors Frame"] },
      { title: "Windows", items: ["High Quality UPVC/Anodized Aluminium Windows"] },
      { title: "Wash area", items: ["Floor: Anti Skid or Rustic Vitrified Tiles", "Dado: Premium Ceramic or Vitrified Tiles", "Provision for Washing Machine"] },
      { title: "Security", items: ["Video Door Phone Security System to be Linked with Reception and Access Control in The Lobby", "Entire Campus Covered Under CCTV Surveillance"] },
      { title: "Kitchen & store", items: ["Flooring: Vitrified Tiles", "Platform: Natural Granite/Composite Marble", "Dado: Premium Ceramic Tiles"] },
      { title: "Balcony", items: ["Rustic Tiles/Anti Skid Tiles"] },
      { title: "Electrification", items: ["3 Phase Power Connection", "Concealed ISI Copper Wiring with Modular Switches", "MCB Distribution Panel"] },
      { title: "Railings", items: ["MS/Aluminum/Toughened Glass Railing"] },
      { title: "Paint", items: ["Inside: Putty Finish with Emulsion Paint", "Outside: Acrylic Paint"] },
      { title: "Toilets", items: ["Premium Ceramic Tiles Upto Lintel Level", "Granite/Composite Marble Counter Basin", "EWC-Wall Hung Type- Hindware, Kohler, Toto/Equivalent", "CP Brass Fitting Jaquar Artize, Kohler, Grohe/Equivalent"] },
    ],
  },
  brochure: {
    href: "/brochures/the-avenue-milestone-brochure.pdf",
    fileName: "The Avenue Milestone — Brochure.pdf",
    pages: 26,
    sizeMb: 10.9,
    edition: "E-Brochure",
    cover: img(`${M}/brochure-cover-page.webp`, 1200, 700, "The cover of the Milestone brochure"),
  },
  // Brochure p26.
  enquiry: PROJECT_PHONE,
  // Brochure p26, verbatim.
  disclaimer:
    "The developer reserves the right to amend the plans and specifications without prior notice. The contents of this brochure are purely conceptual and have no legal binding on the developer.",
};

/* -------------------------------------------------------------------------- */
/*  URBANIA — from its own page on the official site                          */
/* -------------------------------------------------------------------------- */

const U = "/projects/urbania";

const urbaniaDetail: ProjectDetail = {
  slug: "urbania",
  name: urbania.name,
  fullName: `The Avenue ${urbania.name}`,
  category: urbania.category,
  // The brochures' shared "Our ongoing project" page: "URBANIA — 3 & 4 BHK
  // Ultra Spacious Homes — Karmayogi Nagar, Nashik".
  eyebrow: "Karmayogi Nagar, Nashik",
  tagline: urbania.statement,
  // The Urbania page's own banner: "3 & 4 BHK URBAN LIVING".
  subline: "3 & 4 BHK urban living.",
  hero: img(`${U}/exterior.webp`, 1600, 1750, "The Avenue Urbania — the towers from the street"),
  heroPosition: "50% 40%",
  facts: [
    { value: urbania.configuration, label: "Residences" },
    { value: "72", label: "Luxurious residences" },
    { value: "2", label: "Towers", note: "20 floors each" },
    { value: "2", label: "Apartments per floor" },
    { value: "10 ft 6 in", label: "Floor height", note: "Approximately" },
  ],
  // The Urbania page, verbatim.
  story: {
    heading: urbania.statement,
    paragraphs: [
      urbania.description,
      "You can call it a revolution in high-end living and it's going to take your 'joy of living' quotient to a new height.",
      "Here is your truly a once in a lifestyle opportunity to own a home that has all the ingredients for a perfect life.",
    ],
    source: "From the Urbania page",
  },
  gallery: [
    img(`${U}/entrance.webp`, 1360, 816, "The gated entrance to The Avenue Urbania at sunset", "The entrance"),
    img(`${U}/podium-garden.webp`, 1600, 1114, "The landscaped garden and pavilion on the Urbania podium", "The garden"),
    img(`${U}/open-air-theatre.webp`, 1600, 1223, "The open air theatre on the Urbania terrace, in the evening", "The open air theatre"),
    img(`${U}/infinity-pool.webp`, 1600, 971, "The infinity swimming pool on the Urbania terrace, above the city", "The infinity pool"),
    img(`${U}/podium-aerial.webp`, 1600, 1108, "The play courts and gardens on the Urbania podium, from above", "The podium, from above"),
  ],
  // The Urbania page's four tiers, in its own words.
  amenities: {
    heading: "Four tiers of celebrity-like lifestyle.",
    intro: "The delights of rejuvenation, calling to you.",
    source: "From the Urbania page",
    frame: "rect",
    featured: [
      { title: "Indoor Gym", image: img(`${U}/gym.webp`, 1600, 974, "The gym at Urbania, looking out over the city") },
      { title: "Multi Purpose Hall", image: img(`${U}/banquet-hall.webp`, 1472, 906, "The multi purpose hall at Urbania, laid out for a gathering") },
      { title: "Indoor Game", image: img(`${U}/games-room.webp`, 1478, 753, "The indoor games room at Urbania, with pool and darts") },
      { title: "Yoga Aerobics Lawn", image: img(`${U}/yoga-lawn.webp`, 1600, 971, "The yoga and aerobics lawn on the Urbania terrace") },
    ],
    groups: [
      {
        title: "Tier I — Residences (Living)",
        items: [
          "3 & 4 BHK sky lifestyle with world-class embellishments",
          "72 luxurious residences",
          "Per floor 2 apartment",
          "2 sky-scaling towers of 20",
          "Around 10'6\" floor height",
        ],
      },
      {
        title: "Tier II — Ground (Kids & community living)",
        items: [
          "Designer landscaped garden",
          "Outdoor children park with rubberized flooring",
          "Senior citizens park with aroma therapy garden",
          "Grand entrance foyer",
        ],
      },
      {
        title: "Tier III — Recreational (Social, sports)",
        items: [
          "Indoor gym",
          "Jogging track",
          "Seating arrangement",
          "Multi purpose hall",
          "Indoor game",
          "Outdoor game",
        ],
      },
      {
        title: "Tier IV — Terrace (Indulge, relax)",
        items: [
          "Spectacular infinity swimming pool for adults & kid's",
          "Spacious yoga aerobics lawn",
          "Community garden",
          "Open air theatre",
        ],
      },
    ],
  },
  location: {
    address: "Karmayogi Nagar, Nashik",
    image: img(`${U}/location-map.webp`, 1600, 1614, "Location map of The Avenue Urbania, from the Urbania page"),
    kind: "map",
    connectivity: urbania.features.filter((f) => /minutes/i.test(f)),
    source: "Map and connectivity from the Urbania page",
  },
  plans: {
    primary: 0,
    items: [
      { title: "4 BHK Unit Plan · Tower A · Type 1", image: img(`${U}/plan-4bhk-tower-a-type-1.webp`, 1600, 2329, "Urbania — 4 BHK unit plan, Tower A, Type 1") },
      { title: "4 BHK Unit Plan · Tower A · Type 2", image: img(`${U}/plan-4bhk-tower-a-type-2.webp`, 1600, 2400, "Urbania — 4 BHK unit plan, Tower A, Type 2") },
      { title: "3 BHK Unit Plan · Tower B · Type 1", image: img(`${U}/plan-3bhk-tower-b-type-1.webp`, 1600, 2329, "Urbania — 3 BHK unit plan, Tower B, Type 1") },
      { title: "3 BHK Unit Plan · Tower B · Type 2", image: img(`${U}/plan-3bhk-tower-b-type-2.webp`, 1600, 2383, "Urbania — 3 BHK unit plan, Tower B, Type 2") },
      { title: "6 BHK Unit Plan · Tower A", image: img(`${U}/plan-6bhk-tower-a.webp`, 1600, 525, "Urbania — 6 BHK unit plan, Tower A") },
      { title: "5 BHK Unit Plan · Tower B", image: img(`${U}/plan-5bhk-tower-b.webp`, 1600, 560, "Urbania — 5 BHK unit plan, Tower B") },
    ],
    source: "From the Urbania page",
  },
  // The Urbania page publishes no phone of its own.
  enquiry: { phone: company.phone, phoneHref: company.phoneHref },
};

/* -------------------------------------------------------------------------- */
/*  FLORA                                                                     */
/* -------------------------------------------------------------------------- */

const F = "/projects/flora";
const floraDetail: ProjectDetail = {
  slug: "flora",
  name: flora.name,
  fullName: `The Avenue ${flora.name}`,
  category: flora.category,
  eyebrow: "Old Gangapur Naka, Gangapur Road, Nashik",
  // Brochure cover.
  tagline: "A new era of affordability.",
  subline: "Showrooms & offices.",
  // The brochure's render (p2), uncropped.
  hero: img(`${F}/exterior.webp`, 2550, 1725, "The Avenue Flora — showrooms and offices"),
  heroPosition: "30% 55%",
  facts: [
    { value: "555–1790", label: "Sq.ft. Offices" },
    { value: "1297–3162", label: "Sq.ft. Showrooms" },
    { value: "Gangapur Naka", label: "Heart of the city" },
    { value: "CBS & College Rd", label: "Minutes away" },
  ],
  // Brochure p2, verbatim.
  story: {
    heading: "Welcome to a world of elegance.",
    paragraphs: [
      "Welcome to a world of elegance, opportunities and dreams that blossom. Here, amidst the vibrant life of Old Gangapur Naka, we invite you to join us on a journey where aspirations find their wings, and business meets prosperity. Experience The Avenue Flora - A New Era of Affordability.",
      "The Avenue Flora is an iconic commercial destination, setting new standards in commercial and corporate lifestyle. The prestigious project offers elite options for Advocates, Professionals, Architects, Doctors, Interior Designers, and Chartered Accountants.",
    ],
    source: "From the Flora brochure and 2025 profile",
  },
  gallery: [],
  amenities: {
    heading: "Amenities & Features.",
    source: "From the Flora brochure and 2025 profile",
    frame: "rect",
    featured: [],
    groups: [
      { title: "Commercial Spaces", items: flora.features },
      { title: "Building Amenities", items: flora.amenities },
    ],
  },
  location: {
    address: "Old Gangapur Naka, Behind Vihar Misal, Gangapur Road, Nashik 422013.",
    image: img(`${F}/location-map.webp`, 1801, 799, "Location map of The Avenue Flora, from the brochure"),
    kind: "map",
    connectivity: flora.features.filter((f) => !/space|centre/i.test(f)),
    source: "Map and address from the Flora brochure",
  },
  plans: {
    primary: 0,
    items: [
      { title: "Ground Floor Plan", image: img(`${F}/plan-ground-floor.webp`, 2550, 1733, "Flora — Ground Floor Plan") },
      { title: "1st Floor Plan", image: img(`${F}/plan-first-floor.webp`, 2550, 1733, "Flora — 1st Floor Plan") },
      { title: "2nd to 7th Floor Plan", image: img(`${F}/plan-second-to-seventh-floor.webp`, 2550, 1733, "Flora — 2nd to 7th Floor Plan") },
    ],
    source: "From the Flora brochure",
  },
  brochure: {
    href: "/brochures/the-avenue-flora-brochure.pdf",
    fileName: "The Avenue Flora — Brochure.pdf",
    pages: 7,
    sizeMb: 16.3,
    edition: "Booklet · September 2023",
    cover: img(`${F}/brochure-cover.webp`, 900, 612, "Cover of the Flora brochure"),
  },
  // Brochure p7: "For more information: 96 99 00 63 77".
  enquiry: { phone: "+91 96990 06377", phoneHref: "tel:+919699006377" },
  disclaimer:
    "The contents of this brochure are purely conceptual and have no legal bindings on us. Developers reserve the right of amend the layout plans, number of floors & units, elevation, colour scheme, specifications and amenities etc. without notice.",
};

/* -------------------------------------------------------------------------- */
/*  AURA                                                                      */
/* -------------------------------------------------------------------------- */

const A = "/projects/aura";
const auraPlan = (file: string, title: string) => ({ title, image: img(`${A}/plan-${file}.webp`, 1600, 2546, `Aura — ${title}`) });
const auraDescription = aura.description.replace(/^Step into a world of elegance\.\s*/, "");

const auraDetail: ProjectDetail = {
  slug: "aura",
  name: aura.name,
  fullName: `The Avenue ${aura.name}`,
  category: aura.category,
  eyebrow: aura.locality ?? "Govind Nagar, Nashik",
  // Brochure cover: "Elevate your life..." · "Limited Edition 3 & 4 BHK Homes".
  tagline: "Elevate your life.",
  subline: "Limited edition 3 & 4 BHK homes.",
  hero: img(`${A}/hero.webp`, 1650, 2610, "The Avenue Aura at dusk"),
  heroPosition: "50% 38%",
  facts: [
    { value: "3 & 4 BHK", label: "Limited edition homes" },
    { value: "1484–2467", label: "Sq.ft. Area" },
    { value: "45+", label: "Amenities" },
    { value: "Two-level", label: "Parking", note: "Basement and ground floors" },
    { value: "Ready", label: "Possession" },
  ],
  story: {
    // Brochure p4 heading; the paragraphs are the Aura page and brochure p4.
    heading: "Step into a world of elegance.",
    paragraphs: [
      auraDescription,
      "The outside ambience is as important as the one inside, so at The Aura the external amenities do reflect a well-planned layout and much more...",
    ],
    source: "From the Aura page and brochure",
  },
  // Wide first (a full-width slot), then the portrait elevation beside the aerial.
  gallery: [
    img(`${A}/terrace-evening.webp`, 1375, 861, "The Aura terrace level at evening", "The terrace level"),
    img(`${A}/exterior-day.webp`, 1651, 2626, "The Avenue Aura in daylight", "The elevation"),
    img(`${A}/aerial.webp`, 1080, 975, "The Avenue Aura from above, with its rooftop gardens", "From above"),
  ],
  amenities: {
    heading: "45+ amenities.",
    intro: "The outside ambience is as important as the one inside.",
    source: "From the Aura brochure",
    frame: "rect",
    featured: [
      { title: "Rooftop Infinity Pool", image: img(`${A}/rooftop-infinity-pool.webp`, 835, 596, "The rooftop infinity pool at Aura") },
      { title: "Children's Play Area", image: img(`${A}/childrens-play-area.webp`, 1337, 743, "The children's play area at Aura") },
      { title: "Lord Ganesh Temple & Box Cricket", image: img(`${A}/temple-box-cricket.webp`, 807, 448, "The Lord Ganesh temple and box cricket pitch at Aura") },
    ],
    groups: [
      {
        title: "Ground level",
        items: [
          "Entrance Gate", "Community Temple", "Senior Citizen Seating", "Indoor Games", "Children's Play Area", "Sandpit",
          "Gym", "Multipurpose Hall", "Yoga / Aerobics Deck", "Box Cricket", "Electrical Charging Point", "Gas Pipe Line",
        ],
      },
      {
        title: "Terrace level",
        items: [
          "Amphitheatre", "Lawns", "Barbeque Area", "Yoga", "Swimming Pool", "Jogging / Walking Track", "Seating",
          "Reflexology Path", "Viewing Deck", "Seating Alcove", "Pantry / Barbeque Area",
        ],
      },
    ],
  },
  location: {
    // Brochure p19, "SITE".
    address: "S. No. 803, Plot No. 25/26, Chowk No. 1, Behind Prakash Petrol Pump, Govind Nagar, Nashik.",
    image: img(`${A}/location-map.webp`, 1600, 1121, "Location map of The Avenue Aura, from the brochure"),
    kind: "map",
    connectivity: aura.features.filter((f) => /minute|drive|away|proximity/i.test(f)),
    source: "Map and site address from the Aura brochure; connectivity from the Aura page",
  },
  plans: {
    primary: 4,
    items: [
      auraPlan("ground-floor", "Ground Floor Plan"),
      auraPlan("seventh-floor", "Seventh Floor Plan"),
      auraPlan("block-a-7th", "Typical Block Plan · 01"),
      auraPlan("block-a-typical", "Typical Block Plan · 02"),
      auraPlan("block-b-isometric-1", "Typical Block Plan · 03"),
      auraPlan("block-b-isometric-2", "Typical Block Plan · 04"),
      auraPlan("block-b-isometric-3", "Typical Block Plan · 05"),
      auraPlan("block-b-7th", "Typical Block Plan · 06"),
      auraPlan("block-b-typical", "Typical Block Plan · 07"),
      auraPlan("terrace", "Terrace Amenities Layout"),
    ],
    source: "From the Aura brochure",
  },
  brochure: {
    href: "/brochures/the-avenue-aura-brochure.pdf",
    fileName: "The Avenue Aura — Brochure.pdf",
    pages: 19,
    sizeMb: 35.1,
    edition: "Revised July 2025",
    cover: img(`${A}/brochure-cover-page.webp`, 900, 1432, "The cover of the Aura brochure"),
  },
  enquiry: aura.contact ? { phone: aura.contact, phoneHref: `tel:${aura.contact.replace(/\s+/g, "")}` } : PROJECT_PHONE,
};

/* -------------------------------------------------------------------------- */
/*  BLISS                                                                     */
/* -------------------------------------------------------------------------- */

const B = "/projects/bliss";
const blissDetail: ProjectDetail = {
  slug: "bliss",
  name: bliss.name,
  fullName: `The Avenue ${bliss.name}`,
  category: bliss.category,
  eyebrow: bliss.locality ?? "Govind Nagar, Nashik",
  // Brochure cover: "Perfect Happiness..." · "Limited Edition 2 & 3 BHK Homes".
  tagline: "Perfect happiness.",
  subline: "Limited edition 2 & 3 BHK homes, penthouse & shops.",
  // The brochure's elevation (p2), uncropped.
  hero: img(`${B}/elevation.webp`, 2750, 2037, "The Avenue Bliss at dusk"),
  // Weighted to the top, so the crown and its name stay in frame.
  heroPosition: "50% 15%",
  facts: [
    { value: "2 & 3 BHK", label: "Homes & penthouse" },
    { value: "1078–1877", label: "Sq.ft. built-up" },
    { value: "250–350", label: "Sq.ft. shops" },
    { value: "Ready", label: "Possession" },
    { value: "Govind Nagar", label: "Centrally located" },
  ],
  story: { heading: "Perfect happiness.", paragraphs: [bliss.description], source: "From the Bliss page" },
  gallery: [],
  amenities: {
    heading: "Rooftop living & curated amenities.",
    // Brochure p6: "Bliss give you the experience of roof top living".
    intro: "Bliss gives you the experience of rooftop living and modern conveniences.",
    source: "From the Bliss brochure and 2025 profile",
    frame: "rect",
    featured: [{ title: "The rooftop", image: img(`${B}/rooftop.webp`, 1749, 1189, "The Bliss rooftop from above, with its terrace amenities") }],
    groups: [
      { title: "Rooftop & Wellness", items: ["Roof Top Green Gym", "Yoga Deck", "Jogging Track", "Party Lawn", "Senior Citizen Sitting", "Sit Out Area"] },
      { title: "Facilities & Security", items: ["Indoor Game Play Area", "E Vehicle Charging Point", "Commercial Shops (250–350 Sq.ft.)", "24x7 Security Systems", "Power Backup"] },
    ],
  },
  location: {
    // Brochure p8, "SITE".
    address: "S. No. 788, Chowk No. 4, Behind Prakash Petrol Pump, Govind Nagar, Nashik.",
    image: img(`${B}/location-map.webp`, 1801, 675, "Location map of The Avenue Bliss, from the brochure"),
    kind: "map",
    source: "Map and site address from the Bliss brochure",
  },
  plans: {
    primary: 0,
    items: [
      { title: "1st to 6th Floor Plan", image: img(`${B}/plan-first-to-sixth-floor.webp`, 2400, 1600, "Bliss — 1st to 6th Floor Plan") },
      { title: "7th Floor Plan", image: img(`${B}/plan-seventh-floor.webp`, 2400, 1600, "Bliss — 7th Floor Plan") },
      { title: "4 BHK Options 1 & 2", image: img(`${B}/plan-four-bhk-options.webp`, 2400, 1600, "Bliss — 4 BHK Options 1 & 2") },
    ],
    source: "From the Bliss brochure",
  },
  brochure: {
    href: "/brochures/the-avenue-bliss-brochure.pdf",
    fileName: "The Avenue Bliss — Brochure.pdf",
    pages: 8,
    sizeMb: 32,
    edition: "E-Brochure · April 2024",
    cover: img(`${B}/brochure-cover-page.webp`, 1200, 800, "The cover of the Bliss brochure"),
  },
  // Brochure p8: "For more information click: 72 77 99 55 66".
  enquiry: PROJECT_PHONE,
  // Brochure p8, verbatim.
  disclaimer:
    "The contents of this brochure are purely conceptual and have no legal bindings on us. Developers reserve the right of amend the layout plans, number of floors & units, elevation, colour scheme, specifications and amenities etc. without notice.",
};

/* -------------------------------------------------------------------------- */
/*  AARYANA                                                                   */
/* -------------------------------------------------------------------------- */

const AA = "/projects/aaryana";
const aaryanaPlan = (file: string, title: string, w = 1650, h = 2625) => ({
  title,
  image: img(`${AA}/plan-${file}.webp`, w, h, `Aaryana — ${title}`),
});

const aaryanaDetail: ProjectDetail = {
  slug: "aaryana",
  name: aaryana.name,
  fullName: `The Avenue ${aaryana.name}`,
  category: aaryana.category,
  eyebrow: aaryana.locality ?? "Karmayogi Nagar, Nashik",
  // Brochure cover: "Modern Luxury..." · "EXCLUSIVE 3 BHK APARTMENT".
  tagline: aaryana.statement,
  subline: "Premium 3 BHK & 4 BHK Penthouse · One Floor Two Flat.",
  hero: img(`${AA}/exterior.webp`, 1650, 2625, "The Avenue Aaryana at dusk"),
  heroPosition: "50% 45%",
  facts: [
    { value: "3 BHK & Penthouse", label: "Exclusive residences" },
    { value: "1947 & 2912", label: "Sq.ft. Area" },
    { value: "1 Floor 2 Flat", label: "Total privacy" },
    { value: "Mumbai-Agra", label: "Highway", note: "Near R.D. Circle" },
  ],
  // Brochure p3, verbatim.
  story: {
    heading: "A residence is the canvas for life's most cherished moments.",
    paragraphs: [
      "A residence serves as the canvas for life's most cherished moments, a sanctuary where memories blossom and endure. It evolves into a haven where you nurture invaluable recollections, cultivating a tapestry of experiences to be treasured for a lifetime. Over time, it transforms into a resplendent abode that encapsulates the essence of your dreams.",
      "Introducing The Avenue AARYANA, an epitome of opulence, a Premium Edition 3 BHK Class home meticulously crafted with precision, employing cutting-edge technology, and featuring intelligently designed spaces. This residence is not just a dwelling; it's an embodiment of a refined lifestyle that transcends expectations.",
      "Nestled conveniently along the Mumbai-Agra Highway, The Avenue AARYANA boasts seamless connectivity, offering accessibility that effortlessly intertwines with the rhythm of your daily life. Its proximity to the city's premier shopping destination ensures a vibrant and colorful lifestyle, enhancing your living experience within this grand estate.",
      "Discover the extraordinary in every corner of The Avenue AARYANA, where your heart finds its truest home, and where each passing moment becomes a testament to a life well-lived.",
    ],
    source: "From the Aaryana brochure",
  },
  // The brochure's only other view of the home is its isometric drawing, which
  // is shown with the plans, at its own shape.
  gallery: [],
  // Brochure p9: "Features", "Amenities" and "3 Tier Security & Safety".
  amenities: {
    heading: "Everything the building carries.",
    source: "From the Aaryana brochure",
    frame: "rect",
    featured: [],
    groups: [
      {
        title: "Features",
        items: [
          "Well designed, Luxurious entrance lobby and waiting area",
          "High speed Branded Elevator with auto door and S.S. Cabin",
          "Allotted parking with chequered tiles / trimix flooring / paver block",
          "Post Box facility in entrance lobby for each apartment owner",
          "Name Plate on main door",
        ],
      },
      {
        title: "Amenities",
        items: [
          "Seismic Resistant RCC Structure",
          "Walls in Red Bricks Masonry in 6\" thick for Outer Walls & 4\" thick for Inner Walls",
          "Plaster in Sand face Double Coat for outer surfaces and Gypsum with baking coat for internal surfaces",
          "Paintworld in Asian Apex for external surfaces and Tractor Emulsion for internal surfaces",
          "Municipal Water Facility",
          "Light Arrester provision",
        ],
      },
      {
        title: "3 Tier Security & Safety",
        items: [
          "Power back-up for lift & common area",
          "Security system 24x7, security cabin",
          "C. C. T. V.",
          "Video door phone",
          "Compound Wall with secured Gates",
        ],
      },
    ],
  },
  location: {
    // Brochure p11: "Site : Karmayogi Nagar, Near R.D. Circle, Nasik."
    address: "Karmayogi Nagar, Near R.D. Circle, Nashik.",
    image: img(`${AA}/location-map.webp`, 1320, 1234, "Location map of The Avenue Aaryana, from the brochure"),
    kind: "map",
    connectivity: aaryana.features.filter((f) => !/^Exclusive|^Six floors/.test(f)),
    source: "Map and site address from the Aaryana brochure",
  },
  // Brochure p4–p8; titles as printed.
  plans: {
    primary: 1,
    items: [
      aaryanaPlan("ground-floor", "Ground Floor Plan", 1650, 2624),
      aaryanaPlan("first-second-fourth-fifth-floor", "1st, 2nd, 4th, 5th Floor Plan"),
      aaryanaPlan("third-sixth-floor", "3rd & 6th Floor Plan"),
      aaryanaPlan("terrace-floor", "Terrace Floor", 1687, 2625),
      { title: "Isometric View", image: img(`${AA}/isometric.webp`, 990, 1208, "Aaryana — an isometric view of the 3 BHK home") },
    ],
    source: "From the Aaryana brochure",
  },
  // Brochure p9, the rest of the configuration page.
  specifications: {
    heading: "The configuration.",
    groups: [
      {
        title: "Toilets",
        items: [
          "Ceramic tile dado up to lintel level in heights",
          "Marble / Granite stone fascia for door openings",
          "Wash basins with marble / granite counter or with pedestal",
          "Grohe / Jaquar / Kohler or equivalent quality CP fittings",
          "Concealed Flush Tank with Wall hung W.C.'s",
        ],
      },
      {
        title: "Flooring",
        items: [
          "Vitrified flooring with skirting [800mm x 800mm]",
          "Ceramic Anti-skid Wooden Flooring for Terraces & Sun-decks",
          "Ceramic Glazed tiles for cladding [300mm x 600mm]",
          "Anti-skid tiles for bathrooms & Utility",
        ],
      },
      {
        title: "Kitchen",
        items: [
          "Kitchen platform with granite top and S. S. Sink",
          "Ceramic tile dado up to lintel level in height above the platform",
          "Provision for fixing of water purifier",
        ],
      },
      {
        title: "Electrification",
        items: [
          "Concealed fire resistant, high quality Polycab / Finolex copper wiring",
          "Ample light points with 'Legrand' or equivalent modular switches",
          "TV & Telephone point in living & master bed room",
          "Geyser point will be provided in bathrooms",
        ],
      },
      {
        title: "Doors & Windows",
        items: [
          "Designer Main door with Europa Lock",
          "Bedroom door frames and shutters in plywood with both side laminate",
          "All bedrooms with Premium quality Cylindrical Locks",
          "Three track Anodised Aluminium Sliding Windows with Insect Net and Safety Grill",
        ],
      },
    ],
  },
  brochure: {
    href: "/brochures/the-avenue-aaryana-brochure.pdf",
    fileName: "The Avenue Aaryana — Brochure.pdf",
    pages: 11,
    sizeMb: 24.5,
    edition: "E-Brochure",
    cover: img(`${AA}/brochure-cover-page.webp`, 900, 1424, "The cover of the Aaryana brochure"),
  },
  enquiry: aaryana.contact
    ? { phone: aaryana.contact, phoneHref: `tel:${aaryana.contact.replace(/\s+/g, "")}` }
    : PROJECT_PHONE,
  // Brochure p11, verbatim.
  disclaimer:
    "The contents of this brochure are purely conceptual and have no legal bindings on us. Developers reserve the right of amend the layout plans, number of floors & units, elevation, colour scheme, specifications and amenities etc. without notice.",
};

/* -------------------------------------------------------------------------- */
/*  VIRAJ AVENUE                                                              */
/* -------------------------------------------------------------------------- */

const V = "/projects/viraj-avenue";

const virajDetail: ProjectDetail = {
  slug: "viraj-avenue",
  name: viraj.name,
  // Co-branded with Viraj Estates, so it carries its own name.
  fullName: viraj.name,
  category: viraj.category,
  eyebrow: viraj.locality ?? "Panchavati Annex, Nashik",
  // Brochure cover: "Discover a World of Opportunities...".
  tagline: viraj.statement,
  subline: "Showrooms · offices · shops · banquet hall · hospital.",
  hero: img(`${V}/exterior-sunset.webp`, 1292, 1726, "Viraj Avenue at sunset, from the street"),
  heroPosition: "50% 50%",
  facts: [
    { value: "407–750", label: "Sq.ft. Offices" },
    { value: "1600 & 2750", label: "Sq.ft. Showrooms" },
    { value: "Banquet & Hospital", label: "Facilities" },
    { value: "Mumbai-Agra", label: "Highway", note: "Opp. Bali Mandir" },
  ],
  // Brochure p2, verbatim.
  story: {
    heading: "Welcome to Viraj Avenue.",
    paragraphs: [
      "Viraj Avenue is an upcoming landmark in Nashik, offering a blend of Modern Office Spaces, Showrooms, Shops, a Banquet Hall, and a Hospital.",
      "Strategically located opposite Bali Mandir, Panchavati Annex. This project is designed to cater to a variety of commercial needs with state-of-the-art amenities and facilities.",
    ],
    source: "From the Viraj Avenue brochure",
  },
  gallery: [
    img(`${V}/exterior.webp`, 2550, 1726, "Viraj Avenue — the shopfronts and offices along the highway", "The frontage"),
  ],
  amenities: {
    heading: "Amenities.",
    source: "From the Viraj Avenue brochure",
    frame: "rect",
    featured: [],
    groups: [{ title: "At Viraj Avenue", items: viraj.amenities }],
  },
  location: {
    // Brochure p7, "SITE".
    address: "Viraj Avenue, Opp. Bali Mandir, Panchavati Annex, Nashik.",
    image: img(`${V}/location-map.webp`, 3457, 1188, "Location map of Viraj Avenue, from the brochure"),
    kind: "map",
    connectivity: [
      "On the Mumbai-Agra Highway",
      "Opposite Bali Mandir, Panchavati Annex",
      "Between Adgaon Naka and Dhatrak Phata",
    ],
    source: "Map and site address from the Viraj Avenue brochure",
  },
  // Brochure p3–p5; titles as printed.
  plans: {
    primary: 0,
    items: [
      { title: "Ground Floor Plan", image: img(`${V}/plan-ground-floor.webp`, 2550, 1725, "Viraj Avenue — Ground Floor Plan") },
      { title: "First Floor Plan", image: img(`${V}/plan-first-floor.webp`, 2550, 1725, "Viraj Avenue — First Floor Plan") },
      { title: "Typical 2nd to 3rd Floor Plan", image: img(`${V}/plan-second-to-third-floor.webp`, 2550, 1725, "Viraj Avenue — Typical 2nd to 3rd Floor Plan") },
    ],
    source: "From the Viraj Avenue brochure",
  },
  brochure: {
    href: "/brochures/viraj-avenue-brochure.pdf",
    fileName: "Viraj Avenue — Brochure.pdf",
    pages: 7,
    sizeMb: 14.2,
    edition: "E-Brochure",
    cover: img(`${V}/brochure-cover-page.webp`, 1200, 816, "The cover of the Viraj Avenue brochure"),
  },
  // Brochure p7: "For more information click : 72 77 99 55 66".
  enquiry: PROJECT_PHONE,
  // Brochure p7, verbatim.
  disclaimer:
    "The contents of this brochure are purely conceptual and have no legal bindings on us. Developers reserve the right of amend the layout plans, number of floors & units, elevation, colour scheme, specifications and amenities etc. without notice.",
};

/* -------------------------------------------------------------------------- */

/** Flagship first, then the order of the homepage's Projects section. */
export const projectDetails: ProjectDetail[] = [
  milestone,
  urbaniaDetail,
  floraDetail,
  auraDetail,
  blissDetail,
  aaryanaDetail,
  virajDetail,
];

export const getProjectDetail = (slug: string) => projectDetails.find((p) => p.slug === slug) ?? null;

export const projectHref = (slug: string) => `/projects/${slug}`;
