import { useState } from 'react';
import {
  BookOpen, CheckCircle2, AlertTriangle, Lightbulb,
  Link as LinkIcon, Clock, ArrowRight, ExternalLink,
  User, FileOutput,
} from 'lucide-react';
import type { RegulatoryEvent } from '@/policy/data/regulatoryEvents';
import { HELP_ARTICLES, fallbackHelpArticle, type HelpArticle } from '@/policy/data/helpArticles';
import { ModalShell } from './ModalShell';
import { PolicyRef } from './Primitives';

/* ═══════════════════════════════════════════════════════════════
   Help Center — structured article view + "Open Full Article"
   modal with purpose · when required · steps · forms · mistakes
   · audit tips · related policies · related events.
   ═══════════════════════════════════════════════════════════════ */

export function useHelpArticleForEvent(event: RegulatoryEvent): HelpArticle {
  if (event.helpArticle?.id && HELP_ARTICLES[event.helpArticle.id]) {
    return HELP_ARTICLES[event.helpArticle.id];
  }
  return fallbackHelpArticle(event.title, event.domain);
}

/* ─── Inline tab view inside Event Workspace ─────────── */
export function HelpArticleInline({
  event, onNavigateToEvent,
}: {
  event: RegulatoryEvent;
  onNavigateToEvent?: (id: string) => void;
}) {
  const a = useHelpArticleForEvent(event);
  const [full, setFull] = useState(false);

  return (
    <div>
      <div className="flex items-start justify-between gap-3 mb-2">
        <div className="min-w-0">
          <h4 className="font-montserrat font-bold text-white text-[13px] leading-tight">{a.title}</h4>
          {a.subtitle && <p className="text-[10.5px] font-roboto text-white/55 mt-0.5">{a.subtitle}</p>}
        </div>
        <span className="shrink-0 text-[9.5px] font-montserrat font-bold text-white/45 uppercase tracking-[0.14em] flex items-center gap-1">
          <Clock size={9} /> {a.estimatedMinutes} min
        </span>
      </div>

      <SectionHeading icon={<BookOpen size={10} />} label="Purpose" />
      <p className="text-[11px] font-roboto text-white/75 leading-snug mb-2.5">{a.purpose}</p>

      <SectionHeading icon={<Clock size={10} />} label="When Required" />
      <p className="text-[11px] font-roboto text-white/75 leading-snug mb-2.5">{a.whenRequired}</p>

      <SectionHeading icon={<CheckCircle2 size={10} />} label="Steps" />
      <ol className="space-y-1 mb-2.5">
        {a.steps.slice(0, 4).map((s, i) => (
          <li key={i} className="flex gap-2 text-[11px] font-roboto text-white/70">
            <span className="shrink-0 w-4 h-4 rounded-full bg-[#FFC107]/15 text-[#FFC107] flex items-center justify-center font-montserrat font-bold" style={{ fontSize: 9 }}>{i + 1}</span>
            <span><span className="font-montserrat font-bold text-white/90">{s.label}</span>: {s.detail}</span>
          </li>
        ))}
      </ol>

      <div className="flex items-center justify-between pt-2 border-t border-white/10">
        <div className="flex flex-wrap gap-1">
          {a.relatedPolicies.slice(0, 2).map(p => <PolicyRef key={p.id} id={p.id} />)}
        </div>
        <button
          onClick={() => setFull(true)}
          className="flex items-center gap-1 text-[10px] font-montserrat font-bold text-[#FFC107] hover:text-white uppercase tracking-[0.14em]"
        >
          Open Full Article <ExternalLink size={10} />
        </button>
      </div>

      <HelpArticleModal
        open={full}
        onClose={() => setFull(false)}
        event={event}
        article={a}
        onNavigateToEvent={onNavigateToEvent}
      />
    </div>
  );
}

