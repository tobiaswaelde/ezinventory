import { describe, expect, it, vi } from 'vitest';

import { SetupController } from '../../src/modules/setup/setup.controller.js';

describe('SetupController', () => {
  const buildController = () => {
    const service = {
      getSetupStatus: vi.fn().mockResolvedValue({ setupInitialized: true, registrationMode: 'ADMIN_ONLY' }),
      bootstrapAdmin: vi.fn().mockResolvedValue({ setupInitialized: true, adminUserId: 'u1', email: 'admin@example.com' }),
      updateRegistrationMode: vi.fn().mockResolvedValue({ mode: 'OPEN' }),
      createUserByAdmin: vi.fn().mockResolvedValue({ id: 'u2', email: 'user@example.com', role: 'STAFF' }),
      listUsers: vi.fn().mockResolvedValue([{ id: 'u2', policyIds: [] }]),
      updateUserRole: vi.fn().mockResolvedValue({ id: 'u2', role: 'MANAGER' }),
      listPermissionPolicies: vi.fn().mockResolvedValue([{ id: 'p1' }]),
      createPermissionPolicy: vi.fn().mockResolvedValue({ id: 'p2' }),
      replaceUserPolicies: vi.fn().mockResolvedValue({ userId: 'u2', policyIds: ['p1'] })
    };

    return {
      service,
      controller: new SetupController(service as never)
    };
  };

  it('delegates getSetupStatus() and bootstrapAdmin()', async () => {
    const { controller, service } = buildController();

    await expect(controller.getSetupStatus()).resolves.toEqual({ setupInitialized: true, registrationMode: 'ADMIN_ONLY' });
    expect(service.getSetupStatus).toHaveBeenCalledTimes(1);

    const dto = { email: 'admin@example.com', password: 'x', displayName: 'Admin' };
    await expect(controller.bootstrapAdmin(dto as never)).resolves.toEqual({ setupInitialized: true, adminUserId: 'u1', email: 'admin@example.com' });
    expect(service.bootstrapAdmin).toHaveBeenCalledWith(dto);
  });

  it('delegates updateRegistrationMode()', async () => {
    const { controller, service } = buildController();
    const dto = { mode: 'OPEN' };
    await expect(controller.updateRegistrationMode(dto as never)).resolves.toEqual({ mode: 'OPEN' });
    expect(service.updateRegistrationMode).toHaveBeenCalledWith(dto);
  });

  it('delegates createUserByAdmin() and listUsers()', async () => {
    const { controller, service } = buildController();
    const dto = { email: 'user@example.com', password: 'x', displayName: 'User', role: 'STAFF' };

    await expect(controller.createUserByAdmin(dto as never)).resolves.toEqual({ id: 'u2', email: 'user@example.com', role: 'STAFF' });
    expect(service.createUserByAdmin).toHaveBeenCalledWith(dto);

    const query = { fields: 'id,email' };
    await expect(controller.listUsers(query as never)).resolves.toEqual([{ id: 'u2', policyIds: [] }]);
    expect(service.listUsers).toHaveBeenCalledWith(query);
  });

  it('delegates updateUserRole()', async () => {
    const { controller, service } = buildController();
    const dto = { role: 'MANAGER' };

    await expect(controller.updateUserRole('u2', dto as never)).resolves.toEqual({ id: 'u2', role: 'MANAGER' });
    expect(service.updateUserRole).toHaveBeenCalledWith('u2', dto);
  });

  it('delegates permission policy endpoints', async () => {
    const { controller, service } = buildController();
    const dto = { action: 'read', subject: 'User', inverted: false, reason: null };

    await expect(controller.listPermissionPolicies()).resolves.toEqual([{ id: 'p1' }]);
    expect(service.listPermissionPolicies).toHaveBeenCalledTimes(1);

    await expect(controller.createPermissionPolicy(dto as never)).resolves.toEqual({ id: 'p2' });
    expect(service.createPermissionPolicy).toHaveBeenCalledWith(dto);
  });

  it('delegates replaceUserPolicies()', async () => {
    const { controller, service } = buildController();
    const dto = { policyIds: ['p1'] };

    await expect(controller.replaceUserPolicies('u2', dto as never)).resolves.toEqual({ userId: 'u2', policyIds: ['p1'] });
    expect(service.replaceUserPolicies).toHaveBeenCalledWith('u2', dto);
  });
});
