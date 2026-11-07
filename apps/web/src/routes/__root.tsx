import { createRootRoute, Link, Outlet } from '@tanstack/react-router';
import { buttonVariants } from '@/components/ui/button';

/** Style « Genesis » : sobre et éditorial, l'indigo réservé à ce qui est interactif. */
const NAV_LINK =
  'rounded-md px-3 py-1.5 text-sm font-medium text-[#6B6B6B] transition hover:bg-[#F1F1F4] hover:text-[#0A0A0A]';
const NAV_ACTIVE = 'text-[#6366F1] hover:text-[#6366F1]';

function RootLayout() {
  return (
    <div className="relative isolate flex min-h-screen flex-col bg-gradient-to-br from-[#ffe9d6] via-[#ffd6c2] to-[#c9f0dc] font-[DM_Sans,sans-serif] text-[#0A0A0A]">
      {/* Fond « coucher de soleil sur Dakar » : halos aux couleurs du Sénégal qui dérivent. */}
      <div aria-hidden="true" className="pointer-events-none fixed inset-0 -z-10 overflow-hidden">
        <div className="absolute -top-32 -left-32 h-[34rem] w-[34rem] animate-[float_14s_ease-in-out_infinite] rounded-full bg-[#00853f] opacity-30 blur-[110px]" />
        <div className="absolute top-1/4 -right-32 h-[30rem] w-[30rem] animate-[float_18s_ease-in-out_infinite_reverse] rounded-full bg-[#fdef42] opacity-50 blur-[110px]" />
        <div className="absolute -bottom-32 left-1/3 h-[34rem] w-[34rem] animate-[float_16s_ease-in-out_infinite] rounded-full bg-[#ff5a3c] opacity-35 blur-[110px]" />
        <div
          className="absolute inset-0 opacity-40"
          style={{
            backgroundImage: 'radial-gradient(rgba(255,255,255,0.9) 1px, transparent 1px)',
            backgroundSize: '24px 24px',
          }}
        />
      </div>
      <header className="sticky top-0 z-20 border-b border-[#E8E8EC] bg-white/80 backdrop-blur">
        <div className="mx-auto flex h-14 max-w-[1280px] items-center justify-between gap-4 px-6">
          <Link to="/" className="flex items-center gap-2">
            <span className="text-xl">🦁</span>
            <span className="font-[General_Sans,sans-serif] text-lg font-bold tracking-[-0.03em]">
              Ndam
            </span>
          </Link>
          <nav className="flex items-center gap-1">
            <Link to="/podiums" className={NAV_LINK} activeProps={{ className: NAV_ACTIVE }}>
              Vérifier
            </Link>
            <a href="/podiums#medailles" className={NAV_LINK}>
              Médailles
            </a>
            <Link to="/disciplines" className={NAV_LINK} activeProps={{ className: NAV_ACTIVE }}>
              Disciplines
            </Link>
          </nav>
          <span className="flex items-center gap-2 rounded-full border border-[#E8E8EC] bg-white px-3 py-1 text-xs font-medium text-[#6B6B6B]">
            <span className="h-2 w-2 animate-pulse rounded-full bg-[#10B981]" />
            JOJ Dakar 2026 · en direct
          </span>
        </div>
      </header>

      <main className="mx-auto flex w-full max-w-[1280px] flex-1 flex-col gap-6 px-6 py-12">
        <Outlet />
      </main>

      <footer className="border-t border-[#E8E8EC] bg-white">
        <div className="mx-auto flex max-w-[1280px] flex-wrap items-center justify-between gap-3 px-6 py-6 text-[13px] text-[#6B6B6B]">
          <p>
            <span className="font-semibold text-[#0A0A0A]">Ndam</span> · La victoire, vérifiée.
          </p>
          <p>Projet de démonstration non officiel · Bootcamp AI Programming JOJ Dakar 2026</p>
        </div>
      </footer>
    </div>
  );
}

function NotFound() {
  return (
    <div className="flex flex-col items-start gap-4">
      <h1 className="text-2xl font-semibold">Page introuvable</h1>
      <Link to="/" className={buttonVariants()}>
        Retour à l’accueil
      </Link>
    </div>
  );
}

export const Route = createRootRoute({ component: RootLayout, notFoundComponent: NotFound });
