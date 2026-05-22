import { createHttp } from '@/api';

const normalizeApiBase = (value: string | undefined, fallback: string): string => {
  const raw = (value || fallback).trim();
  if (!raw) return fallback;
  const withLeadingSlash = raw.startsWith('/') ? raw : `/${raw}`;
  return withLeadingSlash.replace(/\/+$/, '');
};

export const ADMIN_API_BASE = normalizeApiBase(import.meta.env.VITE_ADMIN_API_BASE, '/api/admin');

export const GENERATOR_API_BASE = normalizeApiBase(import.meta.env.VITE_GENERATOR_API_BASE, '/api/generator');

export const adminHttp = createHttp(ADMIN_API_BASE);

export const generatorHttp = createHttp(GENERATOR_API_BASE);
