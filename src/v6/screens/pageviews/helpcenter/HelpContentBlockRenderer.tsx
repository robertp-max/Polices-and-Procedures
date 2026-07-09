import { AlertTriangle, ArrowRight, CheckCircle2, ChevronDown, GitBranch, Info, Lightbulb, ShieldAlert } from 'lucide-react';
import { Link } from 'react-router-dom';
import type { HelpContentBlock, HelpDecisionBranch } from '@/policy/helpCenter/types';
import { HELP_BADGES } from '@/policy/helpCenter/data/helpBadges';
import { getArticleById } from '@/policy/helpCenter/data/helpArticles';
import { HelpBadgeRow } from './HelpBadge';
import { HelpScreenshotFrame } from './HelpScreenshotFrame';

function SectionTitle({ children }: { children: React.ReactNode }) {
  return <h3 className="mb-4 font-montserrat text-[13px] font-bold uppercase tracking-wider text-[#007970]">{children}</h3>;
}

function DecisionNode({ node, depth = 0 }: { node: HelpDecisionBranch; depth?: number }) {
  return (
    <div className={depth > 0 ? 'ml-6 border-l-2 border-[#E5E4E3] pl-4' : ''}>
      <div className="flex items-start gap-2">
        <GitBranch className="mt-0.5 h-4 w-4 shrink-0 text-[#F06923]" aria-hidden />
        <p className="text-sm font-medium text-[#52404B]">{node.question}</p>
      </div>
      <div className="mt-2 grid gap-2 md:grid-cols-2">
        {(['yes', 'no'] as const).map((answer) => (
          <div key={answer} className="rounded-[12px] border border-[#E5E4E3] bg-[#FAFBF8] p-3">
            <span className={`font-montserrat text-[10px] font-bold uppercase tracking-wider ${answer === 'yes' ? 'text-[#008540]' : 'text-[#B3261E]'}`}>
              {answer === 'yes' ? 'Yes' : 'No'}
            </span>
            <p className="mt-1 text-sm leading-relaxed text-[#52404B]">{node[answer].outcome}</p>
            {node[answer].next ? <div className="mt-3"><DecisionNode node={node[answer].next!} depth={depth + 1} /></div> : null}
          </div>
        ))}
      </div>
    </div>
  );
}

const CALLOUT_STYLES = {
  info: { icon: Info, wrap: 'border-[#C4E4F5] bg-[#EEF5FF]', text: 'text-[#2B5E96]' },
  tip: { icon: Lightbulb, wrap: 'border-[#C4F4F5] bg-[#E5FEFF]', text: 'text-[#007970]' },
  important: { icon: AlertTriangle, wrap: 'border-[#F5DCC4] bg-[#FFF7EC]', text: 'text-[#9A6700]' },
} as const;

function relatedLinkTo(link: { kind: string; ref: string }) {
  if (link.kind !== 'article') return link.ref;
  const article = getArticleById(link.ref);
  return article ? `/help/${article.slug}` : '/help';
}