/* ─── Full article modal ─────────────────────────────── */
export function HelpArticleModal({
  open, onClose, event, article, onNavigateToEvent,
}: {
  open: boolean;
  onClose: () => void;
  event: RegulatoryEvent;
  article: HelpArticle;
  onNavigateToEvent?: (id: string) => void;
}) {
  return (
    <ModalShell
      open={open}
      onClose={onClose}
      width={720}
      title={article.title}
      subtitle={article.subtitle}
      icon={<BookOpen size={16} />}
      footer={
        <>
          <span className="text-[10px] font-roboto text-white/45">
            Updated {new Date(article.updatedAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
          </span>
          <button
            onClick={onClose}
            className="rounded-md border border-white/10 px-3 py-1.5 text-[10.5px] font-montserrat font-bold text-white/80 hover:text-white hover:bg-white/[0.05] uppercase tracking-[0.14em]"
          >
            Close
          </button>
        </>
      }
    >
      <div className="p-5 grid grid-cols-1 md:grid-cols-[1fr_240px] gap-5">
        <div className="space-y-4">
          {article.overview && (
            <div className="rounded-md border border-white/10 bg-white/[0.025] p-3">
              <p className="text-[11.5px] font-roboto text-white/80 leading-relaxed">{article.overview}</p>
            </div>
          )}

          <ArticleSection icon={<BookOpen size={11} />} title="Purpose" color="#FFC107">
            <p className="text-[12px] font-roboto text-white/80 leading-relaxed">{article.purpose}</p>
          </ArticleSection>

          <ArticleSection icon={<Clock size={11} />} title="When Required" color="#FBBF24">
            <p className="text-[12px] font-roboto text-white/80 leading-relaxed">{article.whenRequired}</p>
          </ArticleSection>

          <ArticleSection icon={<User size={11} />} title="Who Is Responsible" color="#60A5FA">
            <p className="text-[12px] font-roboto text-white/80 leading-relaxed">{article.responsible}</p>
          </ArticleSection>

          <ArticleSection icon={<CheckCircle2 size={11} />} title="Steps" color="#10B981">
            <ol className="space-y-1.5">
              {article.steps.map((s, i) => (
                <li key={i} className="flex gap-2.5">
                  <span className="shrink-0 w-5 h-5 rounded-full bg-[#FFC107]/15 text-[#FFC107] flex items-center justify-center font-montserrat font-bold" style={{ fontSize: 10 }}>{i + 1}</span>
                  <div>
                    <span className="font-montserrat font-bold text-white text-[11.5px]">{s.label}</span>
                    <p className="text-[11px] font-roboto text-white/65 leading-snug mt-0.5">{s.detail}</p>
                  </div>
                </li>
              ))}
            </ol>
          </ArticleSection>

          {article.formsRequired.length > 0 && (
            <ArticleSection icon={<LinkIcon size={11} />} title="Forms Required" color="#A78BFA">
              <ul className="grid grid-cols-1 gap-1.5">
                {article.formsRequired.map(f => (
                  <li key={f.formId} className="flex items-center gap-2 p-2 rounded-md border border-white/10 bg-white/[0.02]">
                    <span className="font-mono-jb text-[10px] text-[#FFC107]/85 shrink-0">{f.formId}</span>
                    <span className="text-[11px] font-roboto text-white/80 flex-1 truncate">{f.label}</span>
                    {f.note && <span className="text-[9.5px] font-roboto text-white/45 truncate max-w-[200px]">{f.note}</span>}
                  </li>
                ))}
              </ul>
            </ArticleSection>
          )}

          {article.outputs && article.outputs.length > 0 && (
            <ArticleSection icon={<FileOutput size={11} />} title="Expected Outputs" color="#22D3EE">
              <ul className="space-y-1">
                {article.outputs.map((o, i) => (
                  <li key={i} className="flex items-start gap-1.5 text-[11px] font-roboto text-white/75">
                    <span className="text-[#22D3EE] mt-0.5">▸</span>{o}
                  </li>
                ))}
              </ul>
            </ArticleSection>
          )}

          <ArticleSection icon={<AlertTriangle size={11} />} title="Common Mistakes" color="#EF4444">
            <ul className="space-y-1">
              {article.commonMistakes.map((m, i) => (
                <li key={i} className="flex items-start gap-1.5 text-[11px] font-roboto text-white/75">
                  <span className="text-[#EF4444] mt-0.5">•</span>{m}
                </li>
              ))}
            </ul>
          </ArticleSection>

          <ArticleSection icon={<Lightbulb size={11} />} title="Audit Tips" color="#10B981">
            <ul className="space-y-1">
              {article.auditTips.map((m, i) => (
                <li key={i} className="flex items-start gap-1.5 text-[11px] font-roboto text-white/75">
                  <CheckCircle2 size={10} className="text-[#10B981] shrink-0 mt-0.5" />{m}
                </li>
              ))}
            </ul>
          </ArticleSection>
        </div>

        {/* Sidebar: related policies + events */}
        <aside className="space-y-4">
          <div>
            <h5 className="font-montserrat font-bold text-white/60 text-[10px] uppercase tracking-[0.14em] mb-1.5">Related Policies</h5>
            {article.relatedPolicies.length === 0 && <p className="text-[11px] text-white/40">—</p>}
            <ul className="space-y-1">
              {article.relatedPolicies.map(p => (
                <li key={p.id} className="flex items-center gap-2 text-[11px] font-roboto text-white/80">
                  <PolicyRef id={p.id} />
                  <span className="truncate">{p.label}</span>
                </li>
              ))}
            </ul>
          </div>
          <div>
            <h5 className="font-montserrat font-bold text-white/60 text-[10px] uppercase tracking-[0.14em] mb-1.5">Related Events</h5>
            {article.relatedEventIds.length === 0 && <p className="text-[11px] text-white/40">—</p>}
            <ul className="space-y-1">
              {article.relatedEventIds
                .filter(id => id !== event.id)
                .map(id => (
                  <li key={id}>
                    <button
                      onClick={() => { onNavigateToEvent?.(id); onClose(); }}
                      className="flex items-center gap-1 text-[10.5px] font-roboto text-[#FFC107]/80 hover:text-[#FFC107]"
                    >
                      <ArrowRight size={10} /> {id}
                    </button>
                  </li>
              ))}
            </ul>
          </div>
          <div className="rounded-md border border-white/10 bg-white/[0.02] p-2.5">
            <p className="text-[10px] font-montserrat font-bold text-white/45 uppercase tracking-[0.14em] mb-1">Viewing in context of</p>
            <p className="font-montserrat font-bold text-white text-[11.5px] leading-tight">{event.title}</p>
            <p className="text-[10.5px] font-roboto text-white/55 mt-0.5">{event.owner} · {event.ownerRole}</p>
          </div>
        </aside>
      </div>
    </ModalShell>
  );
}

function ArticleSection({ icon, title, color, children }: { icon: React.ReactNode; title: string; color: string; children: React.ReactNode }) {
  return (
    <section>
      <div className="flex items-center gap-1.5 mb-1.5">
        <span style={{ color }}>{icon}</span>
        <h4 className="font-montserrat font-bold uppercase tracking-[0.14em]" style={{ color, fontSize: 10.5 }}>
          {title}
        </h4>
      </div>
      {children}
    </section>
  );
}

function SectionHeading({ icon, label }: { icon: React.ReactNode; label: string }) {
  return (
    <div className="flex items-center gap-1.5 mb-1 mt-1">
      <span className="text-[#FFC107]">{icon}</span>
      <h5 className="font-montserrat font-bold text-[#FFC107] text-[9.5px] uppercase tracking-[0.16em]">{label}</h5>
    </div>
  );
}
