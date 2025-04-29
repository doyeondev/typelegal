/**
 * Jest 테스트 환경 셋업 파일
 * 모킹과 글로벌 설정을 정의합니다.
 */
import '@testing-library/jest-dom';
import 'whatwg-fetch'; // fetch API 폴리필

// 콘솔 경고 무시 설정
const originalConsoleError = console.error;
const originalConsoleWarn = console.warn;

console.error = (...args) => {
	if (typeof args[0] === 'string' && (args[0].includes('React does not recognize the') || args[0].includes('Warning: An update to') || args[0].includes('Warning: Failed prop type'))) {
		return;
	}
	originalConsoleError(...args);
};

console.warn = (...args) => {
	if (typeof args[0] === 'string' && (args[0].includes('React does not recognize the') || args[0].includes('Warning: An update to'))) {
		return;
	}
	originalConsoleWarn(...args);
};

// 브라우저 환경 모킹
if (typeof window !== 'undefined') {
	// 브라우저 API 모킹
	window.matchMedia =
		window.matchMedia ||
		function () {
			return {
				matches: false,
				addListener: function () {},
				removeListener: function () {},
				addEventListener: function () {},
				removeEventListener: function () {},
				dispatchEvent: function () {
					return true;
				},
			};
		};

	// IntersectionObserver 모킹
	class MockIntersectionObserver {
		constructor(callback) {
			this.callback = callback;
		}
		observe = jest.fn();
		unobserve = jest.fn();
		disconnect = jest.fn();
	}

	window.IntersectionObserver = MockIntersectionObserver;

	// localStorage 모킹
	if (!window.localStorage) {
		const localStorageMock = (function () {
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
				length: 0,
				key: jest.fn(i => Object.keys(store)[i] || null),
			};
		})();

		Object.defineProperty(window, 'localStorage', {
			value: localStorageMock,
			writable: true,
		});
	}

	// sessionStorage 모킹
	if (!window.sessionStorage) {
		const sessionStorageMock = (function () {
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
				length: 0,
				key: jest.fn(i => Object.keys(store)[i] || null),
			};
		})();

		Object.defineProperty(window, 'sessionStorage', {
			value: sessionStorageMock,
			writable: true,
		});
	}

	// window.URL.createObjectURL 모킹
	if (!window.URL.createObjectURL) {
		Object.defineProperty(window.URL, 'createObjectURL', {
			value: jest.fn(() => 'mock-object-url'),
		});
	}

	// ResizeObserver 모킹
	window.ResizeObserver = class ResizeObserver {
		observe = jest.fn();
		unobserve = jest.fn();
		disconnect = jest.fn();
	};
}

// Fetch API 모킹
global.fetch = jest.fn(() =>
	Promise.resolve({
		json: () => Promise.resolve({}),
		text: () => Promise.resolve(''),
		ok: true,
		status: 200,
		headers: {
			get: () => null,
		},
	})
);

// Array.prototype.unique 확장 메서드 추가 (arrayUtils.test.js를 위함)
if (!Array.prototype.unique) {
	Array.prototype.unique = function () {
		return [...new Set(this)];
	};
}

// 테스트 후 모든 모킹 초기화
afterEach(() => {
	jest.clearAllMocks();
});
