import type { ModuleDef, ModuleLesson } from "./lessonModel";
import type { JourneyModule } from "../types/journey";
import gaoContentRaw from "./gao-content.md?raw";

type ParsedGaoPage = {
  index: number;
  title: string;
  body: string;
};

function normalizeMarkdownHeadings(text: string): string {
  return text
    .replace(/\r\n/g, "\n")
    .replace(/[ \t]+(#{1,6}\s+)/g, "\n$1")
    .replace(/[ \t]+(---)/g, "\n$1")
    .replace(/[ \t]+(###\s*(?:PAGE|Page)\s+\d+)/g, "\n$1")
    .replace(/[ \t]+(##\s*(?:PAGE|Page)\s+\d+)/g, "\n$1")
    .replace(/(#{2,3}\s*(?:PAGE|Page)\s+\d+\s*[:—-]\s*"[^"]+")\s+/g, "$1\n");
}

const normalizedGaoContent = normalizeMarkdownHeadings(gaoContentRaw);
const gaoSections = new Map<string, string>();

const moduleHeadingPattern = /(?:^|\n)#\s+(GAO-\d{3})(?:\s+[^\n#]*)?/g;
const moduleHeadings = Array.from(normalizedGaoContent.matchAll(moduleHeadingPattern));

moduleHeadings.forEach((match, index) => {
  const id = match[1].toUpperCase();
  const start = match.index ?? 0;
  const next = moduleHeadings[index + 1];
  const end = next?.index ?? normalizedGaoContent.length;
  gaoSections.set(id, normalizedGaoContent.slice(start, end));
});

function isGaoContentOverrideId(moduleId: string): boolean {
  const match = moduleId.match(/^GAO-(\d{3})$/i);
  if (!match) return false;
  const numericId = Number(match[1]);
  return numericId >= 2 && numericId <= 27;
}

function stripMarkdown(text: string): string {
  return text
    .replace(/\r\n/g, "\n")
    .replace(/\*\*(.*?)\*\*/g, "$1")
    .replace(/\*(.*?)\*/g, "$1")
    .replace(/`([^`]+)`/g, "$1")
    .replace(/^\s*>+\s?/gm, "")
    .replace(/^\s*#{1,6}\s*/gm, "")
    .replace(/\s+$/gm, "")
    .trim();
}

function sanitizeLearnerText(text: string): string {
  return stripMarkdown(text)
    .replace(/(?:UPDATED PAGE-LEVEL QA|ADDENDUM:|FINAL MODULE-LEVEL QA|FINAL PAGE-LEVEL WORD COUNTS)[\s\S]*$/i, "")
    .replace(/Narration Script\s*\([^)]*\)\s*/gi, "")
    .replace(/Page\s+\d+\s+word count:\s*~?\d+\.?/gi, "")
    .replace(/\(~?[\d,]+\s*words?\)/gi, "")
    .replace(/Narration\s*\(Page\s+\d+\)\s*[-—]\s*\d+\s*words/gi, "")
    .replace(/Narration word count\s*[:|][^\n]*/gi, "")
    .replace(/Duration\s*@\s*130\s*wpm\s*[:|][^\n]*/gi, "")
    .replace(/policyRefStatus\s*[:|][^\n]*/gi, "")
    .replace(/readyForSmeReview|needs_review|QA VALIDATION SUMMARY|QA STATUS/gi, "")
    .replace(/\|[^\n]*\|/g, "")
    .replace(/^\s*[-*]\s*\*\*(Module ID|Track|Duration|Narration|Pages|Exam|policyMapped|passScore|Status|QA Version)[^\n]*$/gim, "")
    .replace(/^\s*(Module ID|Track|Duration|Narration Word Count|Pages|Exam|policyMapped|passScore|Status)\s*[:|].*$/gim, "")
    .replace(/^-{3,}$/gm, "")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}

function escapeHtml(text: string): string {
  return text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function toLearnerHtml(page: ParsedGaoPage): string {
  const blocks = page.body
    .split(/\n{2,}/)
    .map((block) => block.trim())
    .filter(Boolean)
    .filter((block) => !/^(EXAM|Q\d+:|Canonical \(Q|Expansion \(Q|Metric\s+Value)/i.test(block));

  const htmlBlocks = blocks.map((block) => {
    if (/^(Knowledge Check|Scenario Challenge|Scenario|Expected Response|Module Summary|Key Takeaways)/i.test(block)) {
      const [firstLine, ...rest] = block.split("\n");
      const body = rest.join("\n").trim();
      return `<section><h3>${escapeHtml(firstLine.replace(/:$/, ""))}</h3>${body ? `<p>${escapeHtml(body)}</p>` : ""}</section>`;
    }

    const listLines = block.split("\n").filter((line) => /^\s*(?:[-*]|\d+\.)\s+/.test(line));
    if (listLines.length >= 2) {
      const items = listLines.map((line) => line.replace(/^\s*(?:[-*]|\d+\.)\s+/, "").trim());
      return `<ul>${items.map((item) => `<li>${escapeHtml(item)}</li>`).join("")}</ul>`;
    }

    return `<p>${escapeHtml(block.replace(/\n/g, " "))}</p>`;
  });

  return `<h2>${escapeHtml(page.title)}</h2>${htmlBlocks.join("\n")}`;
}

function parsePages(section: string): ParsedGaoPage[] {
  const expandedStart = section.search(/##\s+(?:EXPANDED\s+NARRATION\s+SCRIPTS|PAGE\s+1|Page\s+1)|###\s+PAGE\s+1/i);
  const lessonSection = expandedStart >= 0 ? section.slice(expandedStart) : section;
  const cleanSection = lessonSection
    .replace(/\r\n/g, "\n")
    .replace(/\n##\s+EXAM[\s\S]*$/i, "")
    .replace(/\n---\s*##\s+EXAM[\s\S]*$/i, "")
    .replace(/\n##\s+QA[\s\S]*$/i, "")
    .replace(/\n(?:UPDATED PAGE-LEVEL QA|ADDENDUM:|FINAL MODULE-LEVEL QA|FINAL PAGE-LEVEL WORD COUNTS)[\s\S]*$/i, "");

  const pagePattern = /(?:^|\n)#{2,3}\s*(?:PAGE|Page)\s+(\d+)\s*[:—-]\s*(?:"([^"]+)"|([^\n#]*?))(?:\s*\([^)]*words?\))?\s*(?=\n|$)/g;
  const allHeadings = Array.from(cleanSection.matchAll(pagePattern));
  const headings: RegExpMatchArray[] = [];
  let lastPageNumber = 0;
  for (const heading of allHeadings) {
    const pageNumber = Number(heading[1]);
    if (headings.length > 0 && pageNumber <= lastPageNumber) break;
    headings.push(heading);
    lastPageNumber = pageNumber;
  }

  if (headings.length === 0) {
    const body = sanitizeLearnerText(cleanSection.replace(/^#\s+GAO-\d{3}[^\n]*/i, ""));
    return body ? [{ index: 1, title: "Module Overview", body }] : [];
  }

  return headings.map((heading, index) => {
    const start = (heading.index ?? 0) + heading[0].length;
    const end = headings[index + 1]?.index ?? cleanSection.length;
    const title = sanitizeLearnerText(heading[2] || heading[3] || `Page ${heading[1]}`)
      .replace(/\(\d+\s*words?\)/i, "")
      .replace(/^["']|["']$/g, "")
      .trim();
    const body = sanitizeLearnerText(cleanSection.slice(start, end));
    return {
      index: Number(heading[1]),
      title: title || `Page ${heading[1]}`,
      body,
    };
  }).filter((page) => page.body.length > 0);
}

export function buildGaoContentModuleDef(mod: JourneyModule): ModuleDef | undefined {
  if (!isGaoContentOverrideId(mod.id)) return undefined;

  const section = gaoSections.get(mod.id.toUpperCase());
  if (!section) return undefined;

  const pages = parsePages(section);
  if (pages.length === 0) return undefined;

  const lessons: ModuleLesson[] = pages.map((page, pageIndex) => {
    const lessonId = `l${pageIndex + 1}`;
    const html = toLearnerHtml({ ...page, index: pageIndex + 1 });
    const narration = page.body;
    const estimatedSeconds = Math.max(30, Math.round((narration.split(/\s+/).length / 130) * 60));

    return {
      id: lessonId,
      index: pageIndex + 1,
      title: page.title,
      estMinutes: Math.max(3, Math.round(estimatedSeconds / 60)),
      learningGoal: page.title,
      scenario: narration.slice(0, 220),
      keyConcept: html,
      whyItMatters: mod.cmsRefs.length ? mod.cmsRefs : mod.policyRefs,
      practiceExample: "",
      commonMistake: "",
      keyTerms: [],
      transcript: narration,
      summary: narration,
      cards: [{
        module_id: mod.id,
        lesson_id: `L${String(pageIndex + 1).padStart(2, "0")}`,
        card_id: `${mod.id}_L${pageIndex + 1}_DELIVERY`,
        card_type: "delivery",
        app: { location: `${mod.id}.lesson.${lessonId}.delivery` },
        display_title: page.title,
        learner_facing_content: html,
        cna_practice_example: "",
        key_terms: [],
        completion_condition: "Learner reviews the page and continues.",
        narration_script: narration,
        transcript_text: narration,
        estimated_narration_seconds: estimatedSeconds,
        media_prompt_placeholder: {
          app_location: `${mod.id}.lesson.${lessonId}.delivery`,
          scene_title: page.title,
        },
      }],
    };
  });

  return {
    id: mod.id,
    code: mod.id,
    title: mod.title,
    shortTitle: mod.title,
    time: `${mod.durationMinutes ?? 30} min`,
    summary: lessons.map((lesson) => lesson.title).slice(0, 3).join("; "),
    kind: "lesson",
    status: "ready",
    countsTowardTheory: false,
    learningObjectives: lessons.slice(0, 4).map((lesson) => lesson.title),
    policyRefs: mod.policyRefs,
    lessons,
  };
}
