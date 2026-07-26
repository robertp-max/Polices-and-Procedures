import assert from "node:assert/strict";
import { existsSync, readFileSync, readdirSync, statSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";
import test from "node:test";

const projectRoot = join(dirname(fileURLToPath(import.meta.url)), "..");

function collectTextFiles(directory) {
  return readdirSync(directory, { withFileTypes: true }).flatMap((entry) => {
    const path = join(directory, entry.name);
    if (entry.isDirectory()) return collectTextFiles(path);
    return /\.(css|ts|tsx)$/.test(entry.name) ? [path] : [];
  });
}

test("all employee workspaces are route-backed", () => {
  const routePages = [
    "app/journey/(portal)/page.tsx",
    "app/journey/(portal)/my-journey/page.tsx",
    "app/journey/(portal)/training/page.tsx",
    "app/journey/(portal)/policies/page.tsx",
    "app/journey/(portal)/documents/page.tsx",
    "app/journey/(portal)/competencies/page.tsx",
    "app/journey/(portal)/performance/page.tsx",
    "app/journey/(portal)/history/page.tsx",
    "app/journey/(portal)/support/page.tsx",
    "app/journey/(player)/training/gao-001/page.tsx",
    "app/journey/(player)/training/cl-wf-26/page.tsx",
  ];

  for (const routePage of routePages) {
    assert.equal(existsSync(join(projectRoot, routePage)), true, routePage);
  }
});

test("the employee shell and preview data preserve the required contracts", () => {
  const shell = readFileSync(
    join(projectRoot, "app/journey/_components/EmployeePortalShell.tsx"),
    "utf8",
  );
  const fixtures = readFileSync(
    join(projectRoot, "app/journey/_data/fixtures.ts"),
    "utf8",
  );
  const ui = readFileSync(
    join(projectRoot, "app/journey/_components/ui.tsx"),
    "utf8",
  );

  assert.match(
    shell,
    /const mobileNav = \[\s*\{ href: "\/journey", label: "Home"[\s\S]*label: "Journey"[\s\S]*label: "Training"[\s\S]*label: "Documents"/,
  );
  assert.match(shell, /<MoreSheet/);
  assert.doesNotMatch(shell, /Admin preview|Preview assigned journey/);

  for (const persona of [
    "Taylor Demo RN",
    "Jordan Demo LVN",
    "Morgan Demo HHA",
    "Casey Demo PTA",
    "Avery Demo DON",
    "Riley Demo Administrator",
    "Jamie Demo Office Employee",
    "Skyler Demo Field Driver",
    "Parker Demo Returning From Leave",
    "Cameron Demo Separating Employee",
  ]) {
    assert.match(fixtures, new RegExp(persona));
  }

  for (const phase of [
    "Pre-hire",
    "Cleared to start",
    "Day 1",
    "First week",
    "First 30 days",
    "Day 30 check-in",
    "Days 31–60",
    "Day 60 check-in",
    "Day 90 evaluation",
    "Ongoing / recurring",
    "Annual",
    "Policy update",
    "Document renewal",
    "Event-triggered",
    "Leave / return to work",
    "Separation / offboarding",
  ]) {
    assert.match(fixtures, new RegExp(phase.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")));
  }

  assert.match(ui, /role="tab"/);
  assert.match(ui, /aria-selected=/);
  assert.match(ui, /aria-controls=/);
  assert.match(ui, /aria-labelledby=/);
  assert.match(ui, /event\.key === "Escape"/);
  assert.match(ui, /document\.body\.style\.overflow = "hidden"/);
  assert.match(ui, /restoreRef\.current\?\.focus\(\)/);
});

test("workflow library lists mandated workflows and preserves the CL-WF-26 player", () => {
  const training = readFileSync(
    join(projectRoot, "app/journey/_components/TrainingWorkspace.tsx"),
    "utf8",
  );
  const fixtures = readFileSync(
    join(projectRoot, "app/journey/_data/fixtures.ts"),
    "utf8",
  );
  const player = readFileSync(
    join(projectRoot, "app/journey/(player)/training/cl-wf-26/ClWf26Player.tsx"),
    "utf8",
  );

  assert.match(training, /id: "Workflows", label: "Workflows"/);
  assert.match(training, /MANDATED WORKFLOW LIBRARY/);
  assert.match(training, /All required workflow assignments/);
  assert.match(training, /workflow-start-button/);
  assert.match(fixtures, /CL-WF-01\|Intake & Referral Qualification/);
  assert.match(fixtures, /RM-WF-15\|Annual Enterprise Risk Reassessment/);
  assert.match(fixtures, /id === "CL-WF-26" \? "\/journey\/training\/cl-wf-26"/);
  assert.match(fixtures, /id === "CL-WF-26" \? "Start simulation"/);
  assert.match(fixtures, /Monthly feeder audit -> Quarterly QA-WF-03 review/);
  assert.match(fixtures, /M[A-Z_]+_WORKFLOW_SOURCE\.split\("\\n"\)\.map/);
  assert.equal(
    (fixtures.match(/^[A-Z]{2}-WF-\d{2}\|/gm) ?? []).length,
    166,
  );
  assert.doesNotMatch(fixtures, /CL-WF-26-T0[1-6]/);
  assert.doesNotMatch(fixtures, /six swimlane cards practiced|six-card workflow practice/);
  assert.doesNotMatch(training, /workflowCards|swimlane practice cards|six-card workflow practice/);
  assert.match(player, /Training-only preview/);
  assert.match(player, /TRAIN-CL-WF-26-2026-05/);

  for (const stage of [
    "Sample",
    "Score",
    "Verify",
    "Analyze",
    "Correct",
    "Sign & Feed",
  ]) {
    assert.match(player, new RegExp(stage));
  }
});

test("truthful preview language and local GAO assets are enforced", () => {
  const source = collectTextFiles(join(projectRoot, "app"))
    .map((path) => readFileSync(path, "utf8"))
    .join("\n");

  for (const forbidden of [
    "Training Point Recorded",
    "Your answers and notes are saved",
    "Evidence is tracked for you",
    "Support request opened",
    "Upload panel opened",
    "progress saved",
    "raw.githubusercontent",
    "fonts.googleapis",
  ]) {
    assert.equal(source.toLowerCase().includes(forbidden.toLowerCase()), false, forbidden);
  }

  assert.match(source, /Your preview position is preserved in this session/);
  assert.match(source, /Official evidence will appear here when connected/);
  assert.match(source, /Practice point completed in this preview/);
  assert.match(source, /UI preview only — no document was submitted/);
  assert.doesNotMatch(source, /getUserMedia\s*\(/);

  for (const asset of [
    "public/assets/logo-careindeed-orange.png",
    "public/assets/gao001-home-visit.webp",
    "public/assets/gao001-home-visit.avif",
    "public/training/gao-001/scene-art/v2/scene-01/gao-001-scene-01-cover-a.webp",
    "public/training/gao-001/scene-art/v2/scene-01/gao-001-scene-01-cover-a.avif",
    "public/training/gao-001/scene-art/v2/scene-01/gao-001-scene-01-desk.webp",
    "public/training/gao-001/scene-art/v2/scene-01/gao-001-scene-01-desk.avif",
  ]) {
    const path = join(projectRoot, asset);
    assert.equal(existsSync(path), true, asset);
    assert.ok(statSync(path).size > 0, asset);
  }
});

test("the production worker renders every employee route", async () => {
  const workerPath = join(projectRoot, "dist/server/index.js");
  const workerUrl = pathToFileURL(workerPath);
  workerUrl.searchParams.set("journey-test", `${process.pid}-${Date.now()}`);
  const { default: worker } = await import(workerUrl.href);

  const routes = new Map([
    ["/journey", "Taylor Demo RN"],
    ["/journey/my-journey", "Your journey, phase by phase"],
    ["/journey/training", "Assigned training"],
    ["/journey/policies", "Policy actions"],
    ["/journey/documents", "Documents &amp; credentials"],
    ["/journey/competencies", "Competencies &amp; supervised practice"],
    ["/journey/performance", "Check-ins &amp; evaluations"],
    ["/journey/history", "Certificates &amp; History"],
    ["/journey/support", "Help &amp; support"],
    ["/journey/training/gao-001", "Start Alex"],
    ["/journey/training/cl-wf-26", "Plan of Care Audit Simulation"],
  ]);

  for (const [path, expected] of routes) {
    const response = await worker.fetch(
      new Request(`http://localhost${path}?persona=taylor-rn`, {
        headers: { accept: "text/html" },
      }),
      {
        ASSETS: {
          fetch: async () => new Response("Not found", { status: 404 }),
        },
      },
      {
        waitUntil() {},
        passThroughOnException() {},
      },
    );
    const html = await response.text();
    assert.equal(response.status, 200, path);
    assert.match(response.headers.get("content-type") ?? "", /^text\/html\b/i, path);
    assert.match(html, new RegExp(expected), path);
  }
});
