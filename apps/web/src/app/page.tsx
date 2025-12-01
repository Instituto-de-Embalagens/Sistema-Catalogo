import { ArrowRight } from "lucide-react";

export default function Index() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-primary to-primary/80 text-white overflow-hidden">
      {/* Header with Logo */}
      <header className="relative z-20 pt-8 px-6 md:px-12">
        <div className="max-w-7xl mx-auto">
          <img
            src="https://institutodeembalagens.com.br/wp-content/uploads/2023/09/logo_20_anos_novo_branco-scaled.png"
            alt="Instituto de Embalagens"
            className="h-12 md:h-14 w-auto"
          />
        </div>
      </header>

      {/* Main Content */}
      <main className="relative z-10 max-w-7xl mx-auto px-6 md:px-12 pt-12 md:pt-16 pb-12">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 md:gap-12 items-center">
          {/* Left Column - Content */}
          <div className="space-y-6 md:space-y-8 order-2 lg:order-1">
            <div>
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold leading-tight mb-4">
                Embalagens de Excelência
              </h1>
              <p className="text-lg md:text-xl text-white/90 leading-relaxed max-w-lg">
                Descobra nossa completa linha de catálogos de embalagens, 
                desenvolvidos com precisão e inovação para atender às 
                necessidades mais exigentes do mercado.
              </p>
            </div>

            {/* CTA Button */}
            <div className="pt-4">
              <button className="inline-flex items-center gap-3 bg-white hover:bg-white/95 text-primary font-semibold px-8 py-4 rounded-lg transition-all transform hover:scale-105 active:scale-95 shadow-lg hover:shadow-xl">
                Explorar Catálogo
                <ArrowRight className="w-5 h-5" />
              </button>
            </div>

            {/* Stats/Features */}
            <div className="grid grid-cols-3 gap-4 pt-8 md:pt-12">
              <div className="border-l-2 border-white/50 pl-4">
                <p className="text-2xl md:text-3xl font-bold">20</p>
                <p className="text-sm text-white/80">Anos de Expertise</p>
              </div>
              <div className="border-l-2 border-white/50 pl-4">
                <p className="text-2xl md:text-3xl font-bold">100+</p>
                <p className="text-sm text-white/80">Produtos</p>
              </div>
              <div className="border-l-2 border-white/50 pl-4">
                <p className="text-2xl md:text-3xl font-bold">500+</p>
                <p className="text-sm text-white/80">Clientes</p>
              </div>
            </div>
          </div>

          {/* Right Column - Image */}
          <div className="order-1 lg:order-2 relative h-96 md:h-full min-h-96 lg:min-h-96">
            <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent rounded-2xl overflow-hidden">
              <img
                src="https://images.unsplash.com/photo-1552664730-d307ca884978?q=80&w=800&h=800&fit=crop"
                alt="Embalagens Modernas"
                className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
              />
            </div>

            {/* Floating Card */}
            <div className="absolute bottom-6 right-6 bg-white/95 backdrop-blur text-primary rounded-xl p-4 shadow-2xl max-w-xs">
              <p className="font-semibold mb-1">Sustentabilidade</p>
              <p className="text-sm text-primary/80">
                Embalagens ecológicas para um futuro melhor
              </p>
            </div>
          </div>
        </div>
      </main>

      {/* Decorative Elements */}
      <div className="absolute top-0 right-0 w-96 h-96 bg-white/5 rounded-full blur-3xl -z-0"></div>
      <div className="absolute bottom-0 left-1/2 w-96 h-96 bg-white/5 rounded-full blur-3xl -z-0"></div>
    </div>
  );
}
