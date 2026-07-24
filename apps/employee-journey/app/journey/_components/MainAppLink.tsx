"use client";

import type { AnchorHTMLAttributes, ReactNode } from "react";
import { LockKeyhole } from "lucide-react";
import { resolveMainAppHref } from "../_lib/mainAppUrl";

/**
 * Same-tab link to a main-app route (module player, canonical policy
 * source, governance, etc). Always a plain <a> — never target="_blank",
 * window.open, or rel="noopener" — per the journey app's same-tab
 * navigation guardrail.
 *
 * When NEXT_PUBLIC_MAIN_APP_URL cannot be resolved (production with no
 * env var configured), renders a disabled, explanatory control instead
 * of guessing a URL or silently pointing at localhost.
 */
export function MainAppLink({
  path,
  className,
  children,
  ...rest
}: {
  path: string;
  className?: string;
  children: ReactNode;
} & Omit<AnchorHTMLAttributes<HTMLAnchorElement>, "href" | "target" | "rel">) {
  const resolved = resolveMainAppHref(path);

  if (!resolved.ok) {
    return (
      <span
        className={`${className ?? ""} is-unavailable`.trim()}
        role="note"
        title={resolved.reason}
      >
        <LockKeyhole aria-hidden="true" />
        {children}
      </span>
    );
  }

  return (
    <a className={className} href={resolved.href} {...rest}>
      {children}
    </a>
  );
}
