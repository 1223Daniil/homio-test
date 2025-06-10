"use client";

import Image from "next/image";
import Link from "next/link";

export default function Footer() {
  return (
    <footer className="w-full bg-white">
      {/* CTA Section */}
      <div className="w-full bg-[#3B4BD8]">
        <div className="max-w-[1200px] mx-auto px-6 py-8 relative">
          <div className="flex flex-col md:flex-row relative z-10">
            <div className="max-w-[600px]">
              <h2 className="text-[28px] font-semibold text-white leading-tight">
                Unlock new sales opportunities with Homio.Pro estate platform
              </h2>
              <p className="mt-3 text-white/90 text-sm">
                Our inventory dashboard, academy, automated marketing material creation, and CRM are here to take the stress out of your workflow
              </p>
              
              <div className="flex flex-wrap gap-3 mt-5">
                <Link href="https://t.me/homio_pro" className="flex items-center gap-2 bg-white/10 hover:bg-white/20 transition-colors rounded-md px-3 py-1.5 text-white text-sm">
                  <Image 
                    src="/images/telegram-white.svg" 
                    alt="Telegram" 
                    width={18} 
                    height={18}
                    className="w-4 h-4"
                  />
                  Telegram
                </Link>
                <Link href="https://wa.me/message/YWCMV4XXZWBNA1" className="flex items-center gap-2 bg-white/10 hover:bg-white/20 transition-colors rounded-md px-3 py-1.5 text-white text-sm">
                  <Image 
                    src="/images/whatsapp-white.svg" 
                    alt="WhatsApp" 
                    width={18} 
                    height={18}
                    className="w-4 h-4"
                  />
                  WhatsApp
                </Link>
              </div>
            </div>
          </div>
          
          {/* Background pattern */}
          <div className="absolute top-0 right-0 w-1/2 h-full pointer-events-none">
            <div className="w-full h-full opacity-15">
              <svg width="100%" height="100%" viewBox="0 0 400 300" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M0 0H100V100H0V0Z" fill="white"/>
                <path d="M100 100H200V200H100V100Z" fill="white"/>
                <path d="M200 0H300V100H200V0Z" fill="white"/>
                <path d="M300 100H400V200H300V100Z" fill="white"/>
                <path d="M0 200H100V300H0V200Z" fill="white"/>
                <path d="M200 200H300V300H200V200Z" fill="white"/>
              </svg>
            </div>
          </div>
        </div>
      </div>
      
      {/* Main Footer */}
      <div className="w-full max-w-[1200px] mx-auto px-6 py-6">
        <div className="flex flex-col md:flex-row justify-between gap-5">
          {/* Logo and Mission */}
          <div className="max-w-[400px]">
            <Link href="/" className="inline-block">
              <Image 
                src="/images/homio-pro-logo.svg" 
                alt="HOMIO.PRO" 
                width={120} 
                height={32}
                className="h-7 w-auto"
              />
            </Link>
            <p className="mt-3 text-gray-600 text-xs">
              We're on a mission to revolutionize the property market in Thailand and Indonesia!
            </p>
          </div>
          
          {/* Contact */}
          <div>
            <h3 className="text-xs font-medium text-gray-900 mb-2">Get in touch with us</h3>
            <Link href="mailto:sales@homio.pro" className="flex items-center gap-1 text-gray-600 hover:text-[#3B4BD8] transition-colors mb-2">
              <span className="text-xs">sales@homio.pro</span>
              <svg width="10" height="10" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M3.33334 8H12.6667M12.6667 8L8.00001 3.33333M12.6667 8L8.00001 12.6667" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </Link>
            
            <div className="flex gap-1.5">
              <Link href="https://t.me/homio_pro" className="flex items-center justify-center w-6 h-6 bg-gray-100 rounded-full hover:bg-gray-200 transition-colors">
                <Image 
                  src="/images/telegram-blue.svg" 
                  alt="Telegram" 
                  width={14} 
                  height={14}
                  className="w-3 h-3"
                />
              </Link>
              <Link href="https://wa.me/message/YWCMV4XXZWBNA1" className="flex items-center justify-center w-6 h-6 bg-gray-100 rounded-full hover:bg-gray-200 transition-colors">
                <Image 
                  src="/images/whatsapp-green.svg" 
                  alt="WhatsApp" 
                  width={14} 
                  height={14}
                  className="w-3 h-3"
                />
              </Link>
              <Link href="mailto:sales@homio.pro" className="flex items-center justify-center w-6 h-6 bg-gray-100 rounded-full hover:bg-gray-200 transition-colors">
                <Image 
                  src="/images/email-blue.svg" 
                  alt="Email" 
                  width={14} 
                  height={14}
                  className="w-3 h-3"
                />
              </Link>
            </div>
          </div>
        </div>
        
        {/* Links and Copyright */}
        <div className="flex flex-col md:flex-row justify-between items-center mt-5 pt-5 border-t border-gray-200">
          <div className="flex gap-4 mb-3 md:mb-0">
            <Link href="/developers" className="text-xs text-gray-600 hover:text-[#3B4BD8] transition-colors">
              Developers
              <svg className="inline-block ml-1" width="10" height="10" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M6 12L10 8L6 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </Link>
            <Link href="/agencies" className="text-xs text-gray-600 hover:text-[#3B4BD8] transition-colors">
              Agencies
              <svg className="inline-block ml-1" width="10" height="10" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M6 12L10 8L6 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </Link>
            <Link href="/privacy-policy" className="text-xs text-gray-600 hover:text-[#3B4BD8] transition-colors">
              Privacy Policy
            </Link>
          </div>
          
          <div className="flex flex-col md:flex-row items-center gap-3">
            <p className="text-xs text-gray-500">
              © 2023 Homio.Pro. All rights reserved.
            </p>
            
            <div className="flex gap-2">
              <Link href="https://apps.apple.com/app/homio-pro/id1234567890" className="h-7">
                <Image 
                  src="/images/app-store-badge.svg" 
                  alt="Download on the App Store" 
                  width={84} 
                  height={28}
                  className="h-7 w-auto"
                />
              </Link>
              <Link href="https://play.google.com/store/apps/details?id=pro.homio.app" className="h-7">
                <Image 
                  src="/images/google-play-badge.svg" 
                  alt="Get it on Google Play" 
                  width={94} 
                  height={28}
                  className="h-7 w-auto"
                />
              </Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
} 