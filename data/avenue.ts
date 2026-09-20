/**
 * ============================================================================
 *  THE AVENUE — CENTRAL DATA LAYER
 * ============================================================================
 *
 *  Single source of truth for every piece of Avenue content on the site.
 *  Edit here and it changes everywhere; nothing below is duplicated inside a
 *  component.
 *
 *  SOURCE: the official Avenue site only — tabd.in, and each project's own
 *  page (/urbania, /flora-2, /aura, /bliss, /about-us). Fields the official
 *  site does not publish are null or an empty array rather than filled with a
 *  guess, and each one carries a comment saying why.
 * ============================================================================
 */

/* -------------------------------------------------------------------------- */
/*  COMPANY                                                                   */
/* -------------------------------------------------------------------------- */

export type Company = {
  name: string;
  shortName: string;
  description: string;
  established: number;
  location: string;
  tagline: string;
  mission: string | null;
  vision: string | null;
  values: string | null;
  phone: string;
  phoneHref: string;
  email: string;
  emailHref: string;
  address: string;
};

export const company: Company = {
  name: "The Avenue Builders & Developers",
  shortName: "The Avenue",
  description:
    "Avenue Builders & Developers, established in 2007, is a leading property Development and Construction company in Nashik with more than a decade's combined experience and over 1 Million Sq.Ft delivered till date.",
  established: 2007,
  location: "Nashik",
  tagline:
    "Introducing you to a life you've aspired for, and world-class designs you've always yearned for.",
  // The opening clause of the mission statement was cut off when the page was
  // read, so only the part that could be quoted verbatim is stored. Worth
  // re-checking against /about-us before this is ever put on screen.
  mission:
    "We continuously learn and observe new trends and customer requirements.",
  vision:
    "Being a progressive property developer that prides itself on its proven track records, passion and commitment to deliver superior value in design, quality and service in our developments to our customers.",
  values:
    "We deliver beyond residential properties. We deliver to our customers the joy of living, the serenity of space and the place to interact with their family.",
  phone: "+91 9373632323",
  phoneHref: "tel:+919373632323",
  email: "theavenuensk@gmail.com",
  emailHref: "mailto:theavenuensk@gmail.com",
  address:
    "Shop No 1, The Avenue, Chowk No 1, Behind Prakash Petrol Pump, Govind Nagar, Nashik",
};

/**
 * Social profiles — The Avenue's own accounts, in the order the footer and
 * menu show them.
 */
export const socials = [
  { label: "Instagram", href: "https://www.instagram.com/theavenuebuilders/" },
  {
    label: "Facebook",
    href: "https://www.facebook.com/premium.business.spaces",
  },
  {
    label: "YouTube",
    href: "https://www.youtube.com/@TheAvenueSignaturesSpaces",
  },
] as const;

/* -------------------------------------------------------------------------- */
/*  PROJECTS                                                                  */
/* -------------------------------------------------------------------------- */

export type Project = {
  slug: string;
  name: string;
  /** Verbatim project statement from its own page. */
  statement: string;
  configuration: string;
  category: "Residential" | "Commercial";
  /** Locality as stated on the project page, or null when none is given. */
  locality: string | null;
  /** Full street address where the project page publishes one. */
  address: string | null;
  status: string;
  description: string;
  image: string;
  amenities: string[];
  /** Connectivity and specification points published on the project page. */
  features: string[];
  /** Project-specific phone, where the project page gives one. */
  contact: string | null;
  /**
   * Placement on the stylised plan in ExploreDevelopments, as percentages.
   * Composition values, NOT surveyed positions — the official site publishes
   * no coordinates, which is why that panel is captioned "indicative".
   * Replace with projected real coordinates when they are available.
   */
  plan: { x: number; y: number };
};