export function HelpContentBlockRenderer({ blocks }: { blocks: HelpContentBlock[] }) {
  return (
    <div className="space-y-8">
      {blocks.map((block, i) => {
        switch (block.type) {
          case 'hero':
            return (
              <div key={i}>
                {block.kicker ? (
                  <p className="mb-3 font-montserrat text-[11px] font-bold uppercase tracking-widest text-[#F06923]">{block.kicker}</p>
                ) : null}
                <HelpScreenshotFrame image={block.image} />
              </div>
            );
          case 'summary':
            return (
              <p key={i} className="max-w-3xl font-roboto text-base font-light leading-relaxed text-[#52404B] md:text-lg">
                {block.body}
              </p>
            );
          case 'badgeRow':
            return <HelpBadgeRow key={i} badges={block.badges} />;
          case 'stepList':
            return (
              <div key={i}>
                {block.title ? <SectionTitle>{block.title}</SectionTitle> : null}
                <ol className="space-y-4">
                  {block.steps.map((step, n) => (
                    <li key={n} className="flex gap-4 rounded-[16px] border border-[#E5E4E3] bg-white p-5">
                      <span className="grid h-9 w-9 shrink-0 place-items-center rounded-[12px] bg-[#E5FEFF] font-montserrat text-sm font-bold text-[#007970]">
                        {n + 1}
                      </span>
                      <div className="min-w-0 flex-1">
                        <p className="font-montserrat text-sm font-bold text-[#004142]">{step.title}</p>
                        <p className="mt-1 text-sm leading-relaxed text-[#52404B]">{step.body}</p>
                        {step.warning ? (
                          <p className="mt-2 flex items-start gap-1.5 text-xs text-[#9A6700]">
                            <AlertTriangle className="mt-0.5 h-3.5 w-3.5 shrink-0" aria-hidden /> {step.warning}
                          </p>
                        ) : null}
                        {step.image ? <div className="mt-3"><HelpScreenshotFrame image={step.image} compact /></div> : null}
                        {step.actionLabel && step.actionTo ? (
                          <Link
                            to={step.actionTo}
                            className="mt-3 inline-flex items-center gap-1.5 font-montserrat text-[11px] font-bold uppercase tracking-widest text-[#007970] hover:text-[#F06923]"
                          >
                            {step.actionLabel} <ArrowRight className="h-3.5 w-3.5 text-[#F06923]" aria-hidden />
                          </Link>
                        ) : null}
                      </div>
                    </li>
                  ))}
                </ol>
              </div>
            );
          case 'image':
            return <HelpScreenshotFrame key={i} image={block.image} />;
          case 'callout': {
            const style = CALLOUT_STYLES[block.tone];
            const Icon = style.icon;
            return (
              <div key={i} className={`flex gap-3 rounded-[16px] border p-5 ${style.wrap}`}>
                <Icon className={`mt-0.5 h-5 w-5 shrink-0 ${style.text}`} aria-hidden />
                <div>
                  <p className={`font-montserrat text-sm font-bold ${style.text}`}>{block.title}</p>
                  <p className="mt-1 text-sm leading-relaxed text-[#52404B]">{block.body}</p>
                </div>
              </div>
            );
          }
          case 'checklist':
            return (
              <div key={i}>
                {block.title ? <SectionTitle>{block.title}</SectionTitle> : null}
                <ul className="space-y-2">
                  {block.items.map((item, n) => (
                    <li key={n} className="flex items-start gap-3 rounded-[12px] border border-[#E5E4E3] bg-white px-4 py-3">
                      <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-[#008540]" aria-hidden />
                      <div>
                        <span className="text-sm font-medium text-[#52404B]">{item.label}</span>
                        {item.detail ? <p className="mt-0.5 text-xs leading-relaxed text-[#52404B]">{item.detail}</p> : null}
                      </div>
                    </li>
                  ))}
                </ul>
              </div>
            );
          case 'decisionTree':
            return (
              <div key={i}>
                {block.title ? <SectionTitle>{block.title}</SectionTitle> : null}
                <DecisionNode node={block.root} />
              </div>
            );
          case 'troubleshootingFlow':
            return (
              <div key={i}>
                <SectionTitle>{block.title ?? 'Troubleshooting'}</SectionTitle>
                <div className="space-y-3">
                  {block.cases.map((c, n) => (
                    <details key={n} className="group rounded-[16px] border border-[#E5E4E3] bg-white">
                      <summary className="flex cursor-pointer items-center justify-between gap-3 p-4 text-sm font-medium text-[#52404B] [&::-webkit-details-marker]:hidden">
                        <span className="flex items-center gap-2">
                          <AlertTriangle className="h-4 w-4 shrink-0 text-[#F06923]" aria-hidden /> {c.symptom}
                        </span>
                        <ChevronDown className="h-4 w-4 shrink-0 text-[#A0A0A0] transition-transform group-open:rotate-180" aria-hidden />
                      </summary>
                      <div className="border-t border-[#E5E4E3] px-4 py-3 text-sm leading-relaxed">
                        <p className="text-[#52404B]"><span className="font-montserrat text-[10px] font-bold uppercase tracking-wider text-[#A0A0A0]">Likely cause</span><br />{c.cause}</p>
                        <p className="mt-2 text-[#52404B]"><span className="font-montserrat text-[10px] font-bold uppercase tracking-wider text-[#008540]">Fix</span><br />{c.fix}</p>
                      </div>
                    </details>
                  ))}
                </div>
              </div>
            );
          case 'roleNote': {
            const roleDef = HELP_BADGES[block.role];
            return (
              <div key={i} className="rounded-[16px] border border-[#E5E4E3] bg-[#FAFBF8] p-5">
                <p className="font-montserrat text-[11px] font-bold uppercase tracking-widest text-[#007970]">
                  Role note — {roleDef?.label ?? block.role}
                </p>
                <p className="mt-2 text-sm leading-relaxed text-[#52404B]">{block.body}</p>
              </div>
            );
          }
          case 'relatedLinks':
            return (
              <div key={i}>
                <SectionTitle>{block.title ?? 'Related'}</SectionTitle>
                <ul className="grid gap-2 md:grid-cols-2">
                  {block.links.map((link, n) => (
                    <li key={n}>
                      <Link
                        to={relatedLinkTo(link)}
                        className="flex items-center justify-between gap-2 rounded-[12px] border border-[#E5E4E3] bg-white px-4 py-3 text-sm font-medium text-[#52404B] transition-colors hover:border-[#007970] hover:text-[#007970] focus-visible:outline-none focus-visible:shadow-focus"
                      >
                        <span className="min-w-0 truncate">{link.label}</span>
                        <ArrowRight className="h-4 w-4 shrink-0 text-[#F06923]" aria-hidden />
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            );
          case 'nextActions':
            return (
              <div key={i}>
                <SectionTitle>{block.title ?? 'What to do next'}</SectionTitle>
                <div className="flex flex-wrap gap-3">
                  {block.actions.map((action, n) => (
                    <Link
                      key={n}
                      to={action.to}
                      className="inline-flex items-center gap-2 rounded-[12px] border border-[#E5E4E3] bg-[#FAFBF8] px-5 py-3 font-montserrat text-[11px] font-bold uppercase tracking-wider text-[#52404B] transition-colors hover:border-[#C4F4F5] hover:bg-[#E5FEFF] hover:text-[#007970] focus-visible:outline-none focus-visible:shadow-focus"
                    >
                      {action.label} <ArrowRight className="h-3.5 w-3.5 text-[#F06923]" aria-hidden />
                    </Link>
                  ))}
                </div>
              </div>
            );
          case 'faq':
            return (
              <div key={i}>
                <SectionTitle>FAQ</SectionTitle>
                <div className="space-y-3">
                  {block.items.map((f, n) => (
                    <details key={n} className="group rounded-[16px] border border-[#E5E4E3] bg-white">
                      <summary className="flex cursor-pointer items-center justify-between gap-3 p-4 text-sm font-medium text-[#52404B] [&::-webkit-details-marker]:hidden">
                        {f.question}
                        <ChevronDown className="h-4 w-4 shrink-0 text-[#A0A0A0] transition-transform group-open:rotate-180" aria-hidden />
                      </summary>
                      <p className="border-t border-[#E5E4E3] px-4 py-3 text-sm leading-relaxed text-[#52404B]">{f.answer}</p>
                    </details>
                  ))}
                </div>
              </div>
            );
          case 'glossary':
            return (
              <div key={i}>
                <SectionTitle>Glossary</SectionTitle>
                <dl className="grid gap-3 md:grid-cols-2">
                  {block.terms.map((t, n) => (
                    <div key={n} className="rounded-[12px] border border-[#E5E4E3] bg-white p-4">
                      <dt className="font-montserrat text-sm font-bold text-[#004142]">{t.term}</dt>
                      <dd className="mt-1 text-sm leading-relaxed text-[#52404B]">{t.definition}</dd>
                    </div>
                  ))}
                </dl>
              </div>
            );
          case 'warning':
            return (
              <div key={i} className="flex gap-3 rounded-[16px] border border-[#F5C4C4] bg-[#FCEBEA] p-5">
                <ShieldAlert className="mt-0.5 h-5 w-5 shrink-0 text-[#B3261E]" aria-hidden />
                <div>
                  <p className="font-montserrat text-sm font-bold text-[#B3261E]">{block.title}</p>
                  <p className="mt-1 text-sm leading-relaxed text-[#52404B]">{block.body}</p>
                </div>
              </div>
            );
          case 'successCriteria':
            return (
              <div key={i} className="rounded-[16px] border border-[#C4F4F5] bg-[#F7FEFF] p-5">
                <p className="mb-3 font-montserrat text-[11px] font-bold uppercase tracking-widest text-[#007970]">
                  {block.title ?? "You're done when"}
                </p>
                <ul className="space-y-1.5">
                  {block.criteria.map((c, n) => (
                    <li key={n} className="flex items-start gap-2 text-sm leading-relaxed text-[#52404B]">
                      <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-[#008540]" aria-hidden /> {c}
                    </li>
                  ))}
                </ul>
              </div>
            );
          default:
            return null;
        }
      })}
    </div>
  );
}
