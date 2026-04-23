import { RoleSubject } from '@/generated/prisma/client';
import { accessibleBy } from '@casl/prisma';
import { BadRequestException, NotFoundException } from '@nestjs/common';
import { QueryService } from '~/lib/query-service/query.service';

jest.mock('@casl/prisma', () => ({
  accessibleBy: jest.fn().mockReturnValue({ User: {} }),
}));

const makeTable = () => ({
  findFirst: jest.fn(),
  findMany: jest.fn(),
  findUnique: jest.fn(),
  aggregate: jest.fn(),
  count: jest.fn(),
});

describe('QueryService', () => {
  let service: QueryService;
  let mockTable: ReturnType<typeof makeTable>;

  beforeEach(() => {
    mockTable = makeTable();
    service = new QueryService(mockTable as any, RoleSubject.USER);
    jest.clearAllMocks();
  });

  describe('findOne', () => {
    it('returns the first matching item', async () => {
      const item = { id: '1', name: 'Alice' };
      mockTable.findFirst.mockResolvedValue(item);

      const result = await service.findOne({ where: { id: '1' } });
      expect(result).toEqual(item);
    });

    it('returns null when no item found', async () => {
      mockTable.findFirst.mockResolvedValue(null);
      const result = await service.findOne({ where: { id: 'nonexistent' } });
      expect(result).toBeNull();
    });
  });

  describe('findMany', () => {
    it('returns list of items', async () => {
      const items = [{ id: '1' }, { id: '2' }];
      mockTable.findMany.mockResolvedValue(items);

      const result = await service.findMany({ where: {} });
      expect(result).toEqual(items);
    });

    it('returns empty array when nothing found', async () => {
      mockTable.findMany.mockResolvedValue([]);
      const result = await service.findMany({});
      expect(result).toEqual([]);
    });
  });

  describe('findById', () => {
    it('returns item when found', async () => {
      const item = { id: 'user-1' };
      mockTable.findFirst.mockResolvedValue(item);

      const result = await service.findById('user-1');
      expect(result).toEqual(item);
      expect(mockTable.findFirst).toHaveBeenCalledWith(
        expect.objectContaining({ where: { id: 'user-1' } }),
      );
    });

    it('throws NotFoundException when item not found', async () => {
      mockTable.findFirst.mockResolvedValue(null);

      await expect(service.findById('nonexistent')).rejects.toThrow(NotFoundException);
    });

    it('merges CASL ability conditions when ability provided', async () => {
      const caslWhere = { isActive: true };
      // Use a Proxy so any subject key lookup returns our condition
      (accessibleBy as jest.Mock).mockReturnValue(new Proxy({}, { get: () => caslWhere }));

      const mockAbility = {} as any;
      mockTable.findFirst.mockResolvedValue({ id: 'user-1' });

      await service.findById('user-1', {}, mockAbility);

      expect(mockTable.findFirst).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { AND: [caslWhere, { id: 'user-1' }] },
        }),
      );
    });

    it('throws BadRequestException for PrismaClientValidationError', async () => {
      const { PrismaClientValidationError } = jest.requireActual(
        '@/generated/prisma/internal/prismaNamespace',
      );
      mockTable.findFirst.mockRejectedValue(
        new PrismaClientValidationError('bad query', { clientVersion: '0' }),
      );

      await expect(service.findById('x')).rejects.toThrow(BadRequestException);
    });

    it('throws BadRequestException for PrismaClientKnownRequestError', async () => {
      const { PrismaClientKnownRequestError } = jest.requireActual(
        '@/generated/prisma/internal/prismaNamespace',
      );
      mockTable.findFirst.mockRejectedValue(
        new PrismaClientKnownRequestError('some error\n\n\nhuman readable', {
          code: 'P2025',
          clientVersion: '0',
        }),
      );

      await expect(service.findById('x')).rejects.toThrow(BadRequestException);
    });

    it('throws InternalServerErrorException for unknown errors', async () => {
      const { InternalServerErrorException } = jest.requireActual('@nestjs/common');
      jest.spyOn(console, 'error').mockImplementation(() => {});
      mockTable.findFirst.mockRejectedValue(new Error('something unexpected'));

      await expect(service.findById('x')).rejects.toThrow(InternalServerErrorException);
    });

    it('re-throws HttpExceptions as-is', async () => {
      const { NotFoundException } = jest.requireActual('@nestjs/common');
      const notFound = new NotFoundException('custom not found');
      mockTable.findFirst.mockRejectedValue(notFound);

      await expect(service.findById('x')).rejects.toThrow(notFound);
    });
  });

  describe('findUnique', () => {
    it('returns item when found', async () => {
      const item = { id: 'user-1', email: 'alice@test.com' };
      mockTable.findUnique.mockResolvedValue(item);

      const result = await service.findUnique({ where: { email: 'alice@test.com' } });
      expect(result).toEqual(item);
    });

    it('throws NotFoundException when item not found', async () => {
      mockTable.findUnique.mockResolvedValue(null);

      await expect(service.findUnique({ where: { email: 'nobody@test.com' } })).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('aggregate', () => {
    it('returns serialized aggregate result', async () => {
      mockTable.aggregate.mockResolvedValue({ _sum: { hours: 100 } });

      const result = await service.aggregate({ where: { userId: '1' } });
      expect(result).toEqual({ _sum: { hours: 100 } });
      expect(mockTable.aggregate).toHaveBeenCalledWith(
        expect.objectContaining({ where: { userId: 1 } }),
      );
    });

    it('strips undefined values from args before calling aggregate', async () => {
      mockTable.aggregate.mockResolvedValue({});

      await service.aggregate({ where: undefined, orderBy: undefined });

      const call = mockTable.aggregate.mock.calls[0][0];
      expect(Object.values(call).every((v) => v !== undefined)).toBe(true);
    });
  });

  describe('count', () => {
    it('returns the count', async () => {
      mockTable.count.mockResolvedValue(42);

      const result = await service.count({ where: {} });
      expect(result).toBe(42);
    });
  });

  describe('query', () => {
    it('returns paginated items with page meta', async () => {
      const items = [{ id: '1' }, { id: '2' }];
      mockTable.count.mockResolvedValue(20);
      mockTable.findMany.mockResolvedValue(items);

      const result = await service.query({ page: 2, perPage: 10, where: {} });

      expect(result.items).toEqual(items);
      expect(result.pageMeta.page).toBe(2);
      expect(result.pageMeta.perPage).toBe(10);
      expect(result.pageMeta.itemCount).toBe(20);
      expect(result.pageMeta.pageCount).toBe(2);
      expect(result.pageMeta.hasPrevPage).toBe(true);
      expect(result.pageMeta.hasNextPage).toBe(false);
    });

    it('skips correct number of items based on page', async () => {
      mockTable.count.mockResolvedValue(50);
      mockTable.findMany.mockResolvedValue([]);

      await service.query({ page: 3, perPage: 10, where: {} });

      expect(mockTable.findMany).toHaveBeenCalledWith(
        expect.objectContaining({ skip: 20, take: 10 }),
      );
    });
  });
});
