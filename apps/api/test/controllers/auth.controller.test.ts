import { describe, expect, it, vi } from 'vitest';

import { AuthController } from '../../src/modules/auth/auth.controller.js';

describe('AuthController', () => {
  const buildController = () => {
    const service = {
      me: vi.fn().mockResolvedValue({ id: 'u1', email: 'a@b.c', role: 'ADMIN', preferredLanguage: 'en' }),
      updatePreferredLanguage: vi.fn().mockResolvedValue({ id: 'u1', preferredLanguage: 'de' }),
      register: vi.fn().mockResolvedValue({ accessToken: 'a', refreshToken: 'r', email: 'a@b.c' }),
      login: vi.fn().mockResolvedValue({ accessToken: 'a', refreshToken: 'r', email: 'a@b.c' }),
      passkeyRegisterOptions: vi.fn().mockResolvedValue({ challenge: 'c', options: {}, email: 'a@b.c' }),
      passkeyRegisterVerify: vi.fn().mockResolvedValue({ verified: true, credentialId: 'cred', email: 'a@b.c' }),
      passkeyLoginOptions: vi.fn().mockResolvedValue({ challenge: 'c', options: {}, email: 'a@b.c' }),
      passkeyLoginVerify: vi.fn().mockResolvedValue({ accessToken: 'a', refreshToken: 'r', email: 'a@b.c' }),
      refresh: vi.fn().mockResolvedValue({ accessToken: 'a2', refreshToken: 'r2', email: 'a@b.c' }),
      logout: vi.fn().mockResolvedValue({ loggedOut: true })
    };

    return {
      service,
      controller: new AuthController(service as never)
    };
  };

  it('delegates me()', async () => {
    const { controller, service } = buildController();
    const user = { id: 'u1' };
    await expect(controller.me(user as never)).resolves.toEqual({ id: 'u1', email: 'a@b.c', role: 'ADMIN', preferredLanguage: 'en' });
    expect(service.me).toHaveBeenCalledWith('u1');
  });

  it('delegates updatePreferredLanguage()', async () => {
    const { controller, service } = buildController();
    const user = { id: 'u1' };
    const dto = { preferredLanguage: 'de' };
    await expect(controller.updatePreferredLanguage(user as never, dto as never)).resolves.toEqual({ id: 'u1', preferredLanguage: 'de' });
    expect(service.updatePreferredLanguage).toHaveBeenCalledWith('u1', 'de');
  });

  it('delegates register()', async () => {
    const { controller, service } = buildController();
    const dto = { email: 'a@b.c', password: 'x', displayName: 'A' };
    await expect(controller.register(dto as never)).resolves.toEqual({ accessToken: 'a', refreshToken: 'r', email: 'a@b.c' });
    expect(service.register).toHaveBeenCalledWith(dto);
  });

  it('delegates login()', async () => {
    const { controller, service } = buildController();
    const dto = { email: 'a@b.c', password: 'x' };
    await expect(controller.login(dto as never)).resolves.toEqual({ accessToken: 'a', refreshToken: 'r', email: 'a@b.c' });
    expect(service.login).toHaveBeenCalledWith(dto);
  });

  it('delegates passkey register options/verify', async () => {
    const { controller, service } = buildController();
    const optionsDto = { email: 'a@b.c', password: 'x' };
    const verifyDto = { email: 'a@b.c', response: {} };

    await expect(controller.passkeyRegisterOptions(optionsDto as never)).resolves.toEqual({ challenge: 'c', options: {}, email: 'a@b.c' });
    expect(service.passkeyRegisterOptions).toHaveBeenCalledWith(optionsDto);

    await expect(controller.passkeyRegisterVerify(verifyDto as never)).resolves.toEqual({ verified: true, credentialId: 'cred', email: 'a@b.c' });
    expect(service.passkeyRegisterVerify).toHaveBeenCalledWith(verifyDto);
  });

  it('delegates passkey login options/verify', async () => {
    const { controller, service } = buildController();
    const optionsDto = { email: 'a@b.c' };
    const verifyDto = { email: 'a@b.c', response: {} };

    await expect(controller.passkeyLoginOptions(optionsDto as never)).resolves.toEqual({ challenge: 'c', options: {}, email: 'a@b.c' });
    expect(service.passkeyLoginOptions).toHaveBeenCalledWith(optionsDto);

    await expect(controller.passkeyLoginVerify(verifyDto as never)).resolves.toEqual({ accessToken: 'a', refreshToken: 'r', email: 'a@b.c' });
    expect(service.passkeyLoginVerify).toHaveBeenCalledWith(verifyDto);
  });

  it('delegates refresh() and logout()', async () => {
    const { controller, service } = buildController();
    const dto = { refreshToken: 'r' };

    await expect(controller.refresh(dto as never)).resolves.toEqual({ accessToken: 'a2', refreshToken: 'r2', email: 'a@b.c' });
    expect(service.refresh).toHaveBeenCalledWith(dto);

    await expect(controller.logout(dto as never)).resolves.toEqual({ loggedOut: true });
    expect(service.logout).toHaveBeenCalledWith(dto);
  });
});
