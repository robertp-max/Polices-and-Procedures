import { useEffect, useState } from 'react'
import type { ReactNode } from 'react'
import {
  AlertTriangle, Banknote, Boxes, BotMessageSquare, BookOpen, Building2, CheckCircle2,
  ClipboardList, Cpu, FileWarning, Gavel, Gauge, Handshake, LandPlot, LayoutGrid, Layers,
  LineChart, ListChecks, Milestone, Network, Scale, ShieldAlert, ShieldCheck,
  Sparkles, TrendingUp, Users, Workflow, XCircle,
} from 'lucide-react'
import { StatusChip } from '../ui'
import * as bp from '../data/businessPlan'
import './bp.css'

export default function BusinessPlanScreen() {
  const [active, setActive] = useState<string>(bp.TOC_ITEMS[0].id)

  useEffect(() => {
    const sections = bp.TOC_ITEMS
      .map(t => document.getElementById(t.id))
      .filter((el): el is HTMLElement => el != null)
    if (sections.length === 0) return
    const observer = new IntersectionObserver(
      entries => {
        const visible = entries.filter(e => e.isIntersecting)
        if (visible.length > 0) {
          const top = visible.reduce((a, b) => (a.boundingClientRect.top < b.boundingClientRect.top ? a : b))
          setActive(top.target.id)
        }
      },
      { rootMargin: '-15% 0px -70% 0px', threshold: [0, 1] },
    )
    sections.forEach(s => observer.observe(s))
    return () => observer.disconnect()
  }, [])

  const scrollToSection = (id: string) => {
    document.getElementById(id)?.scrollIntoView({ block: 'start' })
  }

  return (
    <div className="screen bp-screen">
      <div className="bp-layout">
        <div className="bp-doc">

          {/* ---------- Title block ---------- */}
          <header className="bp-titleblock">
            <span className="card-kicker">Care Indeed Home Health Care, Inc.</span>
            <h1 className="bp-title">Owned EHR Business Plan</h1>
            <p className="bp-tagline">Own the workflow. Own the evidence.</p>
            <p className="bp-lead">
              A complete, stage-gated business plan for Care Indeed Home Health Care, Inc. to turn
              its skilled-home-health operating model into a company-owned clinical, compliance,
              data, and AI asset — without gambling patient care or cash flow on a big-bang
              replacement.
            </p>
            <div className="bp-meta-grid">
              {bp.META_ROWS.map(m => (
                <div className="bp-meta-row" key={m.label}>
                  <span className="bp-meta-label">{m.label}</span>
                  <span className="bp-meta-value">{m.value}</span>
                </div>
              ))}
            </div>
          </header>

          {/* ---------- Board decision requested ---------- */}
          <section id="bp-decision" className="bp-section">
            <div className="bp-callout bp-callout-accent">
              <div className="bp-callout-head">
                <span className="bp-callout-icon"><Gavel size={16} strokeWidth={1.75} aria-hidden /></span>
                <div className="card-kicker">Board decision requested</div>
              </div>
              <p className="bp-callout-body">{bp.DECISION_ASK}</p>
              <div className="bp-posture-row">
                {bp.POSTURE_FACTS.map(p => (
                  <div className="bp-posture-fact" key={p.label}>
                    <span className="bp-posture-label">{p.label}</span>
                    <span className="bp-posture-value">{p.value}</span>
                  </div>
                ))}
              </div>
              <div className="bp-decision-terms">
                <div className="bp-decision-term">
                  <span className="chip chip-good"><CheckCircle2 size={11} strokeWidth={2.25} aria-hidden />Authorize</span>
                  <p>{bp.DECISION_TERMS.authorize[0]}</p>
                </div>
                <div className="bp-decision-term">
                  <span className="chip chip-teal"><CheckCircle2 size={11} strokeWidth={2.25} aria-hidden />Permit</span>
                  <p>{bp.DECISION_TERMS.permit[0]}</p>
                </div>
                <div className="bp-decision-term">
                  <span className="chip chip-bad"><XCircle size={11} strokeWidth={2.25} aria-hidden />Not yet</span>
                  <p>{bp.DECISION_TERMS.notYet[0]}</p>
                </div>
                <div className="bp-decision-term">
                  <span className="chip chip-warn"><AlertTriangle size={11} strokeWidth={2.25} aria-hidden />Require</span>
                  <p>{bp.DECISION_TERMS.require[0]}</p>
                </div>
              </div>
            </div>

            <div className="bp-callout bp-callout-warn">
              <div className="bp-callout-head">
                <span className="bp-callout-icon bp-callout-icon-warn"><FileWarning size={16} strokeWidth={1.75} aria-hidden /></span>
                <div className="card-kicker">Entity distinction — read before citing any figure</div>
              </div>
              <p className="bp-callout-body">{bp.ENTITY_WARNING}</p>
              <p className="bp-callout-sub">{bp.ENTITY_DETAIL}</p>
            </div>
          </section>

          {/* ---------- Contents grid ---------- */}
          <section id="bp-contents" className="bp-section">
            <div className="bp-section-head">
              <span className="bp-section-icon"><BookOpen size={15} strokeWidth={1.75} aria-hidden /></span>
              <h2 className="bp-h2">Every decision chapter, in one evidence-backed plan</h2>
            </div>
            <p className="bp-p">
              The document follows the nine common sections of a traditional business plan and
              adds the architecture, regulatory, clinical-safety, transition, and
              benefits-realization chapters required for a home-health EHR investment.
            </p>
            <div className="bp-contents-grid">
              {bp.CONTENTS_CHAPTERS.map(c => (
                <button className="bp-contents-card" key={c.num} onClick={() => scrollToSection(c.id)}>
                  <span className="bp-contents-num">{c.num}</span>
                  <span className="bp-contents-title">{c.title}</span>
                  <span className="bp-contents-sub">{c.sub}</span>
                </button>
              ))}
            </div>
            <p className="bp-p bp-p-tight bp-footnote">{bp.PLANNING_STANDARD}</p>
          </section>

          {/* ---------- 01 Executive summary ---------- */}
          <section id="bp-exec-summary" className="bp-section">
            <SectionHead icon={<TrendingUp size={15} strokeWidth={1.75} aria-hidden />} title="01 · Executive summary — Selective ownership is the investable strategy" />
            <p className="bp-p">{bp.EXEC_THESIS}</p>
            <p className="bp-p">{bp.EXEC_BASE_CASE}</p>
            <div className="bp-quad-grid">
              {bp.EXEC_ELEMENTS.map(e => (
                <div className="bp-quad-card" key={e.kicker}>
                  <div className="card-kicker">{e.kicker}</div>
                  <p>{e.body}</p>
                </div>
              ))}
            </div>
            <div className="bp-inline-callout">
              <p className="bp-p bp-p-tight">{bp.EXEC_REQUEST}</p>
              <p className="bp-recommendation">{bp.EXEC_RECOMMENDATION}</p>
            </div>
          </section>

          {/* ---------- 02 Company description ---------- */}
          <section id="bp-company" className="bp-section">
            <SectionHead icon={<Building2 size={15} strokeWidth={1.75} aria-hidden />} title="02 · Company description — A skilled-home-health operating asset" />
            <p className="bp-p">{bp.COMPANY_INTRO}</p>
            <div className="bp-quad-grid">
              {bp.COMPANY_ROWS.map(r => (
                <div className="bp-quad-card" key={r.kicker}>
                  <div className="card-kicker">{r.kicker}</div>
                  <p>{r.body}</p>
                </div>
              ))}
            </div>
            <div className="bp-fact-list">
              {bp.COMPANY_FACTS.map(f => (
                <div className="bp-fact-row" key={f.label}>
                  <span className="bp-fact-label">{f.label}</span>
                  <span className="bp-fact-value">{f.value}</span>
                </div>
              ))}
            </div>
          </section>

          {/* ---------- 03 Market analysis ---------- */}
          <section id="bp-market" className="bp-section">
            <SectionHead icon={<LandPlot size={15} strokeWidth={1.75} aria-hidden />} title="03 · Market & industry research — Demand is durable; economics are unforgiving" />
            <p className="bp-p">{bp.MARKET_INTRO}</p>
            <div className="bp-stat-grid">
              {bp.MARKET_STATS.map(s => (
                <div className="bp-stat-card" key={s.label}>
                  <div className="bp-stat-value">{s.value}</div>
                  <div className="bp-stat-label">{s.label}</div>
                  <p className="bp-stat-sub">{s.sub}</p>
                  <span className="bp-stat-source">{s.source}</span>
                </div>
              ))}
            </div>
            <div className="bp-two-col">
              <div>
                <div className="bp-mini-kicker">Industry forces shaping the investment</div>
                <ul className="bp-bullet-list">
                  {bp.MARKET_FORCES.map(f => <li key={f}>{f}</li>)}
                </ul>
              </div>
              <div>
                <div className="bp-mini-kicker">Care Indeed primary research still required</div>
                <ul className="bp-bullet-list bp-bullet-list-warn">
                  {bp.MARKET_RESEARCH_NEEDED.map(f => <li key={f}>{f}</li>)}
                </ul>
              </div>
            </div>
            <div className="bp-inline-callout">
              <p className="bp-p bp-p-tight">{bp.MARKET_POLICY_WATCH}</p>
            </div>
          </section>

          {/* ---------- 04 Competitive landscape ---------- */}
          <section id="bp-competitive" className="bp-section">
            <SectionHead icon={<LayoutGrid size={15} strokeWidth={1.75} aria-hidden />} title="04 · Competitive landscape — Core EHR features are table stakes; control is the differentiator" />
            <p className="bp-p">{bp.COMPETITIVE_INTRO}</p>
            <div className="bp-vendor-grid">
              {bp.COMPETITIVE_VENDORS.map(v => (
                <div className={'bp-vendor-card' + (v.tag === 'INCUMBENT' ? ' bp-vendor-incumbent' : '')} key={v.name}>
                  <div className="bp-vendor-head">
                    <span className="bp-vendor-name">{v.name}</span>
                    <span className={'chip ' + (v.tag === 'INCUMBENT' ? 'chip-brand' : 'chip-outline')}>{v.tag}</span>
                  </div>
                  <p className="bp-cell-note">{v.body}</p>
                  <span className="bp-vendor-ref">{v.refLabel}</span>
                </div>
              ))}
            </div>
            <div className="bp-inline-callout">
              <p className="bp-p bp-p-tight">{bp.COMPETITIVE_POSITION_NOTE}</p>
            </div>
          </section>

          {/* ---------- 05 SWOT ---------- */}
          <section id="bp-swot" className="bp-section">
            <SectionHead icon={<Scale size={15} strokeWidth={1.75} aria-hidden />} title="05 · SWOT analysis — A balanced case for ownership" />
            <p className="bp-p">
              Strength and opportunity justify diligence. Weakness and threat determine
              architecture, sequencing, staffing, and stop conditions.
            </p>
            <div className="bp-swot-grid">
              {bp.SWOT_QUADRANTS.map(q => (
                <div className={'bp-swot-card bp-swot-' + q.tone} key={q.kicker}>
                  <div className="card-kicker">{q.kicker}</div>
                  <div className="bp-swot-title">{q.title}</div>
                  <ul className="bp-bullet-list">
                    {q.items.map(i => <li key={i}>{i}</li>)}
                  </ul>
                </div>
              ))}
            </div>
          </section>

          {/* ---------- 05 Strategic case for control ---------- */}
          <section id="bp-strategic-case" className="bp-section">
            <SectionHead icon={<Sparkles size={15} strokeWidth={1.75} aria-hidden />} title="06 · Strategic problem & opportunity — The case is control, not a cheaper clone" />
            <p className="bp-p">{bp.STRATEGIC_INTRO}</p>
            <div className="bp-numbered-grid">
              {bp.STRATEGIC_POINTS.map(p => (
                <div className="bp-numbered-card" key={p.num}>
                  <span className="bp-numbered-badge">{p.num}</span>
                  <div className="bp-numbered-title">{p.title}</div>
                  <p>{p.body}</p>
                </div>
              ))}
            </div>
            <div className="bp-stat-grid bp-stat-grid-3">
              {bp.STRATEGIC_STATS.map(s => (
                <div className="bp-stat-card" key={s.label}>
                  <div className="bp-stat-value">{s.value}</div>
                  <p className="bp-stat-sub">{s.label}</p>
                  <span className="bp-stat-source">{s.source}</span>
                </div>
              ))}
            </div>
          </section>

          {/* ---------- 06 Build / integrate / buy ---------- */}
          <section id="bp-build-buy" className="bp-section">
            <SectionHead icon={<Workflow size={15} strokeWidth={1.75} aria-hidden />} title="07 · Strategic recommendation — Own the differentiating core, buy the commodity rails" />
            <p className="bp-p">{bp.BUILD_BUY_INTRO}</p>
            <p className="bp-taglinequote">{bp.BUILD_BUY_TAGLINE}</p>
            <div className="bp-bbb-grid">
              {bp.BUILD_BUY_COLUMNS.map(col => (
                <div className={'bp-bbb-col bp-bbb-' + col.tone} key={col.title}>
                  <div className="bp-bbb-title">{col.title}</div>
                  <ul className="bp-bullet-list">
                    {col.items.map(i => <li key={i}>{i}</li>)}
                  </ul>
                </div>
              ))}
            </div>
          </section>

          {/* ---------- 08 Systems & service scope ---------- */}
          <section id="bp-systems-scope" className="bp-section">
            <SectionHead icon={<Boxes size={15} strokeWidth={1.75} aria-hidden />} title="08 · Systems & service scope — The complete home-health EHR capability map" />
            <p className="bp-p">{bp.SYSTEMS_SCOPE_INTRO}</p>
            <div className="bp-table-wrap">
              <table className="table bp-scope-table">
                <thead>
                  <tr>
                    <th scope="col">Domain</th>
                    <th scope="col">Minimum production capability</th>
                    <th scope="col">Sourcing</th>
                  </tr>
                </thead>
                <tbody>
                  {bp.SYSTEMS_SCOPE_ROWS.map(row => (
                    <tr key={row.domain}>
                      <th scope="row">{row.domain}</th>
                      <td className="bp-cell-note">{row.capability}</td>
                      <td>
                        <div className="bp-scope-tags">
                          {row.sourcing.split(' ').map(tag => (
                            <span className="chip chip-teal" key={tag}>{tag}</span>
                          ))}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>

          {/* ---------- 09 Architecture principles ---------- */}
          <section id="bp-architecture" className="bp-section">
            <SectionHead icon={<Layers size={15} strokeWidth={1.75} aria-hidden />} title="09 · Target architecture & technology strategy" />
            <p className="bp-p">{bp.ARCH_INTRO}</p>
            <div className="bp-adr-grid">
              {bp.ARCH_PRINCIPLES.map(a => (
                <div className="bp-adr-card" key={a.adr}>
                  <div className="bp-adr-tag">{a.adr}</div>
                  <div className="bp-adr-title">{a.title}</div>
                  <p>{a.body}</p>
                </div>
              ))}
            </div>
            <div className="bp-inline-callout">
              <p className="bp-p bp-p-tight">{bp.ARCH_AUTHORITY_NOTE}</p>
            </div>
            <div className="bp-table-wrap">
              <table className="table bp-authority-table">
                <thead>
                  <tr>
                    <th scope="col">Domain</th>
                    <th scope="col">Shadow / discovery</th>
                    <th scope="col">Controlled pilot</th>
                    <th scope="col">Target state</th>
                  </tr>
                </thead>
                <tbody>
                  {bp.AUTHORITY_TABLE.map(row => (
                    <tr key={row.domain}>
                      <th scope="row">{row.domain}</th>
                      <td>{row.shadow}</td>
                      <td>{row.pilot}</td>
                      <td>{row.target}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <p className="bp-p bp-p-tight bp-footnote">{bp.MIGRATION_PATTERN}</p>
          </section>

          {/* ---------- 08 Regulatory & compliance ---------- */}
          <section id="bp-regulatory" className="bp-section">
            <SectionHead icon={<Gauge size={15} strokeWidth={1.75} aria-hidden />} title="10 · Regulatory, certification & assurance plan" />
            <p className="bp-p">
              There is no single "EHR certification" that makes an HHA compliant. Compliance
              combines agency duties, software behavior, operations, evidence, and
              scope-specific validation.
            </p>
            <div className="bp-table-wrap">
              <table className="table bp-reg-table">
                <thead>
                  <tr>
                    <th scope="col">Tier</th>
                    <th scope="col">Requirement</th>
                    <th scope="col">Acceptance evidence</th>
                  </tr>
                </thead>
                <tbody>
                  {bp.REGULATORY_ROWS.map(r => (
                    <tr key={r.title}>
                      <td>
                        <span className={'chip ' + (r.tier === 'MANDATORY' ? 'chip-bad' : r.tier === 'CONDITIONAL' ? 'chip-warn' : 'chip-neutral')}>
                          {r.tier}
                        </span>
                        <div className="bp-reg-category">{r.category}</div>
                      </td>
                      <td>
                        <div className="bp-reg-title">{r.title}</div>
                        <p className="bp-cell-note">{r.body}</p>
                      </td>
                      <td>
                        <p className="bp-cell-note">{r.evidence}</p>
                        <span className="bp-reg-ref">{r.refLabel}</span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="bp-assurance-grid">
              {bp.ASSURANCE_TIERS.map(t => (
                <div className="bp-assurance-card" key={t.tier}>
                  <span className="chip chip-outline">{t.tier}</span>
                  <div className="bp-adr-title">{t.title}</div>
                  <ul className="bp-bullet-list">
                    {t.items.map(i => <li key={i}>{i}</li>)}
                  </ul>
                  <p className="bp-cell-note">{t.note}</p>
                </div>
              ))}
            </div>
            <div className="bp-inline-callout">
              <p className="bp-p bp-p-tight">{bp.ACHC_NOTE}</p>
            </div>
            <p className="bp-p bp-p-tight bp-footnote">{bp.REQUIREMENTS_AUTHORITY_NOTE}</p>
          </section>

          {/* ---------- 09 BAA reality ---------- */}
          <section id="bp-baa" className="bp-section">
            <SectionHead icon={<Handshake size={15} strokeWidth={1.75} aria-hidden />} title="11 · BAA & shared-responsibility analysis — A BAA matters; it is not blanket protection" />
            <p className="bp-p">{bp.BAA_INTRO}</p>
            <div className="bp-bbb-grid">
              {bp.BAA_COLUMNS.map(col => (
                <div className="bp-bbb-col bp-bbb-neutral" key={col.title}>
                  <div className="bp-bbb-title">{col.title}</div>
                  <ul className="bp-bullet-list">
                    {col.items.map(i => <li key={i}>{i}</li>)}
                  </ul>
                </div>
              ))}
            </div>
            <p className="bp-p bp-p-tight">{bp.BAA_CHANGE_NOTE}</p>
            <div className="bp-inline-callout">
              <p className="bp-p bp-p-tight">{bp.BAA_LEGAL_NOTE}</p>
            </div>
          </section>

          {/* ---------- 10 Governed AI strategy ---------- */}
          <section id="bp-ai" className="bp-section">
            <SectionHead icon={<BotMessageSquare size={15} strokeWidth={1.75} aria-hidden />} title="12 · Governed AI strategy — AI drafts. Rules validate. Clinicians decide." />
            <p className="bp-p">{bp.AI_INTRO}</p>
            <div className="bp-stepper" role="list" aria-label="AI governance pipeline">
              {bp.AI_PIPELINE.map((s, i) => (
                <div className="bp-step" key={s.num} role="listitem">
                  <span className="bp-step-dot" aria-hidden />
                  <span className="bp-step-label">{s.title}</span>
                  {i < bp.AI_PIPELINE.length - 1 && <span className="bp-step-bar" aria-hidden />}
                </div>
              ))}
            </div>
            <div className="bp-bbb-grid">
              {bp.AI_COLUMNS.map(col => (
                <div className={'bp-bbb-col bp-bbb-' + col.tone} key={col.title}>
                  <div className="bp-bbb-title">{col.title}</div>
                  <ul className="bp-bullet-list">
                    {col.items.map(i => <li key={i}>{i}</li>)}
                  </ul>
                </div>
              ))}
            </div>
          </section>

          {/* ---------- 11 Transition options ---------- */}
          <section id="bp-alternatives" className="bp-section">
            <SectionHead icon={<Network size={15} strokeWidth={1.75} aria-hidden />} title="13 · Strategic alternatives — Respect the incumbent; build a credible exit" />
            <p className="bp-p">{bp.ALTERNATIVES_INTRO}</p>
            <div className="bp-alt-grid">
              {bp.ALTERNATIVES.map(a => (
                <div className={'bp-alt-card bp-alt-' + a.tone} key={a.tag}>
                  <span className={'chip ' + (a.tone === 'good' ? 'chip-good' : a.tone === 'bad' ? 'chip-bad' : 'chip-neutral')}>{a.tag}</span>
                  <div className="bp-adr-title">{a.title}</div>
                  <p className="bp-cell-note">{a.body}</p>
                  <ul className="bp-bullet-list">
                    {a.items.map(i => <li key={i}>{i}</li>)}
                  </ul>
                </div>
              ))}
            </div>
            <p className="bp-p bp-p-tight bp-footnote">{bp.ALTERNATIVES_NOTE}</p>
          </section>

          {/* ---------- 12 Benefits realization ---------- */}
          <section id="bp-benefits" className="bp-section">
            <SectionHead icon={<Banknote size={15} strokeWidth={1.75} aria-hidden />} title="14 · Business model & value realization — Value is realized in operations, not software resale" />
            <p className="bp-p">{bp.BENEFITS_INTRO}</p>
            <div className="bp-numbered-grid bp-numbered-grid-3">
              {bp.VALUE_POOLS.map(v => (
                <div className="bp-numbered-card" key={v.num}>
                  <span className="bp-numbered-badge">{v.num}</span>
                  <div className="bp-numbered-title">{v.title}</div>
                  <p>{v.body}</p>
                </div>
              ))}
            </div>
            <div className="bp-formula">{bp.VALUE_FORMULA}</div>
            <p className="bp-p bp-p-tight bp-footnote">{bp.BENEFITS_RULE}</p>
          </section>

          {/* ---------- 13 Adoption & stakeholders ---------- */}
          <section id="bp-adoption" className="bp-section">
            <SectionHead icon={<Users size={15} strokeWidth={1.75} aria-hidden />} title="15 · Marketing, sales & adoption — The customers are the people who must safely change how care works" />
            <p className="bp-p">{bp.ADOPTION_INTRO}</p>
            <div className="bp-fact-list">
              {bp.STAKEHOLDER_PROMISES.map(s => (
                <div className="bp-fact-row" key={s.group}>
                  <span className="bp-fact-label">{s.group}</span>
                  <span className="bp-fact-value">{s.promise}</span>
                </div>
              ))}
            </div>
            <div className="bp-numbered-grid">
              {bp.ADOPTION_STEPS.map(s => (
                <div className="bp-numbered-card" key={s.num}>
                  <span className="bp-numbered-badge">{s.num}</span>
                  <div className="bp-numbered-title">{s.title}</div>
                  <p>{s.body}</p>
                </div>
              ))}
            </div>
            <div className="bp-inline-callout">
              <p className="bp-p bp-p-tight">{bp.COMMERCIALIZATION_NOTE}</p>
            </div>
          </section>

          {/* ---------- 14 Funding request ---------- */}
          <section id="bp-funding" className="bp-section">
            <SectionHead icon={<LineChart size={15} strokeWidth={1.75} aria-hidden />} title="16 · Funding request & use of funds — Fund decisions in stages" />
            <p className="bp-p">{bp.FUNDING_INTRO}</p>
            <div className="bp-callout bp-callout-accent bp-callout-compact">
              <div className="card-kicker">Current authorization</div>
              <p className="bp-callout-body">{bp.FUNDING_AUTHORIZATION}</p>
            </div>
            <div className="bp-funds-grid">
              {bp.USE_OF_FUNDS.map(u => (
                <div className="bp-funds-card" key={u.title}>
                  <div className="bp-funds-pct">{u.pct}%</div>
                  <div className="bp-numbered-title">{u.title}</div>
                  <p>{u.body}</p>
                </div>
              ))}
            </div>
            <div className="bp-gate-row">
              {bp.FUNDING_GATES.map(g => (
                <div className="bp-gate-card" key={g.tag}>
                  <span className="chip chip-brand">{g.tag}</span>
                  <p>{g.body}</p>
                </div>
              ))}
            </div>
            <p className="bp-p bp-p-tight bp-footnote">{bp.FUNDING_SOURCE_NOTE}</p>
          </section>

          {/* ---------- 15 Financial projections ---------- */}
          <section id="bp-financials" className="bp-section">
            <SectionHead icon={<Cpu size={15} strokeWidth={1.75} aria-hidden />} title="17 · Financial plan & five-year projections — Build the case from Care Indeed facts" />
            <p className="bp-p">{bp.FINANCIALS_INTRO}</p>
            <div className="bp-callout bp-callout-neutral">
              <div className="card-kicker">Board-editable, risk-unadjusted scenario</div>
              <ul className="bp-bullet-list">
                {bp.SCENARIO_INPUTS.map(i => <li key={i}>{i}</li>)}
              </ul>
              <p className="bp-cell-note">{bp.SCENARIO_LOGIC}</p>
            </div>
            <div className="bp-table-wrap">
              <table className="table bp-financial-table">
                <thead>
                  <tr>
                    <th scope="col">Period</th>
                    <th scope="col">Status quo cost</th>
                    <th scope="col">Owned-path cost</th>
                    <th scope="col">Added benefit</th>
                    <th scope="col">Annual advantage</th>
                    <th scope="col">Cumulative advantage</th>
                  </tr>
                </thead>
                <tbody>
                  {bp.FIVE_YEAR_BRIDGE.map(row => (
                    <tr key={row.period}>
                      <th scope="row">{row.period}</th>
                      <td>—</td><td>—</td><td>—</td><td>—</td><td>—</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <p className="bp-p bp-p-tight bp-footnote">
              Not a budget. This is an undiscounted comparison — add downside/base/upside
              scenarios, quantified risk, contingency, and Finance validation.
            </p>
            <div className="bp-table-wrap">
              <table className="table bp-year-plan-table">
                <thead>
                  <tr>
                    <th scope="col">Period</th>
                    <th scope="col">Expected investment profile</th>
                    <th scope="col">Benefits permitted in forecast</th>
                    <th scope="col">Evidence needed to retain the case</th>
                  </tr>
                </thead>
                <tbody>
                  {bp.YEAR_PLAN.map(row => (
                    <tr key={row.period}>
                      <th scope="row">{row.period}</th>
                      <td>{row.profile}</td>
                      <td>{row.benefits}</td>
                      <td>{row.evidence}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <p className="bp-p bp-p-tight bp-footnote">{bp.MODEL_INTEGRITY_RULES}</p>
            <div className="bp-inline-callout">
              <p className="bp-p bp-p-tight">{bp.INVESTMENT_APPROVAL_STANDARD}</p>
            </div>
          </section>

          {/* ---------- 16 Roadmap & gates ---------- */}
          <section id="bp-roadmap" className="bp-section">
            <SectionHead icon={<Milestone size={15} strokeWidth={1.75} aria-hidden />} title="18 · Implementation roadmap & decision gates — Proof before replacement" />
            <p className="bp-p">{bp.ROADMAP_INTRO}</p>
            <div className="bp-roadmap-list">
              {bp.ROADMAP_PHASES.map((r, i) => (
                <div className="bp-roadmap-row" key={r.num}>
                  <div className="bp-roadmap-marker">
                    <span className="bp-roadmap-num">{r.num}</span>
                    {i < bp.ROADMAP_PHASES.length - 1 && <span className="bp-roadmap-line" aria-hidden />}
                  </div>
                  <div className="bp-roadmap-body">
                    <div className="bp-roadmap-top">
                      <span className="bp-roadmap-phase">{r.title}</span>
                      <span className="chip chip-outline">{r.window}</span>
                    </div>
                    <div className="bp-roadmap-scope">
                      {r.items.map(s => <span className="chip chip-teal" key={s}>{s}</span>)}
                    </div>
                    <span className="chip chip-brand bp-roadmap-gate">{r.gate}</span>
                  </div>
                </div>
              ))}
            </div>
            <div className="bp-quad-grid">
              {bp.FIRST_90_DAYS.map(d => (
                <div className="bp-quad-card" key={d.window}>
                  <div className="card-kicker">{d.window}</div>
                  <div className="bp-numbered-title">{d.title}</div>
                  <ul className="bp-bullet-list">
                    {d.items.map(i => <li key={i}>{i}</li>)}
                  </ul>
                </div>
              ))}
            </div>
            <div className="bp-inline-callout">
              <p className="bp-p bp-p-tight">{bp.PROPOSED_RESOLUTION}</p>
            </div>
          </section>

          {/* ---------- 17 Organization & governance ---------- */}
          <section id="bp-organization" className="bp-section">
            <SectionHead icon={<Building2 size={15} strokeWidth={1.75} aria-hidden />} title="19 · Organization, management & governance — A permanent systems organization" />
            <p className="bp-p">{bp.ORGANIZATION_INTRO}</p>
            <div className="bp-quad-grid">
              {bp.GOVERNANCE_BODIES.map(g => (
                <div className="bp-quad-card" key={g.title}>
                  <div className="card-kicker">{g.sub}</div>
                  <div className="bp-numbered-title">{g.title}</div>
                  <p>{g.body}</p>
                </div>
              ))}
            </div>
            <div className="bp-org-grid">
              {bp.ORG_ROLES.map(r => (
                <div className="bp-org-card" key={r.title}>
                  <div className="bp-org-title">{r.title}</div>
                  <div className="bp-org-sub">{r.sub}</div>
                  <p>{r.body}</p>
                </div>
              ))}
            </div>
            <div className="bp-cadence-row">
              {bp.GOVERNANCE_CADENCE.map(c => (
                <div className="bp-cadence-item" key={c.cadence}>
                  <span className="chip chip-outline">{c.cadence}</span>
                  <p>{c.body}</p>
                </div>
              ))}
            </div>
          </section>

          {/* ---------- 18 KPIs ---------- */}
          <section id="bp-kpis" className="bp-section">
            <SectionHead icon={<ListChecks size={15} strokeWidth={1.75} aria-hidden />} title="20 · Performance plan & KPIs — Measure care, cash, experience, and trust together" />
            <p className="bp-p">{bp.KPI_INTRO}</p>
            <div className="bp-quad-grid">
              {bp.KPI_GROUPS.map(g => (
                <div className="bp-quad-card" key={g.title}>
                  <div className="card-kicker">{g.sub}</div>
                  <div className="bp-numbered-title">{g.title}</div>
                  <ul className="bp-bullet-list">
                    {g.items.map(i => <li key={i}>{i}</li>)}
                  </ul>
                </div>
              ))}
            </div>
            <div className="bp-inline-callout">
              <p className="bp-p bp-p-tight">{bp.BALANCED_SCORECARD_RULE}</p>
            </div>
          </section>

          {/* ---------- 19 Risk & stop rules ---------- */}
          <section id="bp-stop-rules" className="bp-section">
            <SectionHead icon={<ShieldAlert size={15} strokeWidth={1.75} aria-hidden />} title="21 · Risk analysis & acceptance — The program succeeds by stopping when evidence is weak" />
            <p className="bp-p">{bp.RISK_INTRO}</p>
            <div className="bp-table-wrap">
              <table className="table bp-risk-table">
                <thead>
                  <tr>
                    <th scope="col">Risk</th>
                    <th scope="col">Level</th>
                    <th scope="col">Non-negotiable evidence</th>
                  </tr>
                </thead>
                <tbody>
                  {bp.RISK_TABLE.map(r => (
                    <tr key={r.risk}>
                      <th scope="row">{r.risk}</th>
                      <td>
                        <StatusChip tone={r.level === 'CRITICAL' ? 'bad' : 'warn'}>{r.level}</StatusChip>
                      </td>
                      <td className="bp-cell-note">{r.evidence}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="bp-callout bp-callout-bad">
              <div className="bp-callout-head">
                <span className="bp-callout-icon bp-callout-icon-bad"><ShieldCheck size={16} strokeWidth={1.75} aria-hidden /></span>
                <div className="card-kicker">{bp.STOP_RULE_HEADLINE}</div>
              </div>
              <div className="bp-stop-rules-grid">
                {bp.STOP_RULE_CONDITIONS.map(c => (
                  <span className="bp-stop-rule-item" key={c}>
                    <CheckCircle2 size={12} strokeWidth={2.25} aria-hidden />
                    {c}
                  </span>
                ))}
              </div>
            </div>
          </section>

          {/* ---------- 20 Appendix ---------- */}
          <section id="bp-appendix" className="bp-section">
            <SectionHead icon={<ClipboardList size={15} strokeWidth={1.75} aria-hidden />} title="22 · Appendix, research trail & planning limits — The evidence behind the plan" />
            <p className="bp-p">{bp.APPENDIX_INTRO}</p>
            <div className="bp-appendix-grid">
              {bp.APPENDIX_SECTIONS.map(s => (
                <div className="bp-appendix-card" key={s.title}>
                  <div className="bp-mini-kicker">{s.title}</div>
                  <ul className="bp-bullet-list bp-bullet-list-small">
                    {s.items.map(i => <li key={i}>{i}</li>)}
                  </ul>
                </div>
              ))}
            </div>
            <div className="bp-inline-callout">
              <p className="bp-p bp-p-tight">{bp.APPENDIX_SUPPLIED_ARTIFACTS}</p>
            </div>
            <div className="bp-mini-kicker" style={{ marginTop: 4 }}>Investment-approval appendix still required</div>
            <ul className="bp-bullet-list bp-bullet-list-warn">
              {bp.APPENDIX_STILL_REQUIRED.map(i => <li key={i}>{i}</li>)}
            </ul>
          </section>

          <footer className="bp-footer">
            <ClipboardList size={13} strokeWidth={2} aria-hidden />
            {bp.DOCUMENT_FOOTER}
          </footer>
        </div>

        <nav className="bp-toc" aria-label="Business plan sections">
          <div className="bp-toc-inner">
            <div className="card-kicker bp-toc-kicker">
              <Layers size={12} strokeWidth={2} aria-hidden />
              On this page
            </div>
            <ul className="bp-toc-list">
              {bp.TOC_ITEMS.map(item => (
                <li key={item.id}>
                  <button
                    className={'bp-toc-link' + (active === item.id ? ' is-active' : '')}
                    onClick={() => scrollToSection(item.id)}
                  >
                    <span className="bp-toc-dot" aria-hidden />
                    {item.label}
                  </button>
                </li>
              ))}
            </ul>
          </div>
        </nav>
      </div>
    </div>
  )
}

function SectionHead({ icon, title }: { icon: ReactNode; title: string }) {
  return (
    <div className="bp-section-head">
      <span className="bp-section-icon">{icon}</span>
      <h2 className="bp-h2">{title}</h2>
    </div>
  )
}
