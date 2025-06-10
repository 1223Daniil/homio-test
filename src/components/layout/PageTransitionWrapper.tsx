"use client";

import { AnimatePresence, motion } from "framer-motion";

import { useEffect } from "react";
import { usePathname } from "next/navigation";

interface PageTransitionWrapperProps {
  children: React.ReactNode;
}

export function PageTransitionWrapper({
  children
}: PageTransitionWrapperProps) {
  const pathname = usePathname();

  // Scroll to top on route change
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);

  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={pathname}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -20 }}
        transition={{
          duration: 0.3,
          ease: "easeInOut"
        }}
      >
        {children}
      </motion.div>
    </AnimatePresence>
  );
}
