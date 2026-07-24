"use client";

import Link from "next/link";
import {
  BarChart3,
  BookOpenCheck,
  Headphones,
  History,
  ShieldCheck,
} from "lucide-react";
import { usePreview } from "./PreviewContext";
import { Drawer } from "./ui";

const items = [
  { href: "/journey/policies", label: "Policies", icon: BookOpenCheck },
  { href: "/journey/competencies", label: "Competencies", icon: ShieldCheck },
  { href: "/journey/performance", label: "Performance", icon: BarChart3 },
  { href: "/journey/history", label: "History", icon: History },
  { href: "/journey/support", label: "Support", icon: Headphones },
];

export function MoreSheet({
  open,
  onClose,
}: {
  open: boolean;
  onClose: () => void;
}) {
  const { withPersona } = usePreview();
  return (
    <Drawer
      open={open}
      onClose={onClose}
      title="More"
      description="Additional employee journey workspaces"
      className="more-sheet"
    >
      <nav aria-label="More employee journey workspaces" data-testid="more-sheet">
        {items.map(({ href, label, icon: Icon }) => (
          <Link key={href} href={withPersona(href)} onClick={onClose}>
            <Icon aria-hidden="true" />
            <span>{label}</span>
          </Link>
        ))}
      </nav>
    </Drawer>
  );
}