export const projects: Project[] = [
  {
    slug: "urbania",
    name: "Urbania",
    statement: "An elite abode that reflects the best of you.",
    configuration: "3 & 4 BHK",
    category: "Residential",
    // The Urbania page itself states no address; its location map and the
    // brochures' "our ongoing project" page place it at Karmayogi Nagar.
    locality: "Karmayogi Nagar, Nashik",
    address: null,
    status: "Ongoing",
    description:
      "Fortune Urbania 3 & 4 BHK residences are created for those who never compromise.",
    // No Urbania brochure was supplied, so the official site's render stays.
    image: "/urbania.jpg",
    // The four tiers the Urbania page sets out, in its own words.
    amenities: [
      "Spectacular infinity swimming pool for adults & kids",
      "Indoor gym",
      "Jogging track",
      "Multi purpose hall",
      "Indoor game",
      "Outdoor game",
      "Seating arrangement",
      "Designer landscaped garden",
      "Outdoor children park with rubberized flooring",
      "Senior citizens park with aroma therapy garden",
      "Spacious yoga aerobics lawn",
      "Community garden",
      "Open air theatre",
      "Grand entrance foyer",
      "A magnificent reception area",
    ],
    features: [
      "72 luxurious residences",
      "2 sky-scaling towers of 20",
      "Per floor 2 apartment",
      "Around 10'6\" floor height",
      "Mumbai Naka 5 minutes",
      "City Centre Mall 5 minutes",
      "Wockhardt Hospital 10 minutes",
      "Fravashi Academy 16 minutes",
      "Nashik Station 20 minutes",
      "ABB Circle 20 minutes",
    ],
    contact: null, // no phone published on the Urbania page
    plan: { x: 33, y: 30 },
  },
  {
    slug: "flora",
    name: "Flora",
    statement: "A new era of affordability.",
    configuration: "Showrooms & Offices",
    category: "Commercial",
    locality: "Old Gangapur Naka, Gangapur Road, Nashik",
    address:
      "Old Gangapur Naka, Behind Vihar Misal, Gangapur Road, Nashik 422013",
    status: "Possession Soon",
    description:
      "An iconic commercial destination featuring modern architecture, located in landmark Old Gangapur Naka, minutes from CBS and College Road.",
    // The Flora brochure's own render (p2), at its full resolution.
    image: "/projects/flora/exterior.webp",
    amenities: [
      "High-speed branded elevators",
      "CCTV security surveillance",
      "Solar power backup for lifts and common areas",
      "Pantry facilities",
      "Branded fittings",
      "Green gym",
      "Yoga deck",
      "Senior citizen seating areas",
    ],
    features: [
      "Office spaces (555 to 1790 Sq.ft.)",
      "Showroom spaces (1297 to 3162 Sq.ft.)",
      "Elite options for Advocates, Doctors, CAs & Professionals",
      "Old Gangapur Naka, in the heart of the city",
      "Minutes from CBS & College Road",
    ],
    contact: "+91 9699006377",
    plan: { x: 67, y: 24 },
  },
  {
    slug: "aura",
    name: "Aura",
    statement: "Elevate your life.",
    configuration: "Limited Edition 3 & 4 BHK Homes",
    category: "Residential",
    locality: "Govind Nagar, Nashik",
    address:
      "S. No. 803, Plot No. 25/26, Chowk No. 1, Behind Prakash Petrol Pump, Govind Nagar, Nashik",
    status: "Ready Possession",
    description:
      "Step into a world of elegance. A micro-level planned layout designed to meet multinational standards, with flexible floor plates for interior planning and specifications based on global health and safety requirements.",
    // The Aura brochure's dusk elevation (p17). Its daylight elevation (p2)
    // is the homepage Portrait image, so the two never repeat.
    image: "/projects/aura/hero.webp",
    amenities: [
      "Rooftop infinity pool",
      "Rooftop pantry / barbeque area",
      "Children's play area",
      "Lord Ganesh temple",
      "Rooftop jogging / walking track",
      "Yoga / aerobics deck",
      "Senior citizen seating",
      "Indoor games",
      "Box cricket",
      "Well-equipped gym",
      "Sandpit",
      "Rooftop seating alcove",
      "Rooftop green gym",
      "Rooftop reflexology path",
      "Rooftop artificial lawn",
      "EV Charging Point",
    ],
    features: [
      "3 BHK 1484 Sq.ft. | 4 BHK 2263 & 2467 Sq.ft.",
      "45+ curated lifestyle amenities",
      "Close proximity to City Centre as well as other conveniences",
      "2 minutes drive from Mahamarg Bus Stand and Mumbai Naka",
      "15 minutes drive from Ozar Airport",
      "30 feet main access road",
    ],
    contact: "+91 7277995566",
    plan: { x: 30, y: 55 },
  },
  {
    slug: "bliss",
    name: "Bliss",
    statement: "Perfect happiness.",
    configuration: "Limited Edition 2 & 3 BHK Homes, Penthouse & Shops",
    category: "Residential",
    locality: "Govind Nagar, Nashik",
    address:
      "S. No. 788, Chowk No. 4, Behind Prakash Petrol Pump, Govind Nagar, Nashik",
    status: "Ready Possession",
    description:
      "Thoughtfully designed luxurious 2 and 3 BHK apartments, with distinctive specifications and entertainment hubs, lush green corners. Centrally located in the heart of Nashik.",
    // The Bliss brochure's elevation (p2), at its full resolution — the only
    // high-resolution view of the building the brochure carries.
    image: "/projects/bliss/elevation.webp",
    amenities: [
      "Roof Top Green Gym",
      "Indoor Game Play Area",
      "Party lawn",
      "Senior Citizen Sitting",
      "E Vehicle Charging Point",
      "Yoga Deck",
      "Jogging Track",
      "24x7 Security Systems & Power Backup",
    ],
    features: [
      "2 BHK (1078, 1114, 1184 Sq.ft. | Carpet 670–745 Sq.ft.)",
      "3 BHK (1396, 1434 Sq.ft.) & 3 BHK Penthouse (1877 Sq.ft.)",
      "Commercial Shops (250–350 Sq.ft.)",
      "Centrally located in Govind Nagar, Nashik",
    ],
    contact: "+91 7277995566",
    plan: { x: 70, y: 54 },
  },
  {
    slug: "aaryana",
    name: "Aaryana",
    // Brochure cover: "Modern Luxury…".
    statement: "Modern luxury.",
    configuration: "Premium 3 BHK & Penthouse",
    category: "Residential",
    locality: "Karmayogi Nagar, Nashik",
    // Cover, and the site line on the brochure's location map.
    address: "Karmayogi Nagar, Near R.D. Circle, Nashik",
    status: "Ongoing",
    description:
      "An epitome of opulence, a Premium Edition 3 BHK Class home meticulously crafted with precision, employing cutting-edge technology, and featuring intelligently designed spaces.",
    image: "/projects/aaryana/exterior.webp",
    // Brochure p9, "Features", "Amenities" and "3 Tier Security & Safety".
    amenities: [
      "EV Charging Station",
      "Vastu Compliant Architecture",
      "CCTV Surveillance 24x7",
      "Solar Provision",
      "Designer Entrance Lobby & Waiting Area",
      "High speed branded elevator with auto door and S.S. cabin",
      "Allotted parking with chequered tiles / trimix flooring / paver block",
      "Seismic resistant RCC structure",
      "Municipal water facility",
      "Light arrester provision",
      "Video door phone security",
      "Compound wall with secured gates",
    ],
    features: [
      "3 BHK 1947 Sq.ft. & 4 BHK Penthouse 2912 Sq.ft.",
      "One Floor Two Flat layout for optimal privacy",
      "Six floors of residences, with a common terrace",
      "Nestled conveniently along the Mumbai-Agra Highway",
      "Near R.D. Circle, close to premier city destinations",
    ],
    // Brochure p11: "For more information : 9373632323, 7277995566".
    contact: "+91 9373632323",
    plan: { x: 46, y: 42 },
  },
  {
    slug: "viraj-avenue",
    name: "Viraj Avenue",
    // Brochure cover: "Discover a World of Opportunities…".
    statement: "Discover a world of opportunities.",
    configuration: "Showrooms, Offices, Shops, Banquet Hall & Hospital",
    category: "Commercial",
    locality: "Panchavati Annex, Nashik",
    address: "Viraj Avenue, Opp. Bali Mandir, Panchavati Annex, Nashik",
    status: "Ongoing",
    description:
      "An upcoming landmark in Nashik, offering a blend of Modern Office Spaces, Showrooms, Shops, a Banquet Hall, and a Hospital. Strategically located opposite Bali Mandir, Panchavati Annex.",
    image: "/projects/viraj-avenue/exterior.webp",
    // Brochure p6, "Amenities".
    amenities: [
      "Modern Office Spaces (407–750 Sq.ft.)",
      "Spacious Showrooms (1600 & 2750 Sq.ft.)",
      "Versatile Shops with Mezzanine",
      "Elegant Banquet Hall",
      "Advanced Hospital Facilities",
      "Ample Stack Parking Space",
      "24/7 Security Surveillance",
    ],
    features: [
      "Office spaces (407–750 Sq.ft.)",
      "Showroom spaces (1600 & 2750 Sq.ft.)",
      "Shops with a mezzanine above each",
      "Banquet Hall & Hospital facilities",
      "Stack parking",
      "On the Mumbai-Agra Highway, opposite Bali Mandir",
    ],
    // Brochure p7: "For more information click: 72 77 99 55 66".
    contact: "+91 7277995566",
    plan: { x: 54, y: 68 },
  },
];

