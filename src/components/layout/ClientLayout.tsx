"use client";

import { useEffect } from 'react';
import { usePathname } from 'next/navigation';
import { PageTransition } from './PageTransition';
import Footer from './Footer';

interface ClientLayoutProps {
  children: React.ReactNode;
}

export default function ClientLayout({ children }: ClientLayoutProps) {
  const pathname = usePathname();

  // Scroll to top on route change
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <PageTransition>
        <div className="flex-grow">
          {children}
        </div>
      </PageTransition>
      <Footer />
    </div>
  );
}
