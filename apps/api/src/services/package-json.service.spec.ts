import { PackageJsonService } from '~/services/package-json.service';

describe('PackageJsonService', () => {
  describe('getPackageJson', () => {
    it('loads the API package.json metadata', () => {
      const service = new PackageJsonService();

      expect(service.getPackageJson()).toEqual({
        name: '@exinventory/api',
        version: '0.0.0',
        description: undefined,
        author: {
          name: 'Tobias Wälde',
          email: 'tobias.waelde@gmail.com',
          url: 'https://tobiaswaelde.com',
        },
        private: true,
      });
    });
  });
});
