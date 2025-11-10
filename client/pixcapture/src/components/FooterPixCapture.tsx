import { Link } from "wouter";

export function FooterPixCapture() {
  return (
    <footer className="border-t border-[var(--color-light-grey)] mt-auto">
      <div className="max-w-[1200px] mx-auto px-4 md:px-8 py-8">
        <div className="flex flex-col md:flex-row items-center justify-center gap-6 md:gap-8">
          <Link href="/pixcapture/help">
            <span className="text-[14px] text-[var(--color-grey)] hover:text-[var(--color-black)] cursor-pointer tracking-[-0.02em] transition-colors hover:underline">
              Hilfe
            </span>
          </Link>
          <span className="hidden md:block text-[var(--color-light-grey)]">|</span>
          <Link href="/pixcapture/impressum">
            <span className="text-[14px] text-[var(--color-grey)] hover:text-[var(--color-black)] cursor-pointer tracking-[-0.02em] transition-colors hover:underline">
              Impressum
            </span>
          </Link>
          <Link href="/pixcapture/datenschutz">
            <span className="text-[14px] text-[var(--color-grey)] hover:text-[var(--color-black)] cursor-pointer tracking-[-0.02em] transition-colors hover:underline">
              Datenschutz
            </span>
          </Link>
          <Link href="/pixcapture/agb">
            <span className="text-[14px] text-[var(--color-grey)] hover:text-[var(--color-black)] cursor-pointer tracking-[-0.02em] transition-colors hover:underline">
              AGB
            </span>
          </Link>
          
          {/* Cross-SPA Link */}
          <span className="hidden md:block text-[var(--color-light-grey)]">|</span>
          <a 
            href="/"
            className="text-[14px] text-[var(--color-grey)] hover:text-[var(--color-black)] cursor-pointer tracking-[-0.02em] transition-colors hover:underline"
          >
            Professionelle Fotografie: pix.immo
          </a>
        </div>
      </div>
    </footer>
  );
}
