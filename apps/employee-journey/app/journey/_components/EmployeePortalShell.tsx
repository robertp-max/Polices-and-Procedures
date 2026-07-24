"use client";

/* eslint-disable @next/next/no-img-element */
import { useState, type ReactNode } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  BarChart3,
  BookOpenCheck,
  FileCheck2,
  GraduationCap,
  History,
  Home,
  Map,
  Menu,
  ShieldCheck,
} from "lucide-react";
import { EmployeePreviewToolbar } from "./EmployeePreviewToolbar";
import { MoreSheet } from "./MoreSheet";
import { NolanAssistant, openNolan } from "./NolanAssistant";
import { usePreview } from "./PreviewContext";

const desktopNav = [
  { href: "/journey", label: "Home", icon: Home, exact: true },
  { href: "/journey/my-journey", label: "My Journey", icon: Map },
  { href: "/journey/training", label: "Training", icon: GraduationCap },
  { href: "/journey/policies", label: "Policies", icon: BookOpenCheck },
  { href: "/journey/documents", label: "Documents", icon: FileCheck2 },
  { href: "/journey/competencies", label: "Competencies", icon: ShieldCheck },
  { href: "/journey/performance", label: "Performance", icon: BarChart3 },
  { href: "/journey/history", label: "History", icon: History },
];

const mobileNav = [
  { href: "/journey", label: "Home", icon: Home, exact: true },
  { href: "/journey/my-journey", label: "Journey", icon: Map },
  { href: "/journey/training", label: "Training", icon: GraduationCap },
  { href: "/journey/documents", label: "Documents", icon: FileCheck2 },
];

function isActive(pathname: string, href: string, exact?: boolean) {
  return exact ? pathname === href : pathname === href || pathname.startsWith(`${href}/`);
}

export function EmployeePortalShell({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const { persona, withPersona } = usePreview();
  const [moreOpen, setMoreOpen] = useState(false);

  return (
    <div className="portal-shell">
      <a className="skip-link" href="#main-content">
        Skip to main content
      </a>

      <aside className="desktop-sidebar">
        <Link className="brand" href={withPersona("/journey")} aria-label="Care Indeed Employee Journey home">
          <img src="/assets/logo-careindeed-orange.png" alt="Care Indeed" />
          <span>EMPLOYEE JOURNEY</span>
        </Link>
        <nav aria-label="Employee journey">
          {desktopNav.map(({ href, label, icon: Icon, exact }) => {
            const active = isActive(pathname, href, exact);
            return (
              <Link
                key={href}
                href={withPersona(href)}
                aria-current={active ? "page" : undefined}
              >
                <Icon aria-hidden="true" />
                <span>{label}</span>
              </Link>
            );
          })}
        </nav>
        <button type="button" className="sidebar-support" onClick={() => openNolan()}>
          <GraduationCap aria-hidden="true" />
          <div>
            <strong>Ask Nolan</strong>
            <span>Your onboarding &amp; learning assistant</span>
          </div>
        </button>
        <div className="sidebar-persona">
          <span aria-hidden="true">{persona.name.slice(0, 1)}</span>
          <div>
            <strong>{persona.name}</strong>
            <small>{persona.role}</small>
          </div>
        </div>
      </aside>

      <div className="portal-column">
        <header className="mobile-header">
          <Link href={withPersona("/journey")} aria-label="Care Indeed Employee Journey home">
            <img src="/assets/logo-careindeed-orange.png" alt="Care Indeed" />
          </Link>
          <span>Synthetic preview</span>
        </header>
        <EmployeePreviewToolbar />
        <main id="main-content" className="portal-main" tabIndex={-1}>
          {children}
        </main>
      </div>

      <nav className="mobile-nav" aria-label="Mobile employee journey" data-testid="mobile-nav">
        {mobileNav.map(({ href, label, icon: Icon, exact }) => {
          const active = isActive(pathname, href, exact);
          return (
            <Link
              key={href}
              href={withPersona(href)}
              aria-current={active ? "page" : undefined}
            >
              <Icon aria-hidden="true" />
              <span>{label}</span>
            </Link>
          );
        })}
        <button
          type="button"
          onClick={() => setMoreOpen(true)}
          aria-expanded={moreOpen}
          aria-haspopup="dialog"
          data-testid="more-trigger"
        >
          <Menu aria-hidden="true" />
          <span>More</span>
        </button>
      </nav>

      <MoreSheet open={moreOpen} onClose={() => setMoreOpen(false)} />
      <NolanAssistant />
    </div>
  );
}
