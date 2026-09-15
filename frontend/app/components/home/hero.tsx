'use client';

import React from 'react';
import Link from 'next/link';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Autoplay, EffectFade, Navigation } from 'swiper/modules';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { slidesHero } from '@/lib/data/informacion';

import 'swiper/css';
import 'swiper/css/effect-fade';
import 'swiper/css/navigation';

const slides = slidesHero;

const FullScreenHero = () => {
  return (
    <div className="relative h-full w-full group align:left">

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
        {slides.map((slide) => (
          <SwiperSlide key={slide.id} className="relative overflow-hidden">

            {/* IMAGEN CON ZOOM LENTO */}
            <div className="absolute inset-0 animate-slow-zoom">
              <img
                src={slide.image}
                className="h-full w-full object-cover"
                alt={slide.title}
              />
              <div className="absolute inset-0 bg-black/50 sm:bg-black/40 z-10" />
            </div>

            {/* CONTENIDO (Panel de Texto) */}
            <div className="relative z-30 h-full flex items-center">
              <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8 lg:px-12 w-full">
                <div className="max-w-xl sm:max-w-2xl bg-white/90 backdrop-blur-lg p-5 sm:p-6 md:p-8 lg:p-10 border-l-4 sm:border-l-8 border-green-600 shadow-2xl">
                  <h1 className="text-lg sm:text-3xl md:text-4xl lg:text-5xl font-black text-gray-900 leading-tight uppercase">                    {slide.title} <br />
                    <span className="text-green-700">{slide.subtitle}</span>
                  </h1>
                  <p className="mt-4 sm:mt-6 text-sm sm:text-base md:text-lg text-gray-700 font-medium leading-relaxed">
                    {slide.desc}
                  </p>
                  <div className="mt-5 sm:mt-8 flex flex-col sm:flex-row gap-3 sm:gap-4">
                    <Link
                      href="/geografia-publica"
                      className="bg-green-700 text-white px-5 sm:px-8 py-3 sm:py-4 font-bold uppercase text-[10px] sm:text-xs tracking-widest hover:bg-green-800 transition-all shadow-lg active:scale-95 text-center"
                    >
                      Explorar Casos
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
    </div>
  );
};

export default FullScreenHero;