export const getProject = (slug: string) =>
  projects.find((project) => project.slug === slug) ?? null;

/* -------------------------------------------------------------------------- */
/*  DIRECTORS                                                                 */
/* -------------------------------------------------------------------------- */

export type Director = {
  name: string;
  qualification: string;
  /** Responsibility as described on the official site. */
  role: string;
  /**
   * Portrait path. Real photograph from the Avenue Profile 2025 presentation.
   */
  image: string | null;
};

export const directorsHeading = "Meet the directors of The Avenue.";

export const directors: Director[] = [
  {
    name: "Mr. Mukund Sabu",
    qualification: "MBA in Marketing",
    role: "15+ years in Real Estate. Leads Sales & Execution, ensuring high-quality client service and timely on-budget delivery.",
    image: "/team/mukund-sabu.webp.png",
  },
  {
    name: "Mr. Nayan Bhandari",
    qualification: "MBA in Finance",
    role: "17+ years in finance & accounting. Drives financial planning, budgeting, analysis, and strategic growth.",
    image: "/team/nayan-bhandari.webp.png",
  },
  {
    name: "Mr. Yogesh Bedmutha",
    qualification: "BE E&TC",
    role: "20 years of diverse expertise. Heads marketing & design, creating distinctive aesthetics with out-of-the-box strategy.",
    image: "/team/yogesh-bedmutha.webp.png",
  },
];

