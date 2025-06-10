import { useSession, signIn, signOut } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { UserRole } from "@prisma/client";
import { useLocale } from "next-intl";

export function useAuth() {
  const { data: session, status, update: updateSession } = useSession();
  const router = useRouter();
  const locale = useLocale();

  const requireAuth = () => {
    if (status === "loading") return;

    if (!session) {
      router.push(`/${locale}/login`);
    }
  };

  const login = async (email: string, password: string) => {
    try {
      const result = await signIn("credentials", {
        email,
        password,
        redirect: false
      });

      if (result?.error) {
        throw new Error(result.error);
      }

      if (result?.ok) {
        await updateSession();
        router.refresh();
        router.push(`/${locale}`);
        return { ok: true };
      }

      return { ok: false, error: "Invalid credentials" };
    } catch (error) {
      console.error("Login error:", error);
      throw error;
    }
  };

  const logout = async () => {
    try {
      await signOut({ 
        redirect: false
      });
      router.push(`/${locale}/login`);
      router.refresh();
    } catch (error) {
      console.error("Logout error:", error);
      throw error;
    }
  };

  const hasRole = (roles: UserRole[]) => {
    if (!session?.user?.role) return false;
    return roles.includes(session.user.role as UserRole);
  };

  const canAccessProjects = () => {
    if (!session?.user?.role) return false;
    const role = session.user.role as UserRole;
    return role === UserRole.ADMIN || role === UserRole.DEVELOPER || role === UserRole.AGENT;
  };

  const canEditProject = () => {
    if (!session?.user?.role) return false;
    const role = session.user.role as UserRole;
    return role === UserRole.ADMIN || role === UserRole.DEVELOPER;
  };

  const canAccessCourses = () => {
    if (!session?.user?.role) return false;
    const role = session.user.role as UserRole;
    return role === UserRole.ADMIN || role === UserRole.DEVELOPER || role === UserRole.AGENT;
  };

  const isAdmin = () => hasRole([UserRole.ADMIN]);
  const isDeveloper = () => hasRole([UserRole.DEVELOPER]);
  const isAgent = () => hasRole([UserRole.AGENT]);

  const requireSuperAdmin = () => {
    if (status === "loading") return;

    if (!session || !isAdmin()) {
      router.push(`/${locale}/`);
    }
  };

  return {
    session,
    status,
    requireAuth,
    requireSuperAdmin,
    isAuthenticated: !!session,
    login,
    logout,
    hasRole,
    canAccessProjects,
    canEditProject,
    canAccessCourses,
    isAdmin,
    isDeveloper,
    isAgent,
    updateSession
  };
}
