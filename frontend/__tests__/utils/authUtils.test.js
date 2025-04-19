import { resetAuthToken } from '../../utils/authUtils';
import '@testing-library/jest-dom';

// localStorage 모킹 설정
const localStorageMock = (() => {
	let store = {};
	return {
		getItem: jest.fn(key => store[key] || null),
		setItem: jest.fn((key, value) => {
			store[key] = value.toString();
		}),
		removeItem: jest.fn(key => {
			delete store[key];
		}),
		clear: jest.fn(() => {
			store = {};
		}),
	};
})();

Object.defineProperty(window, 'localStorage', { value: localStorageMock });

// 콘솔 로그 모킹
console.log = jest.fn();

describe('authUtils', () => {
	beforeEach(() => {
		localStorageMock.clear();
		jest.clearAllMocks();
	});

	test('토큰이 없을 경우 새 토큰을 생성하고 true를 반환해야 한다', () => {
		// localStorage에 토큰이 없는 상태 설정
		localStorageMock.getItem.mockReturnValueOnce(null);

		// Date.now 모킹
		const originalDateNow = Date.now;
		const mockTimestamp = 1625097600000; // 2021-07-01 00:00:00
		Date.now = jest.fn(() => mockTimestamp);

		try {
			// 함수 실행
			const result = resetAuthToken();

			// 검증
			expect(result).toBe(true);
			expect(localStorageMock.setItem).toHaveBeenCalledWith('auth_token', 'anonymous_token_' + mockTimestamp);
			expect(console.log).toHaveBeenCalledWith('인증 토큰 재설정 시도');
			expect(console.log).toHaveBeenCalledWith('토큰이 없음 - 임시 토큰 발급');
		} finally {
			// Date.now 원상 복구
			Date.now = originalDateNow;
		}
	});

	test('토큰이 이미 존재할 경우 토큰을 변경하지 않고 false를 반환해야 한다', () => {
		// localStorage에 이미 토큰이 있는 상태 설정
		const existingToken = 'existing_token_123';
		localStorageMock.getItem.mockReturnValueOnce(existingToken);

		// 함수 실행
		const result = resetAuthToken();

		// 검증
		expect(result).toBe(false);
		expect(localStorageMock.setItem).not.toHaveBeenCalled();
		expect(console.log).toHaveBeenCalledWith('인증 토큰 재설정 시도');
		expect(console.log).not.toHaveBeenCalledWith('토큰이 없음 - 임시 토큰 발급');
	});
});
