import Image from 'next/image';
import Link from 'next/link';

export function Header() {
  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-white/80 backdrop-blur-md border-b border-[var(--border-color)]">
      <div className="container mx-auto px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          {/* ロゴ */}
          <Link href="/" className="flex items-center transition-opacity hover:opacity-80">
            <Image
              src="/images/logo.png"
              alt="Omnius"
              width={140}
              height={40}
              priority
              className="h-10 w-auto"
            />
          </Link>
        </div>
      </div>
    </header>
  );
}
