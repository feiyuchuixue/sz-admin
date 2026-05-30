import { createHttp } from '@/api/request';

const isAbsoluteUrl = (value: string): boolean => /^https?:\/\//i.test(value);

const normalizeApiBase = (value: string | undefined, fallback: string): string => {
  const raw = (value || fallback).trim();
  if (!raw) return fallback;
  if (isAbsoluteUrl(raw)) {
    return raw.replace(/\/+$/, '');
  }
  const withLeadingSlash = raw.startsWith('/') ? raw : `/${raw}`;
  return withLeadingSlash.replace(/\/+$/, '');
};

const joinApiBase = (contextPath: string, apiPrefix: string): string => {
  const normalizedPrefix = normalizeApiBase(apiPrefix, '');
  if (isAbsoluteUrl(normalizedPrefix)) {
    return normalizedPrefix;
  }
  const normalizedContext = normalizeApiBase(contextPath, '');
  if (!normalizedContext) {
    return normalizedPrefix;
  }
  if (!normalizedPrefix) {
    return normalizedContext;
  }
  return `${normalizedContext}${normalizedPrefix}`;
};

export const ADMIN_API_BASE = normalizeApiBase(import.meta.env.VITE_ADMIN_API_BASE, '/api/admin');

export const GENERATOR_API_BASE = normalizeApiBase(import.meta.env.VITE_GENERATOR_API_BASE, '/api/generator');

export const AUDIT_API_BASE = normalizeApiBase(import.meta.env.VITE_AUDIT_API_BASE, '/api/audit');

export const API_CONTEXT_PATH = normalizeApiBase(
  import.meta.env.VITE_API_CONTEXT_PATH || import.meta.env.VITE_MODULE_API_BASE,
  '/api'
);

export const adminHttp = createHttp(ADMIN_API_BASE);

export const generatorHttp = createHttp(GENERATOR_API_BASE);

export const auditHttp = createHttp(AUDIT_API_BASE);

export const createModuleHttp = (moduleCode: string, apiPrefix?: string) => {
  return createHttp(joinApiBase(API_CONTEXT_PATH, apiPrefix || `/${moduleCode}`));
};
