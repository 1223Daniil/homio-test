"use client";

import React from "react";
import {
  Drawer,
  useTheme,
  IconButton,
  Box,
  AppBar,
  Toolbar,
  Typography,
  useMediaQuery,
  Button,
  Menu,
  MenuItem,
  Divider
} from "@mui/material";
import {
  Menu as MenuIcon,
  AccountCircle,
  Language,
  Settings,
  Logout
} from "@mui/icons-material";
import { usePathname, useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { DashboardLayout } from "./DashboardLayout";

interface NavigationProps {
  mobileOpen: boolean;
  onDrawerToggle: () => void;
}

const Navigation: React.FC<NavigationProps> = ({
  mobileOpen,
  onDrawerToggle
}) => {
  const t = useTranslations("common");
  const theme = useTheme();
  const router = useRouter();
  const pathname = usePathname();
  const currentLocale = pathname.split("/")[1];

  // Состояния для меню
  const [profileAnchor, setProfileAnchor] = React.useState<null | HTMLElement>(
    null
  );
  const [langAnchor, setLangAnchor] = React.useState<null | HTMLElement>(null);

  // Обработчики меню
  const handleProfileClick = (event: React.MouseEvent<HTMLElement>) => {
    setProfileAnchor(event.currentTarget);
  };

  const handleLangClick = (event: React.MouseEvent<HTMLElement>) => {
    setLangAnchor(event.currentTarget);
  };

  const handleClose = () => {
    setProfileAnchor(null);
    setLangAnchor(null);
  };

  // Смена языка
  const handleLanguageChange = (locale: string) => {
    const newPath = pathname.replace(`/${currentLocale}`, `/${locale}`);
    router.push(newPath);
    handleClose();
  };

  const drawerContent = <DashboardLayout>{null}</DashboardLayout>;

  return (
    <>
      <AppBar
        position="fixed"
        elevation={0}
        sx={{
          width: { md: `calc(100% - 240px)` },
          ml: { md: "240px" },
          bgcolor: "background.paper",
          borderBottom: "1px solid",
          borderColor: "divider"
        }}
      >
        <Toolbar sx={{ justifyContent: "space-between" }}>
          <Box sx={{ display: "flex", alignItems: "center" }}>
            <IconButton
              color="inherit"
              aria-label="open drawer"
              edge="start"
              onClick={onDrawerToggle}
              sx={{ mr: 2, display: { md: "none" } }}
            >
              <MenuIcon />
            </IconButton>
            <Typography
              variant="h6"
              noWrap
              component="div"
              sx={{
                color: "primary.main",
                fontWeight: 600
              }}
            >
              Homio
            </Typography>
          </Box>

          <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
            {/* Переключатель языка */}
            <Button
              startIcon={<Language />}
              onClick={handleLangClick}
              color="inherit"
              size="small"
            >
              {currentLocale.toUpperCase()}
            </Button>
            <Menu
              anchorEl={langAnchor}
              open={Boolean(langAnchor)}
              onClose={handleClose}
            >
              <MenuItem
                onClick={() => handleLanguageChange("ru")}
                selected={currentLocale === "ru"}
              >
                Русский
              </MenuItem>
              <MenuItem
                onClick={() => handleLanguageChange("en")}
                selected={currentLocale === "en"}
              >
                English
              </MenuItem>
            </Menu>

            {/* Меню профиля */}
            <IconButton
              color="inherit"
              onClick={handleProfileClick}
              size="large"
            >
              <AccountCircle />
            </IconButton>
            <Menu
              anchorEl={profileAnchor}
              open={Boolean(profileAnchor)}
              onClose={handleClose}
            >
              <MenuItem onClick={handleClose}>
                <AccountCircle sx={{ mr: 1 }} />
                {t("profile")}
              </MenuItem>
              <MenuItem onClick={handleClose}>
                <Settings sx={{ mr: 1 }} />
                {t("settings")}
              </MenuItem>
              <Divider />
              <MenuItem onClick={handleClose}>
                <Logout sx={{ mr: 1 }} />
                {t("logout")}
              </MenuItem>
            </Menu>
          </Box>
        </Toolbar>
      </AppBar>

      <Box component="nav" sx={{ width: { md: 240 }, flexShrink: { md: 0 } }}>
        {/* Мобильная версия */}
        <Drawer
          variant="temporary"
          open={mobileOpen}
          onClose={onDrawerToggle}
          ModalProps={{
            keepMounted: true
          }}
          sx={{
            display: { xs: "block", md: "none" },
            "& .MuiDrawer-paper": {
              boxSizing: "border-box",
              width: 240
            }
          }}
        >
          {drawerContent}
        </Drawer>

        {/* Десктопная версия */}
        <Drawer
          variant="permanent"
          sx={{
            display: { xs: "none", md: "block" },
            "& .MuiDrawer-paper": {
              boxSizing: "border-box",
              width: 240,
              borderRight: "1px solid",
              borderColor: "divider"
            }
          }}
          open
        >
          {drawerContent}
        </Drawer>
      </Box>
    </>
  );
};

export default Navigation;