/* -------------------------------------------------------------------------- */
/*  MILESTONES                                                                */
/* -------------------------------------------------------------------------- */

export type Milestone = {
  /** Null when the official site does not state a year — never guessed. */
  year: number | null;
  title: string;
  description: string | null;
  image: string | null;
};

/**
 * The company journey, transcribed from tabd.in.
 *
 * The official site presents these under two headings — "The Journey Of Avenue
 * Developers" and "Company Milestones" — as a strip of project identity marks.
 *
 * IT PUBLISHES NO YEARS AND NO PER-MILESTONE DESCRIPTIONS, so `year` and
 * `description` are null on every entry rather than being guessed. The order
 * below is the order the marks appear in on the page, which is the only
 * defensible sequence available: without dates there is nothing to sort by.
 *
 * `image` is each project's own wordmark, captured from the official site.
 * They are artwork on white, not photographs — the journey page plates them on
 * a light card for that reason.
 *
 * Two names differ from their file names, which carry typos at source:
 * "granduare300x300.png" renders the mark GRANDEUR, and "urbenia300X300.png"
 * renders URBANIA. The names below follow the artwork, not the filename.
 */
export const milestoneHeadings = {
  eyebrow: "The Journey Of Avenue Developers",
  title: "Company Milestones",
  statement:
    "The Avenue Group has become synonymous with quality, timely executions, customer satisfaction, giving before-time delivery of units, and most importantly unique innovations.",
} as const;

export const milestones: Milestone[] = [
  {
    year: null,
    title: "The Avenue Grandeur",
    description: null,
    image: "/journey/granduare.png",
  },
  {
    year: null,
    title: "The Avenue NX",
    description: null,
    image: "/journey/nx.png",
  },
  {
    year: null,
    title: "The Avenue",
    description: null,
    image: "/journey/theavenue.png",
  },
  {
    year: null,
    title: "The Avenue Casa",
    description: null,
    image: "/journey/casa.png",
  },
  {
    year: null,
    title: "The Avenue Milestone",
    description: null,
    image: "/journey/milestone.png",
  },
  {
    year: null,
    title: "The Avenue Urbania",
    description: null,
    image: "/journey/urbania.png",
  },
  {
    year: null,
    title: "The Avenue One",
    description: null,
    image: "/journey/one.png",
  },
  {
    year: null,
    title: "The Avenue Flora",
    description: null,
    image: "/journey/flora.png",
  },
  {
    year: null,
    title: "The Avenue Bliss",
    description: null,
    image: "/journey/bliss.png",
  },
  {
    year: null,
    title: "The Avenue Aura",
    description: null,
    image: "/journey/aura.png",
  },
];

/* -------------------------------------------------------------------------- */
/*  TESTIMONIALS                                                              */
/* -------------------------------------------------------------------------- */

export type Testimonial = {
  quote: string;
  name: string;
  /** Optional — shown as a small label under the name. */
  project?: string;
  /** Optional. The official site publishes no ratings, so none are set. */
  rating?: number;
};

/**
 * ============================================================
 *  ADD OR EDIT TESTIMONIALS HERE. The marquee measures itself
 *  from this list, so any number of entries loops seamlessly.
 * ============================================================
 */
export const testimonials: Testimonial[] = [
  {
    quote:
      "We were looking for a dream home in Nashik. I have bought 3 BHK flat in Flora and I am happy.",
    name: "Sarthak Patil",
  },
  {
    quote:
      "Everything is so perfect and well maintained. Most importantly the return on investment has been very encouraging.",
    name: "Mr. Jeevan Ram",
  },
  {
    quote:
      "We choose Urbania because of the space, huge club house and lots of amenities which is necessity of todays life.",
    name: "Sachin Joshi",
    project: "Urbania",
  },
];

/* -------------------------------------------------------------------------- */
/*  ROUTES                                                                    */
/* -------------------------------------------------------------------------- */

/** Where every project enquiry goes; the only route that exists for this. */
export const ENQUIRE_HREF = "/contact";
