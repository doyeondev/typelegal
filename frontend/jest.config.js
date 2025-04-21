/**
 * 프론트엔드 테스트를 위한 설정
 */
module.exports = {
	testEnvironment: 'jsdom',
	roots: ['<rootDir>'],
	moduleFileExtensions: ['js', 'jsx', 'ts', 'tsx', 'json'],
	moduleDirectories: ['node_modules', 'src'],
	setupFilesAfterEnv: ['./jest.setup.js'],
	testPathIgnorePatterns: ['/node_modules/', '/.next/', '/__tests__/skip/', '/tests/e2e/'],
	transform: {
		'^.+\\.(js|jsx|ts|tsx)$': ['babel-jest', { presets: ['next/babel'] }],
	},
	moduleNameMapper: {
		'\\.(css|less|scss|sass)$': 'identity-obj-proxy',
		'\\.(jpg|jpeg|png|gif|svg)$': '<rootDir>/../__mocks__/fileMock.js',
	},
	testTimeout: 30000,
};
