import { Link } from "wouter";

export function Footer() {
  return (
    <footer className="border-t border-[var(--color-light-grey)] mt-auto">
      <div className="max-w-[1200px] mx-auto px-4 md:px-8 py-8">
        <div className="flex flex-col md:flex-row items-center justify-center gap-6 md:gap-8">
          <Link href="/impressum">
            <span className="text-[14px] text-[var(--color-grey)] hover:text-[var(--color-black)] cursor-pointer tracking-[-0.02em] transition-colors hover:underline">
              Impressum
            </span>
          </Link>
          <Link href="/datenschutz">
            <span className="text-[14px] text-[var(--color-grey)] hover:text-[var(--color-black)] cursor-pointer tracking-[-0.02em] transition-colors hover:underline">
              Datenschutz
            </span>
          </Link>
          <Link href="/agb">
            <span className="text-[14px] text-[var(--color-grey)] hover:text-[var(--color-black)] cursor-pointer tracking-[-0.02em] transition-colors hover:underline">
              AGB
            </span>
          </Link>
          
          {/* Cross-Domain Link */}
          <span className="hidden md:block text-[var(--color-light-grey)]">|</span>
          <Link href="/pixcapture-home">
            <span className="text-[14px] text-[var(--color-grey)] hover:text-[var(--color-black)] cursor-pointer tracking-[-0.02em] transition-colors hover:underline">
              Selbst fotografieren: pixcapture.app
            </span>
          </Link>
        </div>
      </div>
    </footer>
  );
}
