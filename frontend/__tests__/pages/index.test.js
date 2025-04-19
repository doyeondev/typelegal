import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import Home from '../../pages/index';

// Next.js 모듈 모킹
jest.mock('next/image', () => ({
	__esModule: true,
	default: props => {
		// eslint-disable-next-line jsx-a11y/alt-text
		return <img {...props} data-testid={`image-${props.alt}`} />;
	},
}));

jest.mock('next/head', () => ({
	__esModule: true,
	default: ({ children }) => <div data-testid="mock-head">{children}</div>,
}));

jest.mock('next/font/google', () => ({
	Inter: () => ({ className: 'mock-inter' }),
}));

jest.mock('../../components/Layout', () => {
	return function MockLayout({ children }) {
		return <div data-testid="mock-layout">{children}</div>;
	};
});

jest.mock('../../components/modals/LoginModal', () => {
	return function MockLoginModal({ loginModalOpen, setLoginModalOpen }) {
		return <div data-testid="mock-login-modal">로그인 모달</div>;
	};
});

jest.mock('next/link', () => {
	return function MockLink({ children, href }) {
		return (
			<a data-testid={`link-to-${href}`} href={href}>
				{children}
			</a>
		);
	};
});

// sessionStorage 모킹
const sessionStorageMock = (() => {
	let store = {};
	return {
		getItem: jest.fn(key => store[key] || null),
		setItem: jest.fn((key, value) => {
			store[key] = value;
		}),
		removeItem: jest.fn(key => {
			delete store[key];
		}),
		clear: jest.fn(() => {
			store = {};
		}),
	};
})();

Object.defineProperty(window, 'sessionStorage', { value: sessionStorageMock });

describe('홈 페이지', () => {
	beforeEach(() => {
		// 각 테스트 전에 모든 모의 함수 초기화
		jest.clearAllMocks();
		sessionStorageMock.getItem.mockReturnValue(null);
	});

	test('홈 페이지가 올바르게 렌더링되어야 한다', () => {
		render(<Home />);

		// 레이아웃 컴포넌트가 사용되었는지 확인
		expect(screen.getByTestId('mock-layout')).toBeInTheDocument();

		// 페이지 제목이 올바르게 표시되는지 확인
		expect(screen.getByText('계약서를 가장 쉽게 작성하는 방법')).toBeInTheDocument();

		// 서브 텍스트가 올바르게 표시되는지 확인
		expect(screen.getByText('프리랜서 디자이너를 위해 만들었어요')).toBeInTheDocument();
		expect(screen.getByText('때로는 어렵고, 때로는 귀찮은 계약서 작성')).toBeInTheDocument();
		expect(screen.getByText('타입리걸은 안전한 계약문화를 지향해요')).toBeInTheDocument();

		// 주요 이미지가 렌더링되었는지 확인
		expect(screen.getByTestId('image-타입리걸 서비스 UI')).toBeInTheDocument();

		// CTA 버튼이 표시되는지 확인
		expect(screen.getByText('작성 시작하기')).toBeInTheDocument();
		expect(screen.getByText('계약서 작성하기')).toBeInTheDocument();
	});

	test('특징 목록이 올바르게 표시되어야 한다', () => {
		render(<Home />);

		// 특징 섹션 제목이 표시되는지 확인
		expect(screen.getByText('계약서 작성이 얼마나 쉬워졌는지 직접 확인해 보세요!')).toBeInTheDocument();

		// 각 특징이 올바르게 표시되는지 확인
		expect(screen.getByText(/회원가입 이후 서비스/)).toBeInTheDocument();
		expect(screen.getByText(/무료 이용/)).toBeInTheDocument();
		expect(screen.getByText(/계정 생성 시 문서 관리/)).toBeInTheDocument();
		expect(screen.getByText(/대시보드 제공/)).toBeInTheDocument();
		expect(screen.getByText(/간단한 설문을 통해 원본/)).toBeInTheDocument();
		expect(screen.getByText(/파일 다운로드/)).toBeInTheDocument();
	});

	test('draft 페이지로 이동하는 링크가 올바르게 작동해야 한다', () => {
		render(<Home />);

		// '작성 시작하기' 링크 확인
		const links = screen.getAllByTestId('link-to-/draft');
		const startLink = links[0];
		expect(startLink).toBeInTheDocument();
		expect(startLink).toHaveAttribute('href', '/draft');

		// '계약서 작성하기' 링크 확인
		const writeLink = links[1];
		expect(writeLink).toBeInTheDocument();
		expect(writeLink).toHaveAttribute('href', '/draft');
	});

	test('페이지 로드 시 item_key 세션이 있다면 제거해야 한다', () => {
		// item_key 세션이 있는 상태로 설정
		sessionStorageMock.getItem.mockReturnValue('some-contract-key');

		render(<Home />);

		// useEffect가 실행되고 sessionStorage.removeItem이 호출되었는지 확인
		expect(sessionStorageMock.getItem).toHaveBeenCalledWith('item_key');
		expect(sessionStorageMock.removeItem).toHaveBeenCalledWith('item_key');
	});

	test('페이지 로드 시 item_key 세션이 없다면 removeItem이 호출되지 않아야 한다', () => {
		// item_key 세션이 없는 상태로 설정
		sessionStorageMock.getItem.mockReturnValue(null);

		render(<Home />);

		// sessionStorage.getItem은 호출되었지만 removeItem은 호출되지 않았는지 확인
		expect(sessionStorageMock.getItem).toHaveBeenCalledWith('item_key');
		expect(sessionStorageMock.removeItem).not.toHaveBeenCalled();
	});
});
