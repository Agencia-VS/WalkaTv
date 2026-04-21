'use client';

import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import Carousel from "../ui/Carousel/Carousel";
import InfiniteBanner from "../ui/InfiniteBanner";

interface YoutubeStats {
  subscribers: number;
  views: number;
  videoCount: number;
}

interface Video {
  id: string;
  title: string;
  thumbnail: string;
  youtubeUrl: string;
  description: string;
  viewCount: number;
}

export default function HeroSection() {
  return (
    <section
      id="hero"
      className="bg-jet snap-start min-h-screen w-full flex flex-col items-center justify-center relative text-white overflow-hidden pt-24"
      data-section="hero"
    >
      {/* Carrusel solo en pantallas md+ */}
      <div className="hidden md:flex w-full items-center justify-center h-[60vh] lg:h-[70vh]">
        <Carousel
          images={[ 
            "LogosWalka/BannerWalka.png",
          ]}
        />
      </div>
        {/* Grid de imágenes en móviles: 2 por fila */}
        <div className="md:hidden w-full px-4 py-6 grid grid-cols-2 gap-4">
          {["LogosWalka/KSR1@2x.png", "LogosWalka/DM1@2x.png", "LogosWalka/LDJ1@2x.png", "LogosWalka/LSDE1@2x.png", "LogosWalka/CafeC.png", "LogosWalka/IW2@2x.png"].map((img, idx) => (
            <div key={idx} className="flex items-center justify-center">
              <img src={img} alt={`Logo ${idx+1}`} className="w-full h-auto max-h-32 object-contain" />
            </div>
          ))}
        </div>
    </section>
  );
}
