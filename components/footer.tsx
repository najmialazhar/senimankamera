import Link from "next/link";

export function Footer() {
  return (
    <footer className="bg-background border-t border-border/40 py-20 px-6 md:px-20 mt-auto">
      <div className="max-w-[1440px] mx-auto flex flex-col items-center gap-8 text-center">
        {/* Brand Name */}
        <Link href="/" className="font-serif text-3xl font-semibold tracking-tighter text-primary">
          SENIMAN_KAMERA
        </Link>
        
        {/* Navigation Links */}
        <div className="flex flex-wrap justify-center gap-6 md:gap-12 font-sans text-sm tracking-wide text-secondary">
          <a
            href="https://instagram.com"
            target="_blank"
            rel="noopener noreferrer"
            className="hover:text-primary transition-colors duration-300"
          >
            Instagram
          </a>
          <a
            href="https://weddingwire.com"
            target="_blank"
            rel="noopener noreferrer"
            className="hover:text-primary transition-colors duration-300"
          >
            Wedding Wire
          </a>
          <Link href="/terms" className="hover:text-primary transition-colors duration-300">
            Ketentuan Layanan
          </Link>
          <Link href="/privacy" className="hover:text-primary transition-colors duration-300">
            Kebijakan Privasi
          </Link>
        </div>

        {/* Brand Tagline */}
        <p className="font-sans text-[10px] uppercase tracking-widest text-secondary mt-8">
          © {new Date().getFullYear()} SENIMAN_KAMERA PHOTOSHOOT. SANG SENIMAN DI BALIK LENSA.
        </p>
      </div>
    </footer>
  );
}
