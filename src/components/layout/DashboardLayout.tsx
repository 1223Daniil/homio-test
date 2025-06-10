"use client";

import {
  Avatar,
  Button,
  Divider,
  Dropdown,
  DropdownItem,
  DropdownMenu,
  DropdownTrigger
} from "@heroui/react";
import {
  IconAdjustments,
  IconBuilding,
  IconBuildingCommunity,
  IconBuildingStore,
  IconHome2,
  IconLanguage,
  IconLogout,
  IconMenu2,
  IconMoon,
  IconReceipt2,
  IconReportAnalytics,
  IconRobot,
  IconSchool,
  IconSearch,
  IconSettings,
  IconSun,
  IconUserCheck,
  IconUsers
} from "@tabler/icons-react";
import { Link, locales, useRouter } from "@/config/i18n";
import { useCallback, useEffect, useState } from "react";
import { useParams, usePathname } from "next/navigation";

import Image from "next/image";
import { Locale } from "@/config/i18n";
import { UserRole } from "@prisma/client";
import { signOut } from "next-auth/react";
import { useAuth } from "@/hooks/useAuth";
import { useTheme } from "next-themes";
import { useTranslations } from "next-intl";

interface NavLinkProps {
  icon: React.ReactNode;
  label: string;
  href: string;
  isActive?: boolean;
}

function NavLink({ icon, label, href, isActive }: NavLinkProps) {
  return (
    <Link href={href} className="w-full no-underline">
      <div
        className={`
          flex items-center gap-3 px-4 py-3 rounded-lg transition-all
          ${
            isActive
              ? "bg-primary/10 text-primary"
              : "text-default-700 hover:bg-default-100"
          }
        `}
      >
        <div className={`${isActive ? "text-primary" : "text-default-500"}`}>
          {icon}
        </div>
        <span className="font-medium truncate">{label}</span>
      </div>
    </Link>
  );
}

