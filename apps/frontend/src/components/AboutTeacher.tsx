'use client';

import Image from 'next/image';
import { Quote } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';

export default function AboutTeacher() {
  const sectionRef = useRef<HTMLElement>(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          observer.disconnect();
        }
      },
      { threshold: 0.15 }
    );
    if (sectionRef.current) observer.observe(sectionRef.current);
    return () => observer.disconnect();
  }, []);

  return (
    <section
      ref={sectionRef}
      className="py-20 bg-gradient-to-b from-gray-50 to-white relative overflow-hidden"
    >
      {/* Animated background blobs */}
      <div
        className="absolute top-0 left-0 w-72 h-72 rounded-full bg-orange-50/60 -translate-x-1/2 -translate-y-1/2 transition-all duration-[2000ms]"
        style={{
          transform: isVisible ? 'translate(-50%, -50%) scale(1)' : 'translate(-50%, -50%) scale(0.4)',
          opacity: isVisible ? 1 : 0,
        }}
      />
      <div
        className="absolute bottom-0 right-0 w-96 h-96 rounded-full bg-orange-50/40 translate-x-1/3 translate-y-1/3 transition-all duration-[2000ms] delay-300"
        style={{
          transform: isVisible ? 'translate(33%, 33%) scale(1)' : 'translate(33%, 33%) scale(0.4)',
          opacity: isVisible ? 1 : 0,
        }}
      />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="grid lg:grid-cols-2 gap-10 items-center">
          {/* Left - Text Content */}
          <div className="order-2 lg:order-1">
            {/* Section title - slide in from left */}
            <div
              className="flex items-center gap-3 mb-8 transition-all duration-700 ease-out"
              style={{
                opacity: isVisible ? 1 : 0,
                transform: isVisible ? 'translateX(0)' : 'translateX(-40px)',
              }}
            >
              <span className="text-2xl">✏️</span>
              <h2
                className="text-3xl sm:text-4xl font-black text-gray-900"
                style={{ fontFamily: 'Plus Jakarta Sans, sans-serif' }}
              >
                ගුරුවරයා පිළිබඳව
              </h2>
            </div>

            {/* Opening quote - fade in + scale */}
            <div
              className="mb-6 transition-all duration-700 ease-out delay-200"
              style={{
                opacity: isVisible ? 1 : 0,
                transform: isVisible ? 'scale(1)' : 'scale(0.5)',
              }}
            >
              <Quote className="w-10 h-10 text-[#F57C20]/70 fill-[#F57C20]/20 rotate-180" />
            </div>

            {/* Description - fade up */}
            <p
              className="text-gray-600 text-base sm:text-lg leading-[2] mb-8 transition-all duration-800 ease-out delay-[400ms]"
              style={{
                fontFamily: "'Noto Sans Sinhala', sans-serif",
                opacity: isVisible ? 1 : 0,
                transform: isVisible ? 'translateY(0)' : 'translateY(30px)',
              }}
            >
              ඔබේ ගුරුවරයා, 2021 වසරේ උසස් පෙළ ගණිත අංශයෙන් විශිෂ්ට ලෙස සමත්ව, දැනට කැළණිය විශ්වවිද්‍යාලයේ භෞතික විද්‍යාව පිළිබඳව උපාධියක් හදාරන (අවසන් වසර) මොහු, විෂය පිළිබඳව උසස් පෙළ මට්ටම ඉක්මවා ගිය ගැඹුරු දැනුමකින් හෙබි අයෙකි. උපකාරක පංති ගුරුවරයෙකු ලෙස වසර 4ක කාලයක් පුරා සිසුන් විශාල සංඛ්‍යාවක් සාර්ථකත්වය කරා මෙහෙයවා ඇති ඔහු, භෞතික විද්‍යාව යනු හුදෙක් සමීකරණ නොව, තර්කානුකූල කලාවක් බව ප්‍රායෝගිකව පෙන්වා දෙයි.
            </p>

            {/* Closing quote - fade in + scale */}
            <div
              className="flex justify-end transition-all duration-700 ease-out delay-[600ms]"
              style={{
                opacity: isVisible ? 1 : 0,
                transform: isVisible ? 'scale(1)' : 'scale(0.5)',
              }}
            >
              <Quote className="w-10 h-10 text-[#F57C20]/70 fill-[#F57C20]/20" />
            </div>
          </div>

          {/* Right - Teacher Image */}
          <div className="order-1 lg:order-2 flex justify-center lg:justify-end">
            <div
              className="relative w-full max-w-sm lg:max-w-md transition-all duration-1000 ease-out delay-200"
              style={{
                opacity: isVisible ? 1 : 0,
                transform: isVisible ? 'translateX(0) scale(1)' : 'translateX(60px) scale(0.92)',
              }}
            >
              {/* Decorative background shape */}
              <div className="absolute inset-0 rounded-3xl bg-gradient-to-br from-gray-200/60 to-gray-100/40 transform rotate-3 scale-105" />

              {/* Image container */}
              <div className="relative rounded-3xl overflow-hidden">
                {/* Grayscale image with gradient overlay */}
                <div className="relative" style={{ filter: 'grayscale(100%)' }}>
                  <Image
                    src="/pasindu-about.png"
                    alt="ගුරුවරයා - Pasindu"
                    width={500}
                    height={600}
                    className="w-full h-auto object-cover"
                    priority={false}
                  />
                </div>
                {/* Bottom gradient fade to white */}
                <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-white via-white/80 to-transparent" />
                {/* Left gradient fade */}
                <div className="absolute inset-y-0 left-0 w-20 bg-gradient-to-r from-white/40 to-transparent" />
              </div>

              {/* Floating decorative dots that animate in */}
              <div
                className="absolute -top-4 -left-4 w-8 h-8 rounded-full border-2 border-orange-300/50 transition-all duration-1000 delay-700"
                style={{
                  opacity: isVisible ? 1 : 0,
                  transform: isVisible ? 'scale(1)' : 'scale(0)',
                }}
              />
              <div
                className="absolute -top-2 left-8 w-3 h-3 rounded-full bg-orange-400/40 transition-all duration-1000 delay-[900ms]"
                style={{
                  opacity: isVisible ? 1 : 0,
                  transform: isVisible ? 'scale(1)' : 'scale(0)',
                }}
              />
              <div
                className="absolute top-1/3 -right-3 w-5 h-5 rounded-full border-2 border-orange-200/50 transition-all duration-1000 delay-[1100ms]"
                style={{
                  opacity: isVisible ? 1 : 0,
                  transform: isVisible ? 'scale(1)' : 'scale(0)',
                }}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Inline keyframe styles for continuous subtle floating */}
      <style jsx>{`
        @keyframes float {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-8px); }
        }
      `}</style>
    </section>
  );
}
