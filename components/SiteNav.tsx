import Link from "next/link";
import { Beaker, Compass, Hammer, Radar } from "lucide-react";

export function SiteNav() {
  return (
    <header className="sticky top-0 z-30 border-b border-ink-200 bg-ink-50/80 backdrop-blur">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-3">
        <Link href="/" className="flex items-center gap-2 font-serif text-lg">
          <span className="relative inline-flex h-7 w-7 items-center justify-center rounded-full bg-ink-900 text-white">
            <span className="text-[11px] font-bold tracking-wider">DBA</span>
          </span>
          <span className="tracking-tight">Workbench</span>
        </Link>
        <nav className="hidden items-center gap-1 md:flex">
          <NavItem href="/audit" icon={<Radar className="h-4 w-4" />} label="Audit" />
          <NavItem
            href="/create"
            icon={<Hammer className="h-4 w-4" />}
            label="Create"
          />
          <NavItem
            href="/deploy"
            icon={<Compass className="h-4 w-4" />}
            label="Deploy"
            soon
          />
          <NavItem
            href="/framework"
            icon={<Beaker className="h-4 w-4" />}
            label="Framework"
          />
        </nav>
        <Link href="/audit" className="btn-primary text-xs">
          Start audit
        </Link>
      </div>
    </header>
  );
}

function NavItem({
  href,
  icon,
  label,
  soon,
}: {
  href: string;
  icon: React.ReactNode;
  label: string;
  soon?: boolean;
}) {
  return (
    <Link
      href={href}
      className="group inline-flex items-center gap-2 rounded-full px-3 py-1.5 text-sm text-ink-700 transition hover:bg-ink-100 hover:text-ink-900"
    >
      {icon}
      <span>{label}</span>
      {soon && (
        <span className="rounded-full bg-ink-200 px-1.5 text-[10px] font-medium uppercase tracking-wider text-ink-600">
          soon
        </span>
      )}
    </Link>
  );
}
