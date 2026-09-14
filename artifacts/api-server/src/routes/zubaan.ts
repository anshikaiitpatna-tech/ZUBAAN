import { Router, type IRouter } from "express";
import {
  CreateLearningRequestBody,
  CreateLineageResponseBody,
  CreateRecordingBody,
  GetCapsuleParams,
  GetLineageParams,
  ListCapsulesQueryParams,
  type Artisan,
  type Capsule,
  type LearningRequestInput,
  type LineageResponseInput,
  type RecordingInput,
} from "@workspace/api-zod";

const shanti: Artisan = {
  id: "shanti-devi",
  name: "Shanti Devi",
  village: "Bhagalpur",
  region: "Bihar",
  craft: "Sujani",
  dialect: "Maithili",
  initials: "SD",
  palette: "terracotta",
  story:
    "A third-generation Sujani maker, Shanti learned by watching her mother stitch stories into old saris.",
};

const kamla: Artisan = {
  id: "kamla-devi",
  name: "Kamla Devi",
  village: "Lucknow",
  region: "Uttar Pradesh",
  craft: "Embroidery",
  dialect: "Hindi",
  initials: "KD",
  palette: "ochre",
  story:
    "Kamla carries the fine needlework vocabulary of her nani, with a patience measured in tiny stitches.",
};

const rukmini: Artisan = {
  id: "rukmini-bai",
  name: "Rukmini Bai",
  village: "Bhujodi",
  region: "Gujarat",
  craft: "Weaving",
  dialect: "Gujarati",
  initials: "RB",
  palette: "sage",
  story:
    "At the loom, Rukmini listens for the right tension before she lets the shuttle pass.",
};

const madhuri: Artisan = {
  id: "madhuri-das",
  name: "Madhuri Das",
  village: "Murshidabad",
  region: "West Bengal",
  craft: "Kantha",
  dialect: "Bengali",
  initials: "MD",
  palette: "indigo",
  story:
    "Madhuri makes Kantha blankets from cloth that has already lived one life, then another.",
};

const artisans: Artisan[] = [
  shanti,
  kamla,
  rukmini,
  madhuri,
  {
    id: "saraswati-prajapati",
    name: "Saraswati Prajapati",
    village: "Khurja",
    region: "Uttar Pradesh",
    craft: "Pottery",
    dialect: "Hindi",
    initials: "SP",
    palette: "clay",
    story: "Saraswati shapes water pots with the heel of her palm and a song for every curve.",
  },
];

