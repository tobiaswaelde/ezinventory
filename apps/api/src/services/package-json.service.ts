import { Injectable } from '@nestjs/common';
import { existsSync, readFileSync } from 'fs';
import path from 'path';

type PackageJsonAuthor = {
  name: string;
  email: string;
  url: string;
};

export type PackageJson = {
  name: string;
  version: string;
  description?: string;
  author: PackageJsonAuthor;
  private?: boolean;
};

@Injectable()
export class PackageJsonService {
  public static readonly token = 'PACKAGE_JSON_SERVICE';
  private packageJson?: PackageJson;

  constructor() {}

  public getPackageJson(): PackageJson {
    if (this.packageJson) {
      return this.packageJson;
    }

    const packageJsonPath = this.resolvePackageJsonPath();
    const packageJsonFile = JSON.parse(readFileSync(packageJsonPath, 'utf-8')) as PackageJson;
    const packageJson: PackageJson = {
      name: packageJsonFile.name,
      version: packageJsonFile.version,
      description: packageJsonFile.description,
      author: packageJsonFile.author,
      private: packageJsonFile.private,
    };

    this.packageJson = packageJson;

    return packageJson;
  }

  private resolvePackageJsonPath(): string {
    const candidates = [
      path.resolve(process.cwd(), 'apps/api/package.json'),
      path.resolve(process.cwd(), 'package.json'),
    ];

    const packageJsonPath = candidates.find((candidate) => existsSync(candidate));

    if (!packageJsonPath) {
      throw new Error('Could not resolve apps/api/package.json');
    }

    return packageJsonPath;
  }
}
