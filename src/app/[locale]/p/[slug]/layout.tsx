import MainNav from "@/components/layout/MainNav";
import { PageTransitionWrapper } from "@/components/layout/PageTransitionWrapper";

export default function ProjectLayout({
  children
}: {
  children: React.ReactNode;
}) {
  return (
    <PageTransitionWrapper>
      <MainNav />
      {children}
    </PageTransitionWrapper>
  );
}
