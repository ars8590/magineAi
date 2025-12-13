import Link from 'next/link';

export function Navbar() {
  return (
    <header className="sticky top-0 z-40 w-full border-b border-white/10 bg-slate-950/70 backdrop-blur-lg">
      <nav className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
        <Link href="/" className="text-xl font-semibold text-white">
          MagineAI
        </Link>
        <div className="flex items-center gap-4 text-sm text-white/80">
          <Link href="/feedback" className="hover:text-white">
            Feedback
          </Link>
          <Link href="/admin/login" className="hover:text-white">
            Admin
          </Link>
        </div>
      </nav>
    </header>
  );
}

