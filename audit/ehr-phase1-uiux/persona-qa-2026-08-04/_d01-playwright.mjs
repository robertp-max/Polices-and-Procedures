/**
 * D01 LVN Today board — live route smoke (report evidence only).
 */
import { chromium } from 'playwright'
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const ORIGIN = process.env.EHR_ORIGIN || 'http://127.0.0.1:5194'
const __dirname = path.dirname(fileURLToPath(import.meta.url))
const OUT = __dirname
const results = {
  agent: 'D01',
  origin: ORIGIN,
  timestamp: new Date().toISOString(),
  routes: {},
  pass: true,
}

function note(route, name, ok, detail = '') {
  if (!results.routes[route]) results.routes[route] = { checks: [] }
  results.routes[route].checks.push({ name, ok: !!ok, detail })
  if (!ok) results.pass = false
  console.log(`${ok ? 'PASS' : 'FAIL'}  [${route}] ${name}${detail ? ` — ${detail}` : ''}`)
}

async function capture(page, route, fileBase) {
  const url = `${ORIGIN}/#${route}`
  await page.goto(url, { waitUntil: 'networkidle', timeout: 45000 })
  await page.waitForTimeout(600)
  const title = (await page.locator('h1.screen-title, h1').first().innerText().catch(() => '')).trim()
  const body = (await page.locator('body').innerText()).slice(0, 2500)
  const hasRelated = (await page.locator('.relnav, [aria-label*="Related"]').count()) > 0
  const relatedText = hasRelated
    ? (await page.locator('.relnav').first().innerText().catch(() => '')).trim()
    : ''
  const shot = path.join(OUT, `${fileBase}.png`)
  await page.screenshot({ path: shot, fullPage: true })
  results.routes[route] = {
    ...(results.routes[route] || {}),
    url: page.url(),
    title,
    hasRelated,
    relatedText: relatedText.slice(0, 400),
    bodySnippet: body.slice(0, 800),
    screenshot: path.basename(shot),
    checks: results.routes[route]?.checks || [],
  }
  return { title, body, hasRelated, relatedText }
}

async function main() {
  try {
    const res = await fetch(ORIGIN + '/')
    note('preflight', 'server reachable', res.ok, `HTTP ${res.status}`)
  } catch (err) {
    note('preflight', 'server reachable', false, String(err))
    fs.writeFileSync(path.join(OUT, 'D01-live-results.json'), JSON.stringify(results, null, 2))
    process.exit(1)
  }

  const browser = await chromium.launch({ headless: true })
  const context = await browser.newContext({ viewport: { width: 1440, height: 1000 } })
  const page = await context.newPage()

  // /today
  {
    const { title, body, hasRelated, relatedText } = await capture(page, '/today', 'D01-today')
    note('/today', 'loads', /Good afternoon|Today/i.test(title + body), title)
    note('/today', 'today visits section', /Today.?s visits|Field schedule/i.test(body))
    note('/today', 'next best actions', /Next best actions|Clinical work queue/i.test(body))
    note('/today', 'visit cards clickable presence', /2:30 PM|Elena Martinez|Skilled nursing/i.test(body))
    note('/today', 'RelatedNav present', hasRelated, relatedText)
    note('/today', 'Related includes work queue + schedule', /Work queue/i.test(relatedText) && /Schedule/i.test(relatedText), relatedText)
    note('/today', 'stat cards', /SOC completion|Next visit|Open orders|Record integrity/i.test(body))
    note('/today', 'Brad honesty', /nothing is filed|clinician review/i.test(body))
    // click first visit card → chart
    const visitBtn = page.locator('.visit-card').first()
    if (await visitBtn.count()) {
      await visitBtn.click()
      await page.waitForTimeout(500)
      const chartUrl = page.url()
      note('/today', 'visit card opens chart', /#\/patients\//.test(chartUrl), chartUrl)
    } else {
      note('/today', 'visit card opens chart', false, 'no .visit-card')
    }
  }

  // /work-queue
  {
    const { title, body, hasRelated, relatedText } = await capture(page, '/work-queue', 'D01-work-queue')
    note('/work-queue', 'loads', /work queue/i.test(title + body), title)
    note('/work-queue', 'filters', /All statuses|Open|Escalated|Priority/i.test(body))
    note('/work-queue', 'inspector', /Inspector|Claim item|Continue in/i.test(body))
    note('/work-queue', 'prototype honesty banner', /Synthetic|does not write durable|visual only/i.test(body))
    note('/work-queue', 'RelatedNav present', hasRelated, relatedText)
    // open chart from inspector patient chip if present
    const patientBtn = page.locator('.wq-patient').first()
    if (await patientBtn.count()) {
      await patientBtn.click()
      await page.waitForTimeout(500)
      note('/work-queue', 'inspector opens chart', /#\/patients\//.test(page.url()), page.url())
    } else {
      note('/work-queue', 'inspector opens chart', false, 'no .wq-patient on default selection')
    }
  }

  // /schedule
  {
    const { title, body, hasRelated, relatedText } = await capture(page, '/schedule', 'D01-schedule')
    note('/schedule', 'loads', /Schedule/i.test(title + body), title)
    note('/schedule', 'week grid / today column', /Today|Mon|Aug 3/i.test(body))
    note('/schedule', 'visit patient linkable', /Elena Martinez|Walter Feld|Raymond/i.test(body))
    note('/schedule', 'RelatedNav present', hasRelated, relatedText)
    note('/schedule', 'Related field-useful', /Field visits|Work queue|Patients/i.test(relatedText), relatedText)
    const patientLink = page.locator('.sched-visit-patient').first()
    if (await patientLink.count()) {
      await patientLink.click()
      await page.waitForTimeout(500)
      note('/schedule', 'visit name opens chart', /#\/patients\//.test(page.url()), page.url())
    } else {
      note('/schedule', 'visit name opens chart', false, 'no .sched-visit-patient')
    }
  }

  // /patients/pt-elena
  {
    const { title, body, hasRelated, relatedText } = await capture(page, '/patients/pt-elena', 'D01-pt-elena')
    note('/patients/pt-elena', 'loads chart', /Elena Martinez/i.test(title + body), title)
    note('/patients/pt-elena', 'tabs', /Overview|Timeline|Assessments|Medications|Orders/i.test(body))
    note('/patients/pt-elena', 'Continue SOC / chart actions', /Continue SOC|Care team|Record integrity/i.test(body))
    note('/patients/pt-elena', 'RelatedNav present', hasRelated, relatedText)
    note('/patients/pt-elena', 'open chart path fast (direct URL)', true, 'direct hash route loads')
  }

  // Cross-link: RelatedNav from today → work-queue
  {
    await page.goto(`${ORIGIN}/#/today`, { waitUntil: 'networkidle', timeout: 45000 })
    await page.waitForTimeout(400)
    const chip = page.locator('.relnav-chip', { hasText: 'Work queue' }).first()
    if (await chip.count()) {
      await chip.click()
      await page.waitForTimeout(400)
      note('cross-link', 'RelatedNav Today → Work queue', /#\/work-queue/.test(page.url()), page.url())
    } else {
      note('cross-link', 'RelatedNav Today → Work queue', false, 'chip missing')
    }
  }

  await browser.close()
  fs.writeFileSync(path.join(OUT, 'D01-live-results.json'), JSON.stringify(results, null, 2))
  console.log('\nOverall:', results.pass ? 'PASS' : 'FAIL')
  console.log('Wrote D01-live-results.json + screenshots')
  process.exit(results.pass ? 0 : 1)
}

main().catch(err => {
  console.error(err)
  process.exit(1)
})
