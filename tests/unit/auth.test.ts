import { describe, it, expect } from 'vitest';
import { dashboardPathForRoleClient, ROLE_LABELS_TR } from '@/lib/auth/roles';

describe('Faz 1 — auth: role helpers', () => {
  it('redirects ADMIN to /admin', () => {
    expect(dashboardPathForRoleClient('ADMIN')).toBe('/admin');
  });

  it('redirects DRIVER to /surucu', () => {
    expect(dashboardPathForRoleClient('DRIVER')).toBe('/surucu');
  });

  it('redirects RIDER to /yolcu', () => {
    expect(dashboardPathForRoleClient('RIDER')).toBe('/yolcu');
  });

  it('exposes Turkish labels', () => {
    expect(ROLE_LABELS_TR.ADMIN).toBe('Süper Admin');
    expect(ROLE_LABELS_TR.RIDER).toBe('Yolcu');
    expect(ROLE_LABELS_TR.DRIVER).toBe('Sürücü');
  });
});
