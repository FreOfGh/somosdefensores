'use client';

import Image from 'next/image';
import Link from 'next/link';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Autoplay, EffectFade, Navigation } from 'swiper/modules';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { homeHeroSlides } from '@/lib/data/rutas';

import 'swiper/css';
import 'swiper/css/effect-fade';
import 'swiper/css/navigation';

const slides = homeHeroSlides;

const FullScreenHero = () => {
  return (
    <section className="group relative min-h-[680px] w-full overflow-hidden bg-slate-950">

      {/* BOTONES DE NAVEGACIÓN PERSONALIZADOS */}
      <button className="swiper-prev absolute left-2 sm:left-4 top-1/2 -translate-y-1/2 z-40 bg-white/10 hover:bg-white/20 backdrop-blur-md p-2 sm:p-3 rounded-full text-white transition-all opacity-0 group-hover:opacity-100 hidden md:block">
        <ChevronLeft size={28} className="sm:w-8 sm:h-8" />
      </button>
      <button className="swiper-next absolute right-2 sm:right-4 top-1/2 -translate-y-1/2 z-40 bg-white/10 hover:bg-white/20 backdrop-blur-md p-2 sm:p-3 rounded-full text-white transition-all opacity-0 group-hover:opacity-100 hidden md:block">
        <ChevronRight size={28} className="sm:w-8 sm:h-8" />
      </button>

      <Swiper
        modules={[Autoplay, EffectFade, Navigation]}
        effect="fade"
        speed={1000}
        autoplay={{ delay: 5000, disableOnInteraction: false }}
        navigation={{
          prevEl: '.swiper-prev',
          nextEl: '.swiper-next',
        }}
        loop={true}
        className="h-full w-full"
      >
        {slides.map((slide, index) => (
          <SwiperSlide key={slide.title} className="relative min-h-[680px] overflow-hidden">

            {/* IMAGEN CON ZOOM LENTO */}
            <div className="absolute inset-0 animate-slow-zoom">
              <Image
                src={slide.image}
                className="h-full w-full object-cover"
                alt=""
                fill
                priority={index === 0}
                sizes="100vw"
              />
              <div className="absolute inset-0 bg-black/25 z-10" />
            </div>

            {/* CONTENIDO (Panel de Texto) */}
            <div className="relative z-30 h-full flex items-center">
              <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8 lg:px-12 w-full">
                <div className="max-w-xl bg-black p-6 text-white shadow-2xl sm:p-8 md:p-10">
                  <p className="text-[0.65rem] font-bold uppercase tracking-[0.22em] text-[#e5b15e]">{slide.eyebrow}</p>
                  <h1 className="mt-4 text-3xl font-black leading-tight sm:text-4xl md:text-5xl">{slide.title}
                  </h1>
                  <p className="mt-4 text-sm font-medium leading-relaxed text-slate-300 sm:text-base md:text-lg">
                    {slide.description}
                  </p>
                  <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:gap-4">
                    <Link
                      href="/geografia-publica"
                      className="bg-[#a82d35] px-5 py-3 text-center text-xs font-bold uppercase tracking-widest text-white transition-colors hover:bg-[#87242b]"
                    >
                      Explorar casos
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          </SwiperSlide>
        ))}
      </Swiper>

      {/* ESTILO PARA LA ANIMACIÓN DE ZOOM */}
      <style jsx global>{`
        @keyframes slowZoom {
          from { transform: scale(1); }
          to { transform: scale(1.1); }
        }
        .animate-slow-zoom {
          animation: slowZoom 10s ease-in-out infinite alternate;
        }
      `}</style>
    </section>
  );
};

export default FullScreenHero;

