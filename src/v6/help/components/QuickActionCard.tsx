

export function QuickActionCard({ label, onClick, href }: { label: string; onClick?: () => void; href?: string }) {
  const Comp = href ? 'a' : 'button';
  return (
    <Comp
      href={href}
      onClick={onClick}
      className="inline-flex items-center px-3 py-1 text-sm border rounded hover:bg-surface transition"
    >
      {label} →
    </Comp>
  );
}
