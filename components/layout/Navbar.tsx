"use client";
import React, { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { FaYoutube, FaInstagram, FaTiktok } from "react-icons/fa";

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const pathname = usePathname();
  const router = useRouter();
  const isHome = pathname === "/";

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const scrollToSection = (section: "hero" | "latest" | "footer") => {
    if (!isHome) {
      router.push(`/#${section}`);
      return;
    }
    if (section === "footer") {
      document.getElementById("footer")?.scrollIntoView({ behavior: "smooth" });
    } else {
      document
        .querySelector(`[data-section="${section}"]`)
        ?.scrollIntoView({ behavior: "smooth" });
    }
  };

  const navLinkClass =
    "text-moonstone hover:text-naranja hover:scale-110 transition-transform font-bold text-sm cursor-pointer";

  return (
    <nav
      className={`bg-jet fixed top-0 left-0 w-full z-50 transition-all duration-300 border-b-2 ${
        scrolled
          ? "bg-jet/95 backdrop-blur-3xl"
          : "bg-jet/20 backdrop-blur-3xl border-transparent"
      }`}
      style={{ WebkitBackdropFilter: "blur(32px)" }}
    >
      <div className="max-w-7xl mx-auto flex items-center justify-between px-4 md:px-6 py-3 md:py-4">
        <Link
          href="/"
          className={`text-lg md:text-2xl font-extrabold tracking-widest drop-shadow-lg transition-colors duration-300 font-oswald cursor-pointer hover:brightness-110 ${
            scrolled ? "text-naranja" : "text-white"
          }`}
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/LogosWalka/WalkaT.png"
            alt="Walka TV"
            className="h-10 md:h-14 p-1 object-contain transition-transform duration-200 hover:scale-105"
          />
        </Link>

        <div className="flex gap-4 md:gap-6 items-center">
          <div className="hidden md:flex gap-5 items-center">
            <button type="button" onClick={() => scrollToSection("latest")} className={navLinkClass}>
              Videos
            </button>
            <Link href="/articulos" className={navLinkClass}>
              Artículos
            </Link>
            <Link href="/sobre-nosotros" className={navLinkClass}>
              Sobre nosotros
            </Link>
            <Link href="/contacto" className={navLinkClass}>
              Contacto
            </Link>
          </div>

          <button
            type="button"
            aria-label="Abrir menú"
            aria-expanded={menuOpen}
            onClick={() => setMenuOpen((v) => !v)}
            className="md:hidden text-naranja text-2xl px-2"
          >
            {menuOpen ? "×" : "☰"}
          </button>

          <div className="hidden md:flex gap-2 md:gap-3 items-center border-l border-naranja/30 pl-4 md:pl-6">
            <motion.a href="https://www.youtube.com/@Walkaatv" target="_blank" rel="noopener noreferrer" aria-label="YouTube" className="text-moonstone hover:text-naranja transition-colors text-lg" whileHover={{ scale: 1.3 }} whileTap={{ scale: 0.95 }}>
              <FaYoutube />
            </motion.a>
            <motion.a href="https://www.instagram.com/walkatv_/" target="_blank" rel="noopener noreferrer" aria-label="Instagram" className="text-moonstone hover:text-naranja transition-colors text-lg" whileHover={{ scale: 1.3 }} whileTap={{ scale: 0.95 }}>
              <FaInstagram />
            </motion.a>
            <motion.a href="https://tiktok.com/@walkatv_" target="_blank" rel="noopener noreferrer" aria-label="TikTok" className="text-moonstone hover:text-naranja transition-colors text-lg" whileHover={{ scale: 1.3 }} whileTap={{ scale: 0.95 }}>
              <FaTiktok />
            </motion.a>
          </div>
        </div>
      </div>

      {menuOpen && (
        <div className="md:hidden bg-jet/95 backdrop-blur-3xl border-t border-moonstone/30 px-4 py-4 flex flex-col gap-3">
          <button type="button" onClick={() => { setMenuOpen(false); scrollToSection("latest"); }} className={`${navLinkClass} text-left`}>
            Videos
          </button>
          <Link href="/articulos" onClick={() => setMenuOpen(false)} className={navLinkClass}>
            Artículos
          </Link>
          <Link href="/sobre-nosotros" onClick={() => setMenuOpen(false)} className={navLinkClass}>
            Sobre nosotros
          </Link>
          <Link href="/contacto" onClick={() => setMenuOpen(false)} className={navLinkClass}>
            Contacto
          </Link>
        </div>
      )}
    </nav>
  );
}
