import { beforeEach, describe, expect, it, vi } from 'vitest';
import { staticApi } from './static';
import { setSession } from './session';

const countries = [
  { isoCode: 'POL', name: 'Poland', latest: {} },
  { isoCode: 'DEU', name: 'Germany', latest: {} },
];

describe('static demo API', () => {
  beforeEach(() => {
    localStorage.clear();
    globalThis.fetch = vi.fn(async () => ({ ok: true, json: async () => countries }));
  });

  it('logs in with the demo account', async () => {
    const session = await staticApi.login('demo', 'demo123');
    expect(session.user.username).toBe('demo');
    await expect(staticApi.login('demo', 'wrong')).rejects.toThrow('Invalid username or password');
  });

  it('registers a user and manages the watchlist', async () => {
    setSession(await staticApi.register('anna', 'secret1'));
    expect((await staticApi.watchlist()).map((c) => c.isoCode)).toEqual(['POL']);

    expect((await staticApi.watch('deu')).map((c) => c.isoCode)).toEqual(['POL', 'DEU']);
    expect((await staticApi.unwatch('POL')).map((c) => c.isoCode)).toEqual(['DEU']);

    await expect(staticApi.register('anna', 'secret1')).rejects.toThrow('already taken');
  });

  it('validates registration data', async () => {
    await expect(staticApi.register('ab', 'secret1')).rejects.toThrow('Username');
    await expect(staticApi.register('maria', '123')).rejects.toThrow('Password');
  });
});
