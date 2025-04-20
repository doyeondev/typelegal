/**
 * Jest 테스트 셋업 파일
 * 모든 테스트 실행 전에 로드됩니다.
 */

// Testing Library의 DOM 확장 기능 추가
import '@testing-library/jest-dom';

// JSDOM이 제대로 작동하도록 document 객체 수정
document.addEventListener = jest.fn();
document.removeEventListener = jest.fn();
// 실제 body 요소 생성 (React 18 createRoot 관련 이슈 해결)
if (!document.body) {
	document.body = document.createElement('body');
}
// document.body addEventListener 명시적 구현
document.body.addEventListener = jest.fn();
document.body.removeEventListener = jest.fn();

// React 18 createRoot 문제 해결을 위한 모킹
// jest.mock() 내에서 전역 변수 참조 문제를 해결하기 위해 mockFn 변수 사용
const mockRender = jest.fn();
const mockUnmount = jest.fn();

jest.mock('react-dom/client', () => ({
	createRoot: () => ({
		render: mockRender,
		unmount: mockUnmount,
	}),
}));

// Testing Library의 render 함수를 모킹
const mockContainer = document.createElement('div');
jest.mock('@testing-library/react', () => {
	const originalModule = jest.requireActual('@testing-library/react');

	return {
		__esModule: true,
		...originalModule,
		render: (ui, options = {}) => {
			return originalModule.render(ui, {
				container: mockContainer,
				...options,
			});
		},
	};
});

// 전역 window 객체 모킹
Object.defineProperty(global, 'window', {
	value: {
		// location 객체
		location: {
			assign: jest.fn(),
			pathname: '/',
			href: 'http://localhost:3000',
			search: '',
			hash: '',
		},

		// localStorage 객체
		localStorage: {
			getItem: jest.fn(),
			setItem: jest.fn(),
			removeItem: jest.fn(),
			clear: jest.fn(),
		},

		// sessionStorage 객체
		sessionStorage: {
			getItem: jest.fn(),
			setItem: jest.fn(),
			removeItem: jest.fn(),
			clear: jest.fn(),
		},

		// ResizeObserver 객체
		ResizeObserver: jest.fn().mockImplementation(() => ({
			observe: jest.fn(),
			unobserve: jest.fn(),
			disconnect: jest.fn(),
		})),

		// history 객체
		history: {
			go: jest.fn(),
			back: jest.fn(),
			forward: jest.fn(),
			pushState: jest.fn(),
		},

		// scroll 관련 메서드
		scrollTo: jest.fn(),
		scrollBy: jest.fn(),

		// events
		addEventListener: jest.fn(),
		removeEventListener: jest.fn(),
		dispatchEvent: jest.fn(),

		// document 객체
		document: {
			...global.document,
			addEventListener: jest.fn(),
			removeEventListener: jest.fn(),
			createElement: jest.fn().mockImplementation(tag => ({
				tagName: tag.toUpperCase(),
				setAttribute: jest.fn(),
				getAttribute: jest.fn(),
				classList: {
					add: jest.fn(),
					remove: jest.fn(),
					contains: jest.fn(),
				},
				style: {},
				children: [],
				appendChild: jest.fn(),
			})),
			body: {
				appendChild: jest.fn(),
				removeChild: jest.fn(),
				classList: {
					add: jest.fn(),
					remove: jest.fn(),
					contains: jest.fn(),
				},
				addEventListener: jest.fn(),
				removeEventListener: jest.fn(),
			},
			documentElement: {
				scrollHeight: 100,
				clientHeight: 100,
			},
		},

		// 기타 이벤트 핸들러
		onbeforeunload: null,
		onload: null,
	},
	writable: true,
});

// 전역 navigator 객체 모킹
Object.defineProperty(global, 'navigator', {
	value: {
		userAgent: 'jest-test-environment',
		language: 'ko-KR',
		msSaveOrOpenBlob: jest.fn(),
		clipboard: {
			writeText: jest.fn().mockImplementation(() => Promise.resolve()),
		},
	},
	writable: true,
});

// document 객체 확장
Object.defineProperty(global, 'document', {
	value: {
		...global.document,
		querySelectorAll: jest.fn(),
		querySelector: jest.fn(),
		addEventListener: jest.fn(),
		removeEventListener: jest.fn(),
		documentElement: {
			scrollHeight: 100,
			clientHeight: 100,
		},
		createElement: jest.fn().mockImplementation(tag => ({
			tagName: tag.toUpperCase(),
			setAttribute: jest.fn(),
			getAttribute: jest.fn(),
			classList: {
				add: jest.fn(),
				remove: jest.fn(),
				contains: jest.fn(),
			},
			style: {},
			children: [],
			appendChild: jest.fn(),
		})),
		body: {
			appendChild: jest.fn(),
			removeChild: jest.fn(),
			addEventListener: jest.fn(),
			removeEventListener: jest.fn(),
		},
	},
	writable: true,
});

// fetch API 모킹
global.fetch = jest.fn();

// matchMedia 모킹
Object.defineProperty(global, 'matchMedia', {
	value: jest.fn(() => ({
		matches: false,
		addListener: jest.fn(),
		removeListener: jest.fn(),
		addEventListener: jest.fn(),
		removeEventListener: jest.fn(),
		dispatchEvent: jest.fn(),
	})),
	writable: true,
});

// console 관련 모킹
global.console = {
	...global.console,
	error: jest.fn(),
	warn: jest.fn(),
	log: jest.fn(),
};
