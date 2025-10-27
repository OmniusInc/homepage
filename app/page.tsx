import { HeroSection } from '@/components/features/HeroSection';

export default function Home() {
  return (
    <main className="min-h-screen">
      <HeroSection />

      {/* 下にスクロールできるコンテンツエリア */}
      <section id="solutions" className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="container mx-auto px-6 lg:px-8">
          <h2 className="text-4xl font-bold text-white">Solutions</h2>
        </div>
      </section>

      <section id="about" className="min-h-screen bg-gray-800 flex items-center justify-center">
        <div className="container mx-auto px-6 lg:px-8">
          <h2 className="text-4xl font-bold text-white">About Us</h2>
        </div>
      </section>

      <section id="careers" className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="container mx-auto px-6 lg:px-8">
          <h2 className="text-4xl font-bold text-white">Careers</h2>
        </div>
      </section>

      <section id="contact" className="min-h-screen bg-gray-800 flex items-center justify-center">
        <div className="container mx-auto px-6 lg:px-8">
          <h2 className="text-4xl font-bold text-white">Contact</h2>
        </div>
      </section>
    </main>
  );
}
