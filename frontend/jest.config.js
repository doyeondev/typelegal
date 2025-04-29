/**
 * 프론트엔드 테스트를 위한 설정
 * 최적화된 테스트 환경 구성
 */
module.exports = {
	testEnvironment: 'jsdom',
	roots: ['<rootDir>'],
	moduleFileExtensions: ['js', 'jsx', 'ts', 'tsx', 'json'],
	moduleDirectories: ['node_modules', 'src'],
	setupFilesAfterEnv: ['./jest.setup.js'],
	testPathIgnorePatterns: ['/node_modules/', '/.next/', '/__tests__/skip/', '/tests/e2e/', '/tests/playwright/'],
	transform: {
		'^.+\\.(js|jsx|ts|tsx)$': ['babel-jest', { presets: ['next/babel'] }],
	},
	moduleNameMapper: {
		'\\.(css|less|scss|sass)$': 'identity-obj-proxy',
		'\\.(jpg|jpeg|png|gif|svg)$': '<rootDir>/../__mocks__/fileMock.js',
		'^@/(.*)$': '<rootDir>/src/$1',
		'^@components/(.*)$': '<rootDir>/src/components/$1',
		'^@utils/(.*)$': '<rootDir>/src/utils/$1',
		'^@hooks/(.*)$': '<rootDir>/src/hooks/$1',
		'^@context/(.*)$': '<rootDir>/src/context/$1',
	},
	testTimeout: 30000,
	collectCoverage: true,
	collectCoverageFrom: ['src/**/*.{js,jsx,ts,tsx}', '!src/**/*.d.ts', '!src/**/_*.{js,jsx,ts,tsx}', '!src/**/index.{js,jsx,ts,tsx}', '!**/node_modules/**'],
	coverageDirectory: 'coverage',
	coverageReporters: ['json', 'lcov', 'text', 'clover'],
	testMatch: ['**/__tests__/**/*.test.{js,jsx,ts,tsx}', '**/src/**/*.test.{js,jsx,ts,tsx}'],
};
