/**
 * Generates the fake journal corpus: one PDF per paper plus a metadata manifest.
 *
 * Deterministic -- a fixed seed means re-running produces identical output, so
 * scrapers can rely on stable file sizes and checksums.
 *
 *   node scripts/generate-corpus.mjs
 */
import { mkdir, rm, writeFile, stat } from "node:fs/promises";
import path from "node:path";
import { PDFDocument, StandardFonts, rgb } from "pdf-lib";

const ROOT = path.resolve(import.meta.dirname, "..");
const PDF_DIR = path.join(ROOT, "documents");
const MANIFEST = path.join(ROOT, "src", "data", "papers.json");

const PAPER_COUNT = 137;
const FIRST_VOLUME = 9;
const ISSUES_PER_VOLUME = 4;
const PAPERS_PER_ISSUE = 6;

/** Seeded PRNG (mulberry32) so the corpus never changes between runs. */
function makeRandom(seed) {
  let a = seed;
  return () => {
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

let rand = makeRandom(20260417);
const pick = (list) => list[Math.floor(rand() * list.length)];
const pickInt = (min, max) => min + Math.floor(rand() * (max - min + 1));

const JOURNAL = "Meridian Journal of Applied Sciences";
const JOURNAL_ABBREV = "MJAS";
const PUBLISHER = "Meridian Academic Press";

const SECTIONS = [
  {
    name: "Computing",
    code: "CMP",
    adjectives: ["Adaptive", "Distributed", "Probabilistic", "Sparse", "Federated", "Latency-Aware", "Differentiable", "Hierarchical"],
    subjects: ["Consensus Protocols", "Query Planners", "Graph Embeddings", "Cache Hierarchies", "Scheduling Heuristics", "Streaming Joins", "Index Structures", "Workload Forecasts"],
    contexts: ["Heterogeneous Clusters", "Edge Deployments", "Append-Only Stores", "Multi-Tenant Pipelines", "Serverless Runtimes", "Low-Bandwidth Links"],
  },
  {
    name: "Materials",
    code: "MAT",
    adjectives: ["Nanostructured", "Thermally Stable", "Self-Healing", "Anisotropic", "Porous", "Layered", "Ductile", "Photoactive"],
    subjects: ["Ceramic Composites", "Polymer Blends", "Lattice Alloys", "Thin Films", "Aerogel Matrices", "Crystalline Coatings", "Fiber Scaffolds", "Grain Boundaries"],
    contexts: ["Cryogenic Service", "Marine Environments", "Additive Manufacturing", "High-Cycle Fatigue", "Corrosive Media", "Vacuum Conditions"],
  },
  {
    name: "Environmental",
    code: "ENV",
    adjectives: ["Seasonal", "Basin-Scale", "Downscaled", "Satellite-Derived", "Long-Term", "Coupled", "Sediment-Linked", "Drought-Sensitive"],
    subjects: ["Runoff Models", "Aerosol Budgets", "Soil Carbon Pools", "Estuarine Salinity", "Canopy Reflectance", "Groundwater Recharge", "Methane Fluxes", "Snowpack Persistence"],
    contexts: ["Temperate Watersheds", "Coastal Wetlands", "Semi-Arid Rangelands", "Alpine Catchments", "Urban Heat Islands", "Boreal Peatlands"],
  },
  {
    name: "Biomedical",
    code: "BIO",
    adjectives: ["Minimally Invasive", "Patient-Specific", "Label-Free", "Microfluidic", "Longitudinal", "Immunomodulatory", "Wearable", "Dose-Adaptive"],
    subjects: ["Perfusion Assays", "Tissue Phantoms", "Biomarker Panels", "Gait Signatures", "Drug Carriers", "Electrode Arrays", "Organoid Cultures", "Imaging Pipelines"],
    contexts: ["Preclinical Cohorts", "Point-of-Care Settings", "Chronic Wound Care", "Neonatal Monitoring", "Ambulatory Trials", "Resource-Limited Clinics"],
  },
];

const TITLE_PATTERNS = [
  (s) => `${pick(s.adjectives)} ${pick(s.subjects)} for ${pick(s.contexts)}`,
  (s) => `On the Stability of ${pick(s.adjectives)} ${pick(s.subjects)}`,
  (s) => `Characterizing ${pick(s.subjects)} in ${pick(s.contexts)}`,
  (s) => `A Comparative Study of ${pick(s.adjectives)} ${pick(s.subjects)}`,
  (s) => `Revisiting ${pick(s.subjects)} under ${pick(s.adjectives)} Constraints`,
  (s) => `Toward ${pick(s.adjectives)} ${pick(s.subjects)}: Evidence from ${pick(s.contexts)}`,
  (s) => `${pick(s.subjects)} Revisited: A ${pick(s.adjectives)} Perspective`,
  (s) => `Quantifying Uncertainty in ${pick(s.adjectives)} ${pick(s.subjects)}`,
];

const GIVEN_NAMES = [
  "Alina", "Bastian", "Cordelia", "Devraj", "Elke", "Faisal", "Greta", "Hyun-woo",
  "Imogen", "Jarrah", "Kenji", "Lucia", "Mathis", "Nadia", "Oleksandr", "Priya",
  "Quentin", "Rosalind", "Sten", "Tamsin", "Ulrich", "Valeria", "Wren", "Xiulan",
  "Yusuf", "Zofia", "Anders", "Beatriz", "Caius", "Dilnoza", "Eero", "Fenna",
];

const FAMILY_NAMES = [
  "Abernathy", "Brandvold", "Castellanos", "Dusseault", "Eyre", "Fontenot",
  "Gorecki", "Halvorsen", "Ibsen", "Jovanovic", "Kowalczyk", "Lindqvist",
  "Marchetti", "Nakashima", "Oyelaran", "Pendergast", "Quiroga", "Rasmussen",
  "Strand", "Thibodeaux", "Ueckermann", "Vasquez", "Whitlock", "Xanthos",
  "Yarborough", "Zielinski", "Aalto", "Bhattacharya", "Cisneros", "Drummond",
];

const INSTITUTIONS = [
  "Meridian Institute of Technology",
  "Northfield Polytechnic",
  "Calder Bay University",
  "Institute for Applied Dynamics, Varnholt",
  "Lakeshore Research Centre",
  "Thornwick College of Engineering",
  "Hollis Mountain Observatory",
  "Sableport Marine Laboratory",
];

const KEYWORD_POOL = [
  "benchmarking", "calibration", "reproducibility", "sensitivity analysis",
  "finite elements", "cross-validation", "ablation study", "scaling laws",
  "noise robustness", "error propagation", "parameter sweep", "field trial",
  "cohort design", "spectral analysis", "surrogate modelling", "cost accounting",
];

const SECTION_HEADINGS = [
  "Introduction",
  "Related Work",
  "Materials and Methods",
  "Experimental Setup",
  "Results",
  "Discussion",
  "Limitations",
  "Conclusion",
];

const SENTENCES = [
  "The measurements reported here were collected over twelve independent trials under controlled conditions.",
  "Our baseline reproduces the behaviour described in earlier work to within the stated tolerance.",
  "Residual error grows approximately linearly with the number of coupled parameters.",
  "We observe a pronounced inflection once the load exceeds roughly sixty percent of nominal capacity.",
  "Sensitivity to the smoothing window proved modest across the range we examined.",
  "Replicate agreement was high, suggesting the protocol is robust to small handling differences.",
  "The reduced model retains most of the explanatory power at a fraction of the computational cost.",
  "Discrepancies at the boundary are consistent with the simplifying assumptions noted above.",
  "Longer observation windows narrow the confidence interval but do not shift the central estimate.",
  "Taken together, these findings argue for treating the two regimes separately in future analyses.",
  "A modest but repeatable bias appears in the lowest-magnitude bin and warrants further study.",
  "Calibration drift over the trial period remained below the threshold set out in the protocol.",
  "We release the processing scripts and intermediate artefacts to support independent verification.",
  "Neither of the alternative formulations improved on the simple additive model in our setting.",
];

function makeAuthors() {
  const count = pickInt(1, 5);
  const names = new Set();
  while (names.size < count) names.add(`${pick(GIVEN_NAMES)} ${pick(FAMILY_NAMES)}`);
  return [...names];
}

/** Draws `count` filler sentences without repeating one inside the same block. */
function drawSentences(count) {
  const remaining = [...SENTENCES];
  const drawn = [];
  for (let i = 0; i < count && remaining.length; i += 1) {
    const index = Math.floor(rand() * remaining.length);
    drawn.push(remaining.splice(index, 1)[0]);
  }
  return drawn;
}

function makeAbstract(section) {
  const lead = [
    `We examine the behaviour of ${pick(section.subjects).toLowerCase()} in ${pick(section.contexts).toLowerCase()}.`,
    `This paper reports a systematic evaluation of ${pick(section.adjectives).toLowerCase()} ${pick(section.subjects).toLowerCase()}.`,
    `Work in ${section.name.toLowerCase()} research has long relied on assumptions we test directly here.`,
  ];
  return [pick(lead), ...drawSentences(3)].join(" ");
}

function makeKeywords() {
  const count = pickInt(3, 5);
  const set = new Set();
  while (set.size < count) set.add(pick(KEYWORD_POOL));
  return [...set];
}

/** Quarterly publication: volume 9 issue 1 lands in March 2020. */
function issueDate(volume, issue, dayOfMonth) {
  const year = 2020 + (volume - FIRST_VOLUME);
  const month = issue * 3; // Mar, Jun, Sep, Dec
  return new Date(Date.UTC(year, month - 1, dayOfMonth));
}

function wrap(text, font, size, maxWidth) {
  const lines = [];
  let line = "";
  for (const word of text.split(" ")) {
    const candidate = line ? `${line} ${word}` : word;
    if (font.widthOfTextAtSize(candidate, size) > maxWidth && line) {
      lines.push(line);
      line = word;
    } else {
      line = candidate;
    }
  }
  if (line) lines.push(line);
  return lines;
}

async function buildPdf(paper, layout) {
  const doc = await PDFDocument.create();
  doc.setTitle(paper.title);
  doc.setAuthor(paper.authors.join("; "));
  doc.setSubject(`${JOURNAL} - ${paper.section}`);
  doc.setKeywords(paper.keywords);
  doc.setProducer(PUBLISHER);
  doc.setCreator(`${JOURNAL_ABBREV} typesetting system`);
  // Fixed dates keep output identical across runs.
  doc.setCreationDate(new Date(paper.publishedAt));
  doc.setModificationDate(new Date(paper.publishedAt));

  const body = await doc.embedFont(StandardFonts.TimesRoman);
  const bold = await doc.embedFont(StandardFonts.TimesRomanBold);
  const italic = await doc.embedFont(StandardFonts.TimesRomanItalic);

  const WIDTH = 595.28; // A4
  const HEIGHT = 841.89;
  const MARGIN = 64;
  const CONTENT_WIDTH = WIDTH - MARGIN * 2;
  const ink = rgb(0.1, 0.1, 0.12);
  const muted = rgb(0.42, 0.42, 0.47);

  const pages = [];
  let page;
  let y = 0;

  function newPage() {
    page = doc.addPage([WIDTH, HEIGHT]);
    pages.push(page);
    y = HEIGHT - MARGIN;
  }

  // --- Title page ---
  newPage();

  page.drawText(`${JOURNAL_ABBREV} ${paper.volume}(${paper.issue}), ${paper.pageRange}`, {
    x: MARGIN, y, size: 9, font: body, color: muted,
  });
  y -= 10;
  page.drawLine({
    start: { x: MARGIN, y }, end: { x: WIDTH - MARGIN, y },
    thickness: 0.75, color: muted,
  });
  y -= 36;

  for (const line of wrap(paper.title, bold, 19, CONTENT_WIDTH)) {
    page.drawText(line, { x: MARGIN, y, size: 19, font: bold, color: ink });
    y -= 25;
  }
  y -= 8;

  for (const line of wrap(paper.authors.join(", "), body, 11.5, CONTENT_WIDTH)) {
    page.drawText(line, { x: MARGIN, y, size: 11.5, font: body, color: ink });
    y -= 16;
  }
  y -= 2;
  for (const line of wrap(paper.affiliation, italic, 9.5, CONTENT_WIDTH)) {
    page.drawText(line, { x: MARGIN, y, size: 9.5, font: italic, color: muted });
    y -= 13;
  }

  y -= 20;
  for (const [label, value] of [
    ["Section", paper.section],
    ["Published", paper.publishedAt.slice(0, 10)],
    ["DOI", paper.doi],
    ["Keywords", paper.keywords.join("; ")],
  ]) {
    page.drawText(`${label}:`, { x: MARGIN, y, size: 9.5, font: bold, color: muted });
    for (const line of wrap(value, body, 9.5, CONTENT_WIDTH - 62)) {
      page.drawText(line, { x: MARGIN + 62, y, size: 9.5, font: body, color: muted });
      y -= 13;
    }
  }

  y -= 20;
  page.drawText("Abstract", { x: MARGIN, y, size: 11, font: bold, color: ink });
  y -= 17;
  for (const line of wrap(paper.abstract, body, 10.5, CONTENT_WIDTH)) {
    page.drawText(line, { x: MARGIN, y, size: 10.5, font: body, color: ink });
    y -= 14.5;
  }

  // --- Body pages ---
  for (const [index, section] of layout.sections.entries()) {
    if (y < MARGIN + 160) newPage();
    y -= 22;
    page.drawText(`${index + 1}. ${section.heading}`, { x: MARGIN, y, size: 12.5, font: bold, color: ink });
    y -= 20;

    for (const text of section.paragraphs) {
      for (const line of wrap(text, body, 10.5, CONTENT_WIDTH)) {
        if (y < MARGIN + 40) newPage();
        page.drawText(line, { x: MARGIN, y, size: 10.5, font: body, color: ink });
        y -= 14.5;
      }
      y -= 8;
    }
  }

  // --- Page footers ---
  pages.forEach((p, index) => {
    const label = `${JOURNAL_ABBREV} ${paper.volume}(${paper.issue})`;
    p.drawText(label, { x: MARGIN, y: 34, size: 8.5, font: body, color: muted });
    const folio = String(paper.firstPage + index);
    p.drawText(folio, {
      x: WIDTH - MARGIN - body.widthOfTextAtSize(folio, 8.5),
      y: 34, size: 8.5, font: body, color: muted,
    });
  });

  return { bytes: await doc.save(), pageCount: pages.length };
}

/** Pre-rolls body text so both layout passes render identical content. */
function makeLayout() {
  const sections = [];
  for (const heading of SECTION_HEADINGS.slice(0, pickInt(4, SECTION_HEADINGS.length))) {
    const paragraphs = [];
    for (let p = 0; p < pickInt(2, 6); p += 1) {
      paragraphs.push(drawSentences(pickInt(4, 9)).join(" "));
    }
    sections.push({ heading, paragraphs });
  }
  return { sections };
}

/** The volume/issue slots papers get distributed into, oldest issue first. */
function makeIssueSlots() {
  const slots = [];
  let volume = FIRST_VOLUME;
  let issue = 1;
  for (let remaining = PAPER_COUNT; remaining > 0; remaining -= PAPERS_PER_ISSUE) {
    slots.push({
      volume,
      issue,
      count: Math.min(remaining, PAPERS_PER_ISSUE),
      papers: [],
    });
    issue += 1;
    if (issue > ISSUES_PER_VOLUME) {
      issue = 1;
      volume += 1;
    }
  }
  return slots;
}

async function main() {
  await rm(PDF_DIR, { recursive: true, force: true });
  await mkdir(PDF_DIR, { recursive: true });
  await mkdir(path.dirname(MANIFEST), { recursive: true });

  const slots = makeIssueSlots();

  // --- Invent every paper, issue by issue ---
  for (const slot of slots) {
    const usedDays = new Set();

    for (let n = 0; n < slot.count; n += 1) {
      // Distinct days, so ordering an issue by date never hits a tie.
      let day;
      do {
        day = pickInt(1, 28);
      } while (usedDays.has(day));
      usedDays.add(day);

      const section = pick(SECTIONS);
      slot.papers.push({
        section,
        title: pick(TITLE_PATTERNS)(section),
        authors: makeAuthors(),
        affiliation: pick(INSTITUTIONS),
        keywords: makeKeywords(),
        abstract: makeAbstract(section),
        publishedAt: issueDate(slot.volume, slot.issue, day).toISOString(),
        layout: makeLayout(),
      });
    }

    // Running order within an issue follows publication date, so a paper's
    // sequence number, its page range and its date all tell the same story.
    slot.papers.sort((a, b) => a.publishedAt.localeCompare(b.publishedAt));
  }

  // --- Render, numbering each issue's pages in running order ---
  const papers = [];

  for (const slot of slots) {
    let firstPage = 1;

    for (const [index, spec] of slot.papers.entries()) {
      const seq = String(index + 1).padStart(2, "0");
      const id = `mjas-${slot.volume}-${slot.issue}-${seq}`;

      const paper = {
        id,
        title: spec.title,
        authors: spec.authors,
        affiliation: spec.affiliation,
        section: spec.section.name,
        sectionCode: spec.section.code,
        journal: JOURNAL,
        volume: slot.volume,
        issue: slot.issue,
        doi: `10.5281/mjas.${slot.volume}.${slot.issue}.${seq}`,
        publishedAt: spec.publishedAt,
        keywords: spec.keywords,
        abstract: spec.abstract,
        firstPage,
        pageCount: 0,
        pageRange: "",
        fileName: `${id}.pdf`,
        fileSize: 0,
      };

      // Lay out twice: the first pass reveals the real page count, which both
      // the citation page range and the next paper's starting folio depend on.
      const probe = await buildPdf(paper, spec.layout);
      paper.pageCount = probe.pageCount;
      paper.pageRange = `${firstPage}-${firstPage + probe.pageCount - 1}`;

      const final = await buildPdf(paper, spec.layout);
      const target = path.join(PDF_DIR, paper.fileName);
      await writeFile(target, final.bytes);
      paper.fileSize = (await stat(target)).size;

      firstPage += probe.pageCount;
      papers.push(paper);
    }
  }

  // Newest first -- the order the archive lists them in.
  papers.sort((a, b) => b.publishedAt.localeCompare(a.publishedAt) || b.id.localeCompare(a.id));

  await writeFile(MANIFEST, `${JSON.stringify(papers, null, 2)}\n`, "utf8");

  const totalBytes = papers.reduce((sum, p) => sum + p.fileSize, 0);
  console.log(`Generated ${papers.length} PDFs in documents/ (${(totalBytes / 1024 / 1024).toFixed(2)} MB)`);
  console.log("Manifest written to src/data/papers.json");
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
