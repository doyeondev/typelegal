/**
 * 프론트엔드 테스트를 위한 설정
 */
module.exports = {
	testEnvironment: 'jsdom',
	roots: ['<rootDir>'],
	moduleFileExtensions: ['js', 'jsx', 'ts', 'tsx', 'json'],
	setupFilesAfterEnv: ['../jest.setup.js'],
	testPathIgnorePatterns: ['/node_modules/', '/.next/'],
	transform: {
		'^.+\\.(js|jsx|ts|tsx)$': ['babel-jest', { presets: ['next/babel'] }],
	},
	moduleNameMapper: {
		'\\.(css|less|scss|sass)$': 'identity-obj-proxy',
		'\\.(jpg|jpeg|png|gif|svg)$': '<rootDir>/../__mocks__/fileMock.js',
	},
	testTimeout: 30000,
};
