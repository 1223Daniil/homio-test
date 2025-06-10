"use client";

import {
  Button,
  Dropdown,
  DropdownItem,
  DropdownMenu,
  DropdownTrigger
} from "@heroui/react";
import { ChevronDown, Globe, MapPin, Menu, User, X } from "lucide-react";
import { useEffect, useState } from "react";

import Image from "next/image";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { locales } from "@/config/i18n";
import { useRouter } from "next/navigation";
import { useTheme } from "next-themes";
import { useTranslations } from "next-intl";

export default function MainNav() {
  const { theme } = useTheme();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  const router = useRouter();

  const t = useTranslations("Home.nav");

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };

    // Check initially
    checkMobile();

    // Add resize listener
    window.addEventListener("resize", checkMobile);

    // Cleanup
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  // Close mobile menu when switching to desktop
  useEffect(() => {
    if (!isMobile) {
      setIsMobileMenuOpen(false);
    }
  }, [isMobile]);

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-white border-b border-gray-200">
      <div className="flex items-center justify-between h-[72px] px-4 md:px-8">
        {/* Mobile Left Section with Menu and Logo */}
        <div className="flex items-center gap-2 md:hidden">
          <button
            className="p-2 hover:bg-gray-100 rounded-lg"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          >
            {isMobileMenuOpen ? (
              <X className="w-6 h-6" />
            ) : (
              <Menu className="w-6 h-6" />
            )}
          </button>

          <Link href="/" className="flex items-center hover:opacity-80">
            <Image
              alt="Logo"
              height={32}
              src={
                theme === "dark" ? "/images/logo_white.png" : "/images/logo.png"
              }
              width={140}
              priority
            />
          </Link>
        </div>

        {/* Desktop Logo - Hidden on Mobile */}
        <Link
          href="/"
          className="hidden md:flex items-center hover:opacity-80 "
        >
          <Image
            alt="Logo"
            height={32}
            src={
              theme === "dark" ? "/images/logo_white.png" : "/images/logo.png"
            }
            width={140}
            priority
          />
        </Link>

        {/* Mobile Icons - Right side */}
        <div className="flex items-center gap-2 md:hidden">
          <Button variant="light" isIconOnly className="min-w-8 w-8 h-8">
            <svg
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M19 21L12 16L5 21V5C5 4.46957 5.21071 3.96086 5.58579 3.58579C5.96086 3.21071 6.46957 3 7 3H17C17.5304 3 18.0391 3.21071 18.4142 3.58579C18.7893 3.96086 19 4.46957 19 5V21Z"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </Button>
          <Button variant="light" isIconOnly className="min-w-8 w-8 h-8">
            <User className="w-6 h-6" />
          </Button>
        </div>

        {/* Desktop Navigation */}
        <div className="hidden mt-[6px] md:flex items-center gap-4 lg:gap-8 ">
          <div className="flex items-center gap-3 lg:gap-6">
            {/* <Dropdown>
              <DropdownTrigger>
                <Button
                  variant="light"
                  className="h-10 px-2 lg:px-4"
                  endContent={<ChevronDown className="w-4 h-4" />}
                >
                  Developers
                </Button>
              </DropdownTrigger>
              <DropdownMenu>
                <DropdownItem key="overview">Overview</DropdownItem>
                <DropdownItem key="projects">Projects</DropdownItem>
                <DropdownItem key="analytics">Analytics</DropdownItem>
              </DropdownMenu>
            </Dropdown> */}

            {/* <Dropdown>
              <DropdownTrigger>
                <Button
                  variant="light"
                  className="h-10 px-2 lg:px-4"
                  endContent={<ChevronDown className="w-4 h-4" />}
                >
                  Agencies
                </Button>
              </DropdownTrigger>
              <DropdownMenu>
                <DropdownItem key="search">Search</DropdownItem>
                <DropdownItem key="directory">Directory</DropdownItem>
                <DropdownItem key="tools">Tools</DropdownItem>
              </DropdownMenu>
            </Dropdown> */}

            <Dropdown>
              <DropdownTrigger>
                <Button
                  variant="light"
                  className="h-10 px-2 lg:px-4"
                  endContent={<ChevronDown className="w-4 h-4" />}
                >
                  {t("resources")}
                </Button>
              </DropdownTrigger>
              <DropdownMenu>
                <DropdownItem key="blog">{t("blog")}</DropdownItem>
                <DropdownItem key="guides">{t("guides")}</DropdownItem>
                <DropdownItem key="help">{t("help")}</DropdownItem>
              </DropdownMenu>
            </Dropdown>
          </div>

          <div className="flex items-center gap-2 lg:gap-4">
            <Dropdown>
              <DropdownTrigger>
                <Button
                  variant="light"
                  className="h-10 px-2 lg:px-4"
                  startContent={<Globe className="w-4 h-4" />}
                  endContent={<ChevronDown className="w-4 h-4" />}
                >
                  {t("language")}
                </Button>
              </DropdownTrigger>
              <DropdownMenu>
                {locales.map(locale => (
                  <DropdownItem
                    key={locale}
                    onClick={() => router.push(`/${locale}`)}
                  >
                    {t(`languages.${locale}`)}
                  </DropdownItem>
                ))}
              </DropdownMenu>
            </Dropdown>

            <Dropdown>
              <DropdownTrigger>
                <Button
                  variant="light"
                  className="h-10 px-2 lg:px-4"
                  startContent={<MapPin className="w-4 h-4" />}
                  endContent={<ChevronDown className="w-4 h-4" />}
                >
                  {t("location")}
                </Button>
              </DropdownTrigger>
              <DropdownMenu>
                <DropdownItem key="th">{t("thailand")}</DropdownItem>
                <DropdownItem key="id">{t("indonesia")}</DropdownItem>
              </DropdownMenu>
            </Dropdown>

            <Button
              variant="bordered"
              className="h-10 px-2 lg:px-4 min-w-[15px] hidden"
              startContent={<User className="w-4 h-4" />}
            >
              <span className="hidden lg:inline">{t("personalAccount")}</span>
            </Button>
          </div>
        </div>

        {/* Mobile Menu */}
        <div
          className={cn(
            "fixed inset-0 bg-white z-50 transition-transform duration-300 md:hidden",
            isMobileMenuOpen ? "translate-x-0" : "translate-x-full"
          )}
        >
          <div className="flex flex-col h-full">
            {/* Mobile Menu Header */}
            <div className="flex items-center justify-between h-[72px] px-4 border-b border-gray-200">
              <Link
                href="/"
                className="flex items-center hover:opacity-80 mt-[-3px]"
              >
                <Image
                  alt="Logo"
                  height={32}
                  src={
                    theme === "dark"
                      ? "/images/logo_white.png"
                      : "/images/logo.png"
                  }
                  width={140}
                  priority
                />
              </Link>
              <button
                className="p-2 hover:bg-gray-100 rounded-lg"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            {/* Mobile Menu Content */}
            <div className="flex-1 overflow-y-auto px-4 py-6">
              <div className="space-y-6">
                {/* Navigation Links */}
                {/* <div className="space-y-4">
                  <div className="font-medium text-lg">Developers</div>
                  <div className="pl-4 space-y-3">
                    <Link href="/overview" className="block text-gray-600">Overview</Link>
                    <Link href="/projects" className="block text-gray-600">Projects</Link>
                    <Link href="/analytics" className="block text-gray-600">Analytics</Link>
                  </div>
                </div> */}

                {/* <div className="space-y-4">
                  <div className="font-medium text-lg">Agencies</div>
                  <div className="pl-4 space-y-3">
                    <Link href="/search" className="block text-gray-600">Search</Link>
                    <Link href="/directory" className="block text-gray-600">Directory</Link>
                    <Link href="/tools" className="block text-gray-600">Tools</Link>
                  </div>
                </div> */}

                <div className="space-y-4">
                  <div className="font-medium text-lg">{t("resources")}</div>
                  <div className="pl-4 space-y-3">
                    <Link href="/blog" className="block text-gray-600">
                      {t("blog")}
                    </Link>
                    <Link href="/guides" className="block text-gray-600">
                      {t("guides")}
                    </Link>
                    <Link href="/help" className="block text-gray-600">
                      {t("help")}
                    </Link>
                  </div>
                </div>
              </div>
            </div>

            {/* Mobile Menu Footer */}
            <div className="border-t border-gray-200 px-4 py-6 space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Globe className="w-4 h-4" />
                  <span>{t("language")}</span>
                </div>
                <Dropdown placement="bottom-end">
                  <DropdownTrigger>
                    <Button
                      variant="light"
                      endContent={<ChevronDown className="w-4 h-4" />}
                    >
                      {t("language")}
                    </Button>
                  </DropdownTrigger>
                  <DropdownMenu>
                    {locales.map(locale => (
                      <DropdownItem
                        key={locale}
                        onClick={() => router.push(`/${locale}`)}
                      >
                        {t(`languages.${locale}`)}
                      </DropdownItem>
                    ))}
                  </DropdownMenu>
                </Dropdown>
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <MapPin className="w-4 h-4" />
                  <span>{t("location")}</span>
                </div>
                <Dropdown placement="bottom-end">
                  <DropdownTrigger>
                    <Button
                      variant="light"
                      endContent={<ChevronDown className="w-4 h-4" />}
                    >
                      {t("thailand")}
                    </Button>
                  </DropdownTrigger>
                  <DropdownMenu>
                    <DropdownItem key="th-mobile">{t("thailand")}</DropdownItem>
                    <DropdownItem key="id-mobile">
                      {t("indonesia")}
                    </DropdownItem>
                  </DropdownMenu>
                </Dropdown>
              </div>

              <Button
                className="w-full hidden"
                variant="bordered"
                startContent={<User className="w-4 h-4" />}
              >
                {t("personalAccount")}
              </Button>
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
}
