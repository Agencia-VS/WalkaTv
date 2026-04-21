"use client";
import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";

interface Video {
  id: string;
  title: string;
  thumbnail: string;
  youtubeUrl: string;
  description: string;
  publishedAt: string;
}

export default function LatestContentSection() {
  const [videos, setVideos] = useState<Video[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchVideos = async () => {
      try {
        const response = await fetch("/api/youtube-latest-videos");
        if (!response.ok) throw new Error("Error fetching videos");
        const data = await response.json();
        setVideos(data.videos);
      } catch (err) {
        setError(String(err));
        console.error("Error:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchVideos();
  }, []);

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.15,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, scale: 0.9 },
    visible: {
      opacity: 1,
      scale: 1,
      transition: { duration: 0.5 },
    },
  };

  return (
    <section id="latest" className="bg-jet snap-start min-h-screen w-full flex flex-col items-center justify-center text-white px-4 py-20 md:py-0 scroll-mt-15 pb-16" data-section="latest">
      <motion.h2
        className="text-2xl md:text-4xl lg:text-5xl font-bold mb-8 md:mb-12 text-naranja font-oswald"
        initial={{ opacity: 0, y: -30 }}
        whileInView={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -30 }}
        transition={{ duration: 0.6 }}
        viewport={{ once: false, amount: 0.3 }}
      >
        Últimos videos
      </motion.h2>

      {loading ? (
        <div className="text-center">
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 2, repeat: Infinity }}
            className="inline-block"
          >
            <div className="w-12 h-12 border-2 border-moonstone/40 aspect-square" />
          </motion.div>
          <p className="text-moonstone mt-4">Cargando videos...</p>
        </div>
      ) : error ? (
        <div className="text-center">
          <p className="text-naranja font-bold mb-4">Error cargando videos</p>
          <p className="text-moonstone text-sm">{error}</p>
        </div>
      ) : (
        <motion.div
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6 w-full max-w-5xl px-2"
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          exit="hidden"
          viewport={{ once: false, amount: 0.2 }}
        >
          {videos.map((video) => (
            <motion.a
              key={video.id}
              href={video.youtubeUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="group cursor-pointer"
              variants={itemVariants}
              whileHover={{ scale: 1.05 }}
            >
              <div className="relative aspect-video bg-moonstone overflow-hidden shadow-lg border border-moonstone/40 group-hover:border-naranja transition-all duration-300">
                <img
                  src={video.thumbnail}
                  alt={video.title}
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-all duration-300 flex items-center justify-center">
                  <motion.div
                    className="w-12 h-12 bg-naranja rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                    whileHover={{ scale: 1.1 }}
                  >
                    <svg
                      className="w-6 h-6 text-black ml-1"
                      fill="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path d="M8 5v14l11-7z" />
                    </svg>
                  </motion.div>
                </div>
                <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black to-transparent p-3 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                  <p className="text-white text-sm font-bold line-clamp-2">{video.title}</p>
                </div>
              </div>
            </motion.a>
          ))}
        </motion.div>
      )}
    </section>
  );
}
