/* ============================================================
   Bonorong Wildlife Sanctuary — visitor app prototype
   Data layer. All content is fictional placeholder content
   created for KIT519 Assignment 2 (Group 24).
   ============================================================ */

/* The prototype runs on a fixed demo clock so that show statuses
   are the same in every test session, no matter what time of day
   the session is run. Change DEMO_TIME to test other states.     */
const DEMO_TIME = { h: 10, m: 15 };   // 10:15 AM

const ANIMALS = [
  {
    id: 'devil',
    name: 'Tasmanian Devil',
    species: 'Sarcophilus harrisii',
    enclosure: 3,
    distance: 120,
    walkMins: 2,
    map: { x: 62, y: 30 },
    quote: "Hi! I'm a Tasmanian devil — my yawn looks scary but it's mostly nerves.",
    about: 'Tasmanian devils are the largest surviving carnivorous marsupial. The devils at Bonorong are part of an insurance population protecting the species from a transmissible facial tumour disease.',
    feeding: 'Devils are scavengers and eat almost every part of a carcass, bones included. Keepers feed them once a day, usually in the morning.',
    conservation: 'Listed as endangered. Bonorong works with the Save the Tasmanian Devil Program to maintain healthy, disease-free animals.',
    facts: [['SLEEPS', 'Most of the day'], ['EATS', 'Meat, bones'], ['STATUS', 'Endangered']],
  },
  {
    id: 'koala',
    name: 'Koala',
    species: 'Phascolarctos cinereus',
    enclosure: 4,
    distance: 180,
    walkMins: 3,
    map: { x: 22, y: 38 },
    quote: "Hi! I'm a koala — I sleep up to 20 hours a day.",
    about: 'Koalas eat only eucalyptus leaves, which give so little energy that they rest most of the day. Tasmania’s koalas at Bonorong are rescued animals that cannot return to the wild.',
    feeding: 'Fresh eucalyptus browse is cut daily. A koala is fussy — it will eat only a handful of the hundreds of eucalypt species.',
    conservation: 'Listed as endangered in parts of mainland Australia, mainly through habitat loss and bushfire.',
    facts: [['SLEEPS', 'Up to 20 hrs'], ['EATS', 'Eucalyptus'], ['STATUS', 'Endangered']],
  },
  {
    id: 'wombat',
    name: 'Bare-Nosed Wombat',
    species: 'Vombatus ursinus',
    enclosure: 1,
    distance: 240,
    walkMins: 4,
    map: { x: 46, y: 62 },
    quote: "Hi! I'm a wombat — my burrow is longer than your house.",
    about: 'Bare-nosed wombats dig burrow systems up to twenty metres long. Their backward-facing pouch keeps dirt out of it while they dig.',
    feeding: 'Grasses, roots and bark. A wombat’s teeth never stop growing, so tough food keeps them worn down.',
    conservation: 'Not threatened in Tasmania, but mange and road strike are ongoing local pressures.',
    facts: [['SLEEPS', 'Day, in burrow'], ['EATS', 'Grass, roots'], ['STATUS', 'Least concern']],
  },
  {
    id: 'kangaroo',
    name: 'Forester Kangaroo',
    species: 'Macropus giganteus tasmaniensis',
    enclosure: 2,
    distance: 90,
    walkMins: 2,
    map: { x: 74, y: 66 },
    quote: "Hi! I'm a Forester kangaroo — you can hand-feed me if you're gentle.",
    about: 'The Forester is Tasmania’s only large kangaroo and the subspecies of the eastern grey. The mob at Bonorong roams freely and can be hand-fed by visitors.',
    feeding: 'Grazes on grasses. Visitors can hand-feed them with the food provided at the entry — please use a flat, open hand.',
    conservation: 'Recovered from very low numbers in the twentieth century; now stable in protected areas.',
    facts: [['SLEEPS', 'Midday shade'], ['EATS', 'Grasses'], ['STATUS', 'Stable']],
  },
  {
    id: 'quoll',
    name: 'Eastern Quoll',
    species: 'Dasyurus viverrinus',
    enclosure: 5,
    distance: 310,
    walkMins: 5,
    map: { x: 34, y: 18 },
    quote: "Hi! I'm an eastern quoll — those white spots are my fingerprints.",
    about: 'Eastern quolls are extinct on mainland Australia and survive in the wild only in Tasmania. Every quoll has its own pattern of white spots.',
    feeding: 'Insects, small mammals and fruit. Quolls are nocturnal, so they are fed in the late afternoon.',
    conservation: 'Endangered. Bonorong takes part in captive breeding to support mainland reintroduction trials.',
    facts: [['SLEEPS', 'Daytime'], ['EATS', 'Insects, meat'], ['STATUS', 'Endangered']],
  },
  {
    id: 'echidna',
    name: 'Short-beaked Echidna',
    species: 'Tachyglossus aculeatus',
    enclosure: 6,
    distance: 150,
    walkMins: 3,
    map: { x: 30, y: 76 },
    quote: "Hi! I'm an echidna — I lay eggs, which makes me very unusual indeed.",
    about: 'Echidnas are monotremes: mammals that lay eggs. They have no teeth and collect ants and termites with a long sticky tongue.',
    feeding: 'Ants and termites, found by detecting the tiny electrical signals the insects give off.',
    conservation: 'Widespread and not threatened, but frequently injured on roads.',
    facts: [['SLEEPS', 'Varies'], ['EATS', 'Ants, termites'], ['STATUS', 'Least concern']],
  },
];