export function DashboardLayout({ children }: { children: React.ReactNode }) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const t = useTranslations("navigation");
  const tHome = useTranslations("Home");
  const pathname = usePathname();
  const { session, hasRole, logout } = useAuth();
  const router = useRouter();
  const params = useParams<{ locale: Locale }>();

  console.log("session", session);

  const navigationItems = [
    {
      icon: <IconBuilding size={20} />,
      label: t("projects"),
      href: "/projects"
    },
    {
      icon: <IconSchool size={20} />,
      label: t("courses"),
      href: "/courses"
    },
    {
      icon: <IconRobot size={20} />,
      label: t("ai"),
      href: "/ai"
    }
  ];

  if (!hasRole([UserRole.DEVELOPER])) {
    navigationItems.push({
      icon: <IconBuildingCommunity size={20} />,
      label: t("developers"),
      href: "/developers"
    });
  }

  // Add transactions for agents and developers
  if (hasRole([UserRole.AGENT, UserRole.DEVELOPER, UserRole.ADMIN])) {
    navigationItems.push({
      icon: <IconReceipt2 size={20} />,
      label: t("transactions"),
      href: "/transactions"
    });
  }

  // Add analytics for admin
  if (hasRole([UserRole.ADMIN, UserRole.DEVELOPER, UserRole.AGENT])) {
    navigationItems.push({
      icon: <IconReportAnalytics size={20} />,
      label: t("analytics"),
      href: "/management/analytics"
    });
  }

  if (hasRole([UserRole.ADMIN, UserRole.DEVELOPER])) {
    navigationItems.push({
      icon: <IconBuildingStore size={20} />,
      label: t("agencies"),
      href: "/management/agencies"
    });
    navigationItems.push({
      icon: <IconUserCheck size={20} />,
      label: t("agents"),
      href: "/management/agents"
    });
  }

  // Add admin-specific items
  if (hasRole([UserRole.ADMIN])) {
    navigationItems.push(
      {
        icon: <IconAdjustments size={20} />,
        label: t("management"),
        href: "/management"
      },
      {
        icon: <IconUsers size={20} />,
        label: t("users"),
        href: "/management/users"
      }
    );
  }

  // Add settings item for all users
  navigationItems.push({
    icon: <IconSettings size={20} />,
    label: t("settings"),
    href: "/settings"
  });

  const handleLanguageChange = (locale: string) => {
    const pathWithoutLocale = pathname.split("/").slice(2).join("/");
    const newPath = `/${pathWithoutLocale}`;
    router.push(newPath, { locale: locale as "en" | "ru" });
  };

  const handleProfileClick = () => {
    router.push(`/settings`);
  };

  const handleLogout = async () => {
    try {
      await logout();
    } catch (error) {
      console.error("Logout error:", error);
    }
  };

  return (
    <div className="flex min-h-screen bg-background">
      {/* Мобильная кнопка меню */}
      <Button
        isIconOnly
        variant="light"
        className="fixed top-4 left-4 z-50 lg:hidden"
        onPress={() => setIsMenuOpen(!isMenuOpen)}
      >
        <IconMenu2 size={24} />
      </Button>

      {/* Боковая панель */}
      <div
        className={`
          fixed left-0 top-0 bottom-0 w-72 flex-none
          transition-transform duration-300 z-40 lg:relative lg:transform-none
          ${isMenuOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"}
        `}
      >
        <div className="absolute inset-0 bg-background/70 backdrop-blur-lg border-r border-divider">
          <div className="flex flex-col h-full">
            {/* Логотип с возможностью клика */}
            <Link href="/" className="block px-7 py-6 hover:opacity-80">
              <Image
                alt="Logo"
                height={40}
                src={
                  theme === "dark"
                    ? "/images/logo_white.png"
                    : "/images/logo.png"
                }
                width={160}
                priority
              />
            </Link>

            <Divider className="my-2" />

            {/* Навигационные элементы */}
            <nav className="flex-1 space-y-1 px-2 py-4 overflow-y-auto">
              {navigationItems.map(item => (
                <NavLink
                  key={item.href}
                  {...item}
                  isActive={
                    pathname === item.href ||
                    pathname.startsWith(item.href + "/")
                  }
                />
              ))}
            </nav>

            {/* Нижняя секция */}
            <div className="p-4 space-y-4 bg-background/70 backdrop-blur-lg border-t border-divider">
              <div className="px-2 space-y-2">
                {/* Выбор языка */}
                <Dropdown>
                  <DropdownTrigger>
                    <Button
                      variant="light"
                      startContent={<IconLanguage size={20} />}
                      className="w-full justify-start"
                    >
                      {t("language")}
                    </Button>
                  </DropdownTrigger>
                  <DropdownMenu
                    aria-label="Languages"
                    onAction={key => handleLanguageChange(key as string)}
                    selectedKeys={[params.locale as string]}
                  >
                    {locales.map(locale => (
                      <DropdownItem
                        key={locale}
                        onClick={() => handleLanguageChange(locale)}
                      >
                        {tHome(`nav.languages.${locale}`)}
                      </DropdownItem>
                    ))}
                  </DropdownMenu>
                </Dropdown>
              </div>

              <Divider />

              {/* Профиль и выход */}
              <div className="px-2">
                <div className="flex items-center gap-2 p-2 rounded-lg bg-default-100">
                  <div
                    className="flex items-center gap-2 flex-1 cursor-pointer hover:opacity-80"
                    onClick={handleProfileClick}
                    role="button"
                    tabIndex={0}
                    onKeyPress={e => {
                      if (e.key === "Enter" || e.key === " ") {
                        handleProfileClick();
                      }
                    }}
                  >
                    <Avatar
                      src={session?.user?.image || undefined}
                      name={session?.user?.name?.[0] || "A"}
                      size="sm"
                      isBordered
                      color="primary"
                    />
                    <div className="flex flex-col min-w-0">
                      <span className="text-sm font-semibold truncate">
                        {session?.user?.name || t("guest")}
                      </span>
                      <span className="text-xs text-default-500 truncate">
                        {session?.user?.email}
                      </span>
                    </div>
                  </div>
                  <Button
                    isIconOnly
                    variant="light"
                    size="sm"
                    onClick={handleLogout}
                    className="min-w-[32px]"
                  >
                    <IconLogout size={18} />
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Основной контент */}
      <main className="flex-1 lg:p-6 w-full min-h-screen">
        <div className="max-w-[2000px] mx-auto">{children}</div>
      </main>

      {/* Затемнение фона при открытом мобильном меню */}
      {isMenuOpen && (
        <div
          className="fixed inset-0 bg-black/30 backdrop-blur-sm z-30 lg:hidden"
          onClick={() => setIsMenuOpen(false)}
        />
      )}
    </div>
  );
}