const capsules: Capsule[] = [
  {
    id: "running-stitch",
    artisan: shanti,
    title: "The stitch my mother taught me",
    description:
      "Shanti Devi remembers the first line she stitched on her mother's sari, and why a straight stitch is never truly straight.",
    craft: "Sujani",
    dialect: "Maithili",
    village: "Bhagalpur",
    region: "Bihar",
    duration: "04:38",
    date: "12 Aug 2024",
    lineage: "ORIGINAL MASTER",
    audioUrl: "",
    parentId: null,
    transcript: [
      {
        id: "r1",
        start: 0,
        end: 6,
        original: "ई सिलाई हमार माई हमरा सिखवले रहली।",
        bridge: "This is the stitch my mother taught me.",
      },
      {
        id: "r2",
        start: 6,
        end: 15,
        original: "पहिले कपड़ा के सांस सुनल जरूरी होइत छै।",
        bridge: "First, you must listen for the cloth's breath.",
      },
      {
        id: "r3",
        start: 15,
        end: 26,
        original: "टांका छोट हो, बाकि कहानी लम्बा।",
        bridge: "The tanka may be small, but the story is long.",
      },
    ],
  },
  {
    id: "needle-memory",
    artisan: kamla,
    title: "A needle remembers the hand",
    description:
      "Kamla Devi shares the small wrist movement that makes a chikankari flower feel like it is opening.",
    craft: "Embroidery",
    dialect: "Hindi",
    village: "Lucknow",
    region: "Uttar Pradesh",
    duration: "06:12",
    date: "28 Jul 2024",
    lineage: "ORIGINAL MASTER",
    audioUrl: "",
    parentId: null,
    transcript: [
      { id: "k1", start: 0, end: 8, original: "सुई हाथ को याद रखती है।", bridge: "A needle remembers the hand." },
      { id: "k2", start: 8, end: 18, original: "कपड़े को खींचना नहीं, सहारा देना है।", bridge: "Do not pull the cloth; give it support." },
    ],
  },
  {
    id: "loom-breath",
    artisan: rukmini,
    title: "The rhythm inside the loom",
    description:
      "In Bhujodi, Rukmini Bai listens for the moment when wool and cotton begin to agree with each other.",
    craft: "Weaving",
    dialect: "Gujarati",
    village: "Bhujodi",
    region: "Gujarat",
    duration: "05:04",
    date: "19 Jun 2024",
    lineage: "ORIGINAL MASTER",
    audioUrl: "",
    parentId: null,
    transcript: [
      { id: "r1", start: 0, end: 7, original: "સાળમાં શ્વાસ જેવો તાલ છે.", bridge: "There is a breath-like rhythm in the loom." },
      { id: "r2", start: 7, end: 16, original: "તાણ સાંભળો, પછી દોરો પસાર કરો.", bridge: "Listen to the tension, then pass the thread." },
    ],
  },
  {
    id: "old-cloth-new-life",
    artisan: madhuri,
    title: "Old cloth, another life",
    description:
      "Madhuri Das shows how worn cloth becomes a Kantha quilt, held together by the memory of many homes.",
    craft: "Kantha",
    dialect: "Bengali",
    village: "Murshidabad",
    region: "West Bengal",
    duration: "07:28",
    date: "03 May 2024",
    lineage: "ORIGINAL MASTER",
    audioUrl: "",
    parentId: null,
    transcript: [
      { id: "m1", start: 0, end: 7, original: "পুরনো কাপড় ফেলে দিতে নেই।", bridge: "Old cloth should not be thrown away." },
      { id: "m2", start: 7, end: 17, original: "তার গায়ে বাড়ির গন্ধ থাকে।", bridge: "It still carries the smell of a home." },
    ],
  },
  {
    id: "sujani-denim",
    artisan: { ...shanti, name: "Ananya Mehta", village: "New Delhi", initials: "AM", palette: "indigo" },
    title: "Sujani on denim",
    description: "Ananya carries Shanti Ma's running stitch onto an old denim jacket.",
    craft: "Sujani",
    dialect: "Hindi",
    village: "New Delhi",
    region: "Delhi",
    duration: "02:54",
    date: "06 Sep 2024",
    lineage: "COMMUNITY CONTINUATION",
    audioUrl: "",
    parentId: "running-stitch",
    transcript: [
      { id: "a1", start: 0, end: 8, original: "मैंने टांका अपनी जैकेट पर आज़माया।", bridge: "I tried the tanka on my jacket." },
    ],
  },
  {
    id: "canvas-bag",
    artisan: { ...shanti, name: "Meera Kulkarni", village: "Mumbai", initials: "MK", palette: "sage" },
    title: "A running stitch for a moving city",
    description: "Meera adapts the humble line into a sturdy pattern for everyday canvas bags.",
    craft: "Sujani",
    dialect: "Hindi",
    village: "Mumbai",
    region: "Maharashtra",
    duration: "03:10",
    date: "18 Sep 2024",
    lineage: "COMMUNITY CONTINUATION",
    audioUrl: "",
    parentId: "running-stitch",
    transcript: [
      { id: "me1", start: 0, end: 9, original: "हर सिलाई रास्ते जैसी लगती है।", bridge: "Every stitch feels like a path." },
    ],
  },
  {
    id: "notebook-covers",
    artisan: { ...shanti, name: "Rahul Nair", village: "Bengaluru", initials: "RN", palette: "ochre" },
    title: "Sujani-inspired notebook covers",
    description: "Rahul brings Shanti Devi's rhythm to cloth covers for the notebooks he carries everywhere.",
    craft: "Sujani",
    dialect: "Hindi",
    village: "Bengaluru",
    region: "Karnataka",
    duration: "02:21",
    date: "24 Sep 2024",
    lineage: "COMMUNITY CONTINUATION",
    audioUrl: "",
    parentId: "running-stitch",
    transcript: [
      { id: "ra1", start: 0, end: 9, original: "कहानी अब कागज़ के साथ चलती है।", bridge: "Now the story travels with paper." },
    ],
  },
  {
    id: "contemporary-clothing",
    artisan: { ...shanti, name: "Kavya Jha", village: "Patna", initials: "KJ", palette: "terracotta" },
    title: "Old motifs, new silhouettes",
    description: "Kavya keeps the motif intact while letting it move across contemporary clothing.",
    craft: "Sujani",
    dialect: "Maithili",
    village: "Patna",
    region: "Bihar",
    duration: "03:42",
    date: "02 Oct 2024",
    lineage: "COMMUNITY CONTINUATION",
    audioUrl: "",
    parentId: "running-stitch",
    transcript: [
      { id: "ka1", start: 0, end: 9, original: "नक्शा वही है, कपड़ा बदल गया।", bridge: "The motif is the same; the cloth has changed." },
    ],
  },
];

