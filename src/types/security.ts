export interface User {
  id: string;
  role: UserRole;
  name: string;
  email: string;
}

export enum UserRole {
  ADMIN = 'ADMIN',
  MANAGER = 'MANAGER',
  AGENT = 'AGENT',
  USER = 'USER'
}

export interface RolePermissions {
  projects: {
    view: boolean;
    edit: {
      all: boolean;
      assigned: boolean;
    };
    delete: boolean;
    create: boolean;
    export: boolean;
  };
  sql: {
    execute: boolean;
    tables: string[];
    operations: string[];
  };
  analytics: {
    view: boolean;
    export: boolean;
    create: boolean;
  };
  agents: {
    manage: boolean;
    view: boolean;
    assign: boolean;
  };
}

export interface SecurityContext {
  organization: string;
  project: string;
  timeRestrictions?: {
    start: Date;
    end: Date;
  };
  ipRestrictions?: string[];
  dataClassification?: string[];
}

export interface ValidationResult {
  isValid: boolean;
  errors: string[];
}

export interface SecurityError {
  code: string;
  message: string;
  details?: Record<string, any>;
} 