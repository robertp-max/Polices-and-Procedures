import { chromium } from 'playwright'

const browser = await chromium.launch({ headless: true })
const page = await browser.newPage({ viewport: { width: 1400, height: 900 } })

async function go(r) {
  await page.goto(`http://127.0.0.1:5194/#${r}`, { waitUntil: 'domcontentloaded', timeout: 20000 })
  await page.waitForSelector('h1.screen-title', { timeout: 12000 })
  await page.waitForTimeout(450)
}

const out = {}

await go('/patients/pt-elena/medications')
out.medFooter = await page.locator('.chart-med-footer').textContent().catch(() => null)
out.markDisabled = await page.getByRole('button', { name: /Mark reconciled/i }).isDisabled().catch(() => false)
out.p0_01 = Boolean(out.medFooter?.toLowerCase().includes('incomplete') && out.markDisabled)

await go('/work-queue')
out.wqBadge = await page.locator('.shell-nav-item[href="#/work-queue"] .shell-nav-badge, a[href="#/work-queue"] .shell-nav-badge').first().textContent().catch(() => null)
const mineBtn = page.getByRole('button', { name: /Assigned to me/i })
if (await mineBtn.count()) {
  await mineBtn.click()
  await page.waitForTimeout(250)
}
out.mineFilterPresent = (await mineBtn.count()) > 0

await go('/field-visits')
const fieldText = await page.locator('body').innerText()
out.fieldHasMissed = /missed/i.test(fieldText) && /raymond/i.test(fieldText)

await go('/messages')
out.unreadBefore = await page.locator('.stat-card').filter({ hasText: /Unread/i }).locator('.stat-card-value').first().textContent().catch(() => null)
const thread = page.locator('button.msg-row, .msg-row').first()
if (await thread.count()) {
  await thread.click()
  await page.waitForTimeout(300)
}
out.unreadAfter = await page.locator('.stat-card').filter({ hasText: /Unread/i }).locator('.stat-card-value').first().textContent().catch(() => null)

await go('/emergency')
const emp = await page.locator('body').innerText()
out.empRaymond = /Raymond/i.test(emp)
out.empSamuel = /Samuel/i.test(emp)

await go('/legal-evidence')
const leg = await page.locator('body').innerText()
out.legalDorothyDischarge = /Dorothy/i.test(leg) && /Discharge/i.test(leg)
out.legalHaroldSealedDischarge = /Harold Nguyen/i.test(leg) && /Discharge instruction package/i.test(leg)

await go('/patients/pt-elena')
const chart = await page.locator('body').innerText()
out.integrity1013 = /10\s*\/\s*13|10\s*of\s*13|10\s*\/\s*13/.test(chart) || /10\s*\/\s*13/.test(chart)

await page.screenshot({
  path: 'C:/AI/Git/training/HomeHealth/Policies_and_Procedures_V2_worktrees/ehr_phase1/audit/ehr-phase1-uiux/persona-qa-2026-08-04/remediation-spot.png',
  fullPage: true,
})

console.log(JSON.stringify(out, null, 2))
await browser.close()
