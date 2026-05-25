import type { Config } from "jest";

process.env.TZ = 'UTC';

const config: Config = {
  preset: "jest-expo",
  setupFilesAfterEnv: ["./jest.setup.ts"],
  collectCoverage: true,
  collectCoverageFrom: [
    "app/**/*.{ts,tsx}",
    "components/**/*.{ts,tsx}",
    "hooks/**/*.{ts,tsx}",
    "constants/**/*.{ts,tsx}",
    "!app/**/_layout.tsx",
    "!components/index.ts",
    "!components/onboarding/first-page.tsx",
    "!**/*.d.ts",
  ],
  coverageProvider: "v8",
  coverageReporters: ["lcov", "text"],
  coverageDirectory: "coverage",
  moduleNameMapper: {
    "^@/(.*)$": "<rootDir>/$1",
    "^@components/(.*)$": "<rootDir>/components/$1",
    "^@hooks/(.*)$": "<rootDir>/hooks/$1",
    "^@constants/(.*)$": "<rootDir>/constants/$1",
    "^@assets/(.*)$": "<rootDir>/assets/$1",
    "^@screens/(.*)$": "<rootDir>/screens/$1",
    "^@utils/(.*)$": "<rootDir>/utils/$1",
    "^@scripts/(.*)$": "<rootDir>/scripts/$1",
    "\\.svg$": "<rootDir>/__mocks__/svg-mock.js",
    "^expo/src/async-require/messageSocket$": "<rootDir>/__mocks__/empty.js",
  },
  transformIgnorePatterns: [
    "node_modules/(?!((jest-)?react-native|@react-native(-community)?)|expo(nent)?|@expo(nent)?/.*|@expo-google-fonts/.*|react-navigation|@react-navigation/.*|@unimodules/.*|unimodules|sentry-expo|native-base|react-native-svg|nativewind|lucide-react-native)",
  ],
  testEnvironment: "node",
  testPathIgnorePatterns: ["/node_modules/", "/e2e/"],
};

export default config;
