import { UserRole, RolePermissions } from '@/types/security';

export const rolePermissionsMap: Record<UserRole, RolePermissions> = {
  [UserRole.ADMIN]: {
    projects: {
      view: true,
      edit: {
        all: true,
        assigned: true
      },
      delete: true,
      create: true,
      export: true
    },
    sql: {
      execute: true
    },
    analytics: {
      view: true,
      export: true,
      create: true
    },
    agents: {
      manage: true,
      view: true,
      assign: true
    }
  },
  [UserRole.MANAGER]: {
    projects: {
      view: true,
      edit: {
        all: false,
        assigned: true
      },
      delete: false,
      create: true,
      export: true
    },
    sql: {
      execute: false
    },
    analytics: {
      view: true,
      export: true,
      create: false
    },
    agents: {
      manage: false,
      view: true,
      assign: true
    }
  },
  [UserRole.AGENT]: {
    projects: {
      view: true,
      edit: {
        all: false,
        assigned: true
      },
      delete: false,
      create: false,
      export: true
    },
    sql: {
      execute: false
    },
    analytics: {
      view: true,
      export: false,
      create: false
    },
    agents: {
      manage: false,
      view: true,
      assign: false
    }
  },
  [UserRole.USER]: {
    projects: {
      view: true,
      edit: {
        all: false,
        assigned: false
      },
      delete: false,
      create: false,
      export: false
    },
    sql: {
      execute: false
    },
    analytics: {
      view: false,
      export: false,
      create: false
    },
    agents: {
      manage: false,
      view: true,
      assign: false
    }
  }
}; 