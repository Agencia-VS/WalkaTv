'use client';

import React from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import SocialFeedSection from "./SocialFeedSection";

export default function FooterSection() {
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.2,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.5 },
    },
  };

  return (
    <div id="footer" className="w-full bg-jet text-moonstone pb-10 md:pb-16 scroll-mt-32">
      <div className="max-w-6xl mx-auto px-4 md:px-6">
        <SocialFeedSection />
      </div>
      <div className="max-w-6xl mx-auto px-4 md:px-6">
        <motion.div
          className="flex flex-col items-center gap-4"
          initial="hidden"
          whileInView="visible"
          exit="hidden"
          variants={containerVariants}
          viewport={{ once: false, amount: 0.5 }}
        >
          <motion.nav
            aria-label="Enlaces legales"
            className="flex flex-wrap gap-4 justify-center text-xs md:text-sm"
            variants={itemVariants}
          >
            <Link href="/articulos" className="text-moonstone hover:text-naranja">
              Artículos
            </Link>
            <Link href="/sobre-nosotros" className="text-moonstone hover:text-naranja">
              Sobre nosotros
            </Link>
            <Link href="/contacto" className="text-moonstone hover:text-naranja">
              Contacto
            </Link>
            <Link href="/privacidad" className="text-moonstone hover:text-naranja">
              Privacidad
            </Link>
            <Link href="/cookies" className="text-moonstone hover:text-naranja">
              Cookies
            </Link>
            <Link href="/terminos" className="text-moonstone hover:text-naranja">
              Términos
            </Link>
          </motion.nav>
          <motion.p
            className="text-center text-moonstone/50 text-xs"
            variants={itemVariants}
          >
            © {new Date().getFullYear()} Walka TV. Todos los derechos reservados.
          </motion.p>
        </motion.div>
      </div>
    </div>
  );
}
