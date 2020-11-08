import type { Config } from '@jest/types';

const config: Config.InitialOptions = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  clearMocks: true,
  moduleDirectories: ['node_modules'],
  moduleNameMapper: {
    'data/(.*)': '<rootDir>/data/$1',
    'lib/shared/(.*)': '<rootDir>/shared/$1',
  },
};

export default config;
