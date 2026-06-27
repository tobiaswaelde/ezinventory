import { readFileSync } from 'fs';
import path from 'path';

import { PackageJsonService } from '~/services/package-json.service';

describe('PackageJsonService', () => {
  describe('getPackageJson', () => {
    it('loads the API package.json metadata', () => {
      const service = new PackageJsonService();
      const packageJsonPath = path.resolve(process.cwd(), 'package.json');
      const packageJson = JSON.parse(readFileSync(packageJsonPath, 'utf-8')) as {
        name: string;
        version: string;
        description?: string;
        author: {
          name: string;
          email: string;
          url: string;
        };
        private?: boolean;
      };

      expect(service.getPackageJson()).toEqual({
        name: packageJson.name,
        version: packageJson.version,
        description: packageJson.description,
        author: packageJson.author,
        private: packageJson.private,
      });
    });
  });
});
