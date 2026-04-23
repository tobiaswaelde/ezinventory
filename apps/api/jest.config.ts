import type { Config } from '@jest/types';

const config: Config.InitialOptions = {
  moduleFileExtensions: ['js', 'json', 'ts'],
  moduleNameMapper: {
    // ~/* → ./src/*
    '^~/(.*)$': '<rootDir>/src/$1',
    // @/* → ./*
    '^@/(.*)$': '<rootDir>/$1',
  },
  testRegex: '.*\\.spec\\.ts$',
  preset: 'ts-jest',
  setupFiles: ['<rootDir>/jest.setup.ts'],
  collectCoverageFrom: [
    'src/**/*.{ts,js}',
    '!src/**/*.spec.{ts,js}',
    '!src/**/__mocks__/**',
  ],
  coverageDirectory: './coverage',
  coverageReporters: ['text', 'lcov', 'json-summary'],
  testEnvironment: 'node',
};

export default config;