const SHOWS = [
  { id: 's1', title: 'Tasmanian Devil Feeding', animal: 'devil', start: '10:00', end: '10:30', note: 'Free with entry', closed: false },
  { id: 's2', title: 'Wombat!', animal: 'wombat', start: null,   end: null,   note: 'Today',            closed: true  },
  { id: 's3', title: 'Koala Walk',  animal: 'koala',  start: '11:00', end: '12:00', note: 'Free with entry', closed: false },
  { id: 's4', title: 'Kangaroo Hand-feeding', animal: 'kangaroo', start: null, end: null, note: 'All day · free with entry', closed: false, allDay: true },
];

const FACILITIES = [
  { id: 'f1', name: 'Toilets — Accessible', sub: 'Baby change · ramp access', distance: 150, walkMins: 2, map: { x: 82, y: 22 }, icon: 'wc' },
  { id: 'f2', name: 'Canteen',            sub: 'Open until 4:30 PM',          distance: 250, walkMins: 3, map: { x: 12, y: 74 }, icon: 'food' },
  { id: 'f3', name: 'Water fountain',     sub: 'Bottle refill',               distance: 60,  walkMins: 1, map: { x: 52, y: 52 }, icon: 'water' },
  { id: 'f4', name: 'Gift shop',          sub: 'Near the entrance',           distance: 300, walkMins: 4, map: { x: 8,  y: 20 }, icon: 'shop' },
  { id: 'f5', name: 'First aid',          sub: 'Visitor centre',              distance: 280, walkMins: 4, map: { x: 6,  y: 46 }, icon: 'aid' },
];

const QA = [
  { q: 'What time is the devil feeding?', a: 'The Tasmanian devil feeding runs at 10:00 AM daily and takes about thirty minutes. Check the show list on the map for today’s status.' },
  { q: 'Where are the toilets?', a: 'There are accessible toilets beside the visitor centre and a second block near the kangaroo paddock. Both appear on the map.' },
  { q: 'Can I feed the kangaroos?', a: 'Yes. Kangaroo food is provided at the entry and is included with your ticket. Use a flat, open hand and let the kangaroo come to you.' },
  { q: 'Is the sanctuary pram friendly?', a: 'Yes. All main paths are sealed or compacted gravel and suitable for prams and wheelchairs. Turn on the accessible route in settings to avoid steps.' },
  { q: 'What happens if it rains?', a: 'The sanctuary stays open in the rain, and the animals are often more active. Some keeper talks may move to a sheltered area.' },
  { q: 'Can I bring my own food?', a: 'Yes, there are picnic areas near the entrance. Please do not feed your own food to any animal.' },
];

const MEMBERSHIPS = [
  { id: 'family',     name: 'Family',     sub: 'Most popular',                 price: '$120 per year' },
  { id: 'adult',      name: 'Adult',      sub: 'Single visitor',               price: '$60 per year' },
  { id: 'concession', name: 'Concession', sub: 'Student, senior, healthcare',  price: '$45 per year' },
];

const DONATIONS = ['$5', '$20', '$100', 'Other'];
