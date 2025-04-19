import '@testing-library/jest-dom';

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
			};
		};

	// localStorage 모킹
	if (!window.localStorage) {
		Object.defineProperty(window, 'localStorage', {
			value: {
				getItem: jest.fn(),
				setItem: jest.fn(),
				removeItem: jest.fn(),
				clear: jest.fn(),
			},
			writable: true,
		});
	}

	// sessionStorage 모킹
	if (!window.sessionStorage) {
		Object.defineProperty(window, 'sessionStorage', {
			value: {
				getItem: jest.fn(),
				setItem: jest.fn(),
				removeItem: jest.fn(),
				clear: jest.fn(),
			},
			writable: true,
		});
	}
}

// Array.prototype.unique 확장 메서드 추가 (arrayUtils.test.js를 위함)
if (!Array.prototype.unique) {
	Array.prototype.unique = function () {
		return [...new Set(this)];
	};
}
