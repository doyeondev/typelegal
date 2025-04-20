/**
 * Jest 환경 설정 파일
 * 프론트엔드 테스트를 위한 설정입니다.
 */
module.exports = {
	// 테스트 환경을 jsdom으로 설정 (브라우저 환경 에뮬레이션)
	testEnvironment: 'jsdom',

	// CSS, 이미지 등의 정적 파일 처리를 위한 매핑
	moduleNameMapper: {
		// CSS 파일은 빈 객체를 반환하는 모듈로 모킹
		'\\.(css|less|scss|sass)$': 'identity-obj-proxy',
		// 이미지, 폰트 등의 파일은 파일명 문자열을 반환하는 모듈로 모킹
		'\\.(jpg|jpeg|png|gif|eot|otf|webp|svg|ttf|woff|woff2|mp4|webm|wav|mp3|m4a|aac|oga)$': '<rootDir>/__mocks__/fileMock.js',
	},

	// 테스트 전에 설정 파일 로드
	setupFilesAfterEnv: ['<rootDir>/jest.setup.js'],

	// node_modules와 .next 디렉토리는 테스트 대상에서 제외
	testPathIgnorePatterns: [
		'<rootDir>/node_modules/',
		'<rootDir>/.next/',
		'<rootDir>/tests/playwright/', // Playwright 테스트는 제외
		'<rootDir>/tests/e2e/', // E2E 테스트 디렉토리 제외
		'<rootDir>/frontend/tests/e2e/', // 프론트엔드 E2E 테스트 제외
		'<rootDir>/backend/tests/e2e/', // 백엔드 E2E 테스트 제외
	],

	// JS/JSX/TS/TSX 파일은 Babel을 사용하여 변환
	transform: {
		'^.+\\.(js|jsx|ts|tsx)$': ['babel-jest', { presets: ['next/babel'] }],
	},

	// 변환하지 않을 패턴 지정
	transformIgnorePatterns: ['/node_modules/', '^.+\\.module\\.(css|sass|scss)$'],

	// 모듈 파일 확장자 해석 순서
	moduleFileExtensions: ['js', 'jsx', 'ts', 'tsx', 'json', 'node'],

	// 테스트 커버리지 설정
	collectCoverageFrom: ['frontend/**/*.{js,jsx,ts,tsx}', '!**/node_modules/**', '!**/.next/**', '!**/coverage/**'],

	// Jest가 모듈을 찾을 디렉토리 설정
	moduleDirectories: ['node_modules', '<rootDir>'],

	// 테스트 타임아웃 설정 (10초)
	testTimeout: 10000,
};
