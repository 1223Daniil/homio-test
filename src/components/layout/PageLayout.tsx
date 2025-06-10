"use client";

import React from "react";
import { Box, Toolbar } from "@mui/material";
import Navigation from "./Navigation";
import { withAILearn } from "@/utils/withAILearn";

interface PageLayoutProps {
  children: React.ReactNode;
}

function PageLayout({ children }: PageLayoutProps) {
  const [mobileOpen, setMobileOpen] = React.useState(false);

  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
  };

  return (
    <Box sx={{ display: "flex", minHeight: "100vh" }}>
      <Navigation mobileOpen={mobileOpen} onDrawerToggle={handleDrawerToggle} />
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          width: { xs: "100%", md: `calc(100% - 240px)` },
          minHeight: "100vh"
        }}
        inert={mobileOpen ? true : undefined}
      >
        <Toolbar />
        <Box sx={{ p: 3 }}>{children}</Box>
      </Box>
    </Box>
  );
}

export default withAILearn(PageLayout, {
  component: "PageLayout",
  description:
    "Main layout component that provides navigation sidebar and content area structure",
  props: {
    children: "React.ReactNode - Content to be rendered in the main area"
  }
});
