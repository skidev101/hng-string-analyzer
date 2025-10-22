/** @type {import('ts-jest').JestConfigWithTsJest} */
export default {
  preset: "ts-jest",
  testEnvironment: "node",
  roots: ["<rootDir>/tests"],
  moduleDirectories: ["node_modules", "src"],
  moduleFileExtensions: ["ts", "js", "json"],
  clearMocks: true,
};