const lineage = {
  id: "sujani",
  title: "Sujani Master Lesson",
  root: {
    id: "root",
    name: "Shanti Devi",
    location: "Bhagalpur",
    title: "Sujani Master Lesson",
    type: "root" as const,
    x: 50,
    y: 14,
    capsuleId: "running-stitch",
  },
  nodes: [
    { id: "ananya", name: "Ananya", location: "Delhi", title: "Sujani on denim", type: "continuation" as const, x: 15, y: 64, capsuleId: "sujani-denim" },
    { id: "meera", name: "Meera", location: "Mumbai", title: "Running stitch on canvas bags", type: "continuation" as const, x: 39, y: 78, capsuleId: "canvas-bag" },
    { id: "rahul", name: "Rahul", location: "Bengaluru", title: "Sujani-inspired notebook covers", type: "continuation" as const, x: 63, y: 78, capsuleId: "notebook-covers" },
    { id: "kavya", name: "Kavya", location: "Patna", title: "Traditional motifs in contemporary clothing", type: "continuation" as const, x: 87, y: 64, capsuleId: "contemporary-clothing" },
  ],
};

const recordings: Array<RecordingInput & { id: string; status: "saved" | "queued" | "uploaded"; createdAt: string }> = [];
const learningRequests: Array<LearningRequestInput & { id: string; status: "pending" | "accepted" | "declined"; voicePreview: string }> = [];
const lineageResponses: Array<LineageResponseInput & { id: string; createdAt: string }> = [];

const router: IRouter = Router();

router.get("/capsules", (req, res) => {
  const filters = ListCapsulesQueryParams.parse(req.query);
  const data = capsules.filter((capsule) =>
    (!filters.craft || filters.craft === "All" || capsule.craft === filters.craft) &&
    (!filters.dialect || filters.dialect === "All" || capsule.dialect === filters.dialect) &&
    (!filters.region || filters.region === "All" || capsule.region === filters.region),
  );
  res.json(data);
});

router.get("/capsules/featured", (_req, res) => {
  res.json(capsules.slice(0, 4));
});

router.get("/capsules/:id", (req, res) => {
  const { id } = GetCapsuleParams.parse(req.params);
  const capsule = capsules.find((item) => item.id === id);
  if (!capsule) {
    res.status(404).json({ error: "Capsule not found" });
    return;
  }
  res.json(capsule);
});

router.get("/artisans", (_req, res) => {
  res.json(artisans);
});

router.get("/lineage/:id", (req, res) => {
  const { id } = GetLineageParams.parse(req.params);
  if (id !== lineage.id) {
    res.status(404).json({ error: "Lineage not found" });
    return;
  }
  res.json(lineage);
});

router.post("/recordings", (req, res) => {
  const input = CreateRecordingBody.parse(req.body);
  const saved = {
    ...input,
    id: `recording-${recordings.length + 1}`,
    status: "saved" as const,
    createdAt: new Date().toISOString(),
  };
  recordings.push(saved);
  res.status(201).json(saved);
});

router.post("/learning-request", (req, res) => {
  const input = CreateLearningRequestBody.parse(req.body);
  const saved = {
    ...input,
    id: `request-${learningRequests.length + 1}`,
    status: "pending" as const,
    voicePreview: `${input.learnerName} wants to learn ${input.topic} with you on ${input.date} at ${input.time}.`,
  };
  learningRequests.push(saved);
  res.status(201).json(saved);
});

router.post("/lineage-response", (req, res) => {
  const input = CreateLineageResponseBody.parse(req.body);
  const saved = {
    ...input,
    id: `response-${lineageResponses.length + 1}`,
    createdAt: new Date().toISOString(),
  };
  lineageResponses.push(saved);
  res.status(201).json(saved);
});

export default router;