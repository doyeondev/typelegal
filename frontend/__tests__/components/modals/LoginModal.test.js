import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import LoginModal from '../../../components/modals/LoginModal';
import { useRouter } from 'next/router';

// 모의 객체(mock) 생성
jest.mock('next/router', () => ({
	useRouter: jest.fn(),
}));

// LoginItem 컴포넌트 모의
jest.mock('../../../components/LoginItem', () => {
	return {
		__esModule: true,
		default: ({ onLoginSuccess }) => (
			<div data-testid="mock-login-item">
				<div>로그인 폼 컴포넌트</div>
				<button data-testid="simulate-login-success" onClick={() => onLoginSuccess && onLoginSuccess()}>
					로그인 성공 시뮬레이션
				</button>
			</div>
		),
	};
});

// ResizeObserver 모의 구현
class ResizeObserverMock {
	observe() {}
	unobserve() {}
	disconnect() {}
}

describe('LoginModal 컴포넌트', () => {
	let mockSetLoginModalOpen;
	const mockLocationAssign = jest.fn();

	// 테스트 실행 전 설정
	beforeAll(() => {
		// ResizeObserver 글로벌 모의 설정
		global.ResizeObserver = ResizeObserverMock;

		// location.assign 모의 설정
		Object.defineProperty(window, 'location', {
			value: { assign: mockLocationAssign },
			writable: true,
		});
	});

	beforeEach(() => {
		// 모달 상태 변경 함수 모의
		mockSetLoginModalOpen = jest.fn();
		mockLocationAssign.mockClear();
	});

	const defaultProps = {
		loginModalOpen: true,
		setLoginModalOpen: mockSetLoginModalOpen,
		setExportBtnState: jest.fn(),
	};

	test('모달이 열려 있을 때 올바르게 렌더링되어야 한다', () => {
		render(<LoginModal {...defaultProps} />);

		// 모달 대화상자가 렌더링되었는지 확인
		const dialog = screen.getByRole('dialog');
		expect(dialog).toBeInTheDocument();

		// 로그인 폼이 렌더링되었는지 확인
		const loginForm = screen.getByTestId('mock-login-item');
		expect(loginForm).toBeInTheDocument();

		// 닫기 버튼이 있는지 확인 (SVG 아이콘의 부모 요소)
		const closeButton = screen.getByText((content, element) => {
			return element.tagName.toLowerCase() === 'div' && element.classList.contains('cursor-pointer');
		});
		expect(closeButton).toBeInTheDocument();
	});

	test('모달이 닫혀 있을 때는 렌더링되지 않아야 한다', () => {
		render(<LoginModal {...defaultProps} loginModalOpen={false} />);

		// 모달이 존재하지 않는지 확인
		const dialog = screen.queryByRole('dialog');
		expect(dialog).not.toBeInTheDocument();
	});

	test('닫기 버튼 클릭 시 모달이 닫히고 홈페이지로 이동해야 한다', () => {
		render(<LoginModal {...defaultProps} />);

		// 닫기 버튼 찾기 (classname으로 선택)
		const closeButton = screen.getByText((content, element) => {
			return element.tagName.toLowerCase() === 'div' && element.classList.contains('cursor-pointer');
		});

		// 버튼 클릭
		fireEvent.click(closeButton);

		// setLoginModalOpen 함수가 false로 호출되었는지 확인
		expect(mockSetLoginModalOpen).toHaveBeenCalledWith(false);

		// location.assign이 홈페이지 이동으로 호출되었는지 확인
		expect(mockLocationAssign).toHaveBeenCalledWith('/');
	});

	test('Dialog.Overlay 클릭 시 모달이 닫히지 않아야 한다 (onClose 함수 동작 확인)', () => {
		render(<LoginModal {...defaultProps} />);

		// Dialog 컴포넌트 찾기
		const dialog = screen.getByRole('dialog');

		// 오버레이 찾기 (Dialog.Overlay에 해당하는 요소)
		const overlay = dialog.querySelector('.bg-black\\/50');

		// 오버레이 클릭
		fireEvent.click(overlay);

		// closeModal 함수가 호출되어 setLoginModalOpen(true)가 호출되었는지 확인
		expect(mockSetLoginModalOpen).toHaveBeenCalledWith(true);

		// location.assign이 호출되지 않았는지 확인
		expect(mockLocationAssign).not.toHaveBeenCalled();
	});

	test('Dialog.Panel 내부 클릭 시 모달이 닫히지 않아야 한다', () => {
		render(<LoginModal {...defaultProps} />);

		// Dialog.Panel 컴포넌트 찾기 (클래스명으로 선택)
		const panel = screen.getByRole('dialog').querySelector('.bg-white');

		// 패널 클릭
		fireEvent.click(panel);

		// setLoginModalOpen 함수가 호출되지 않았는지 확인
		expect(mockSetLoginModalOpen).not.toHaveBeenCalled();
		expect(mockLocationAssign).not.toHaveBeenCalled();
	});

	test('로그인 성공 시 모달이 닫혀야 한다', async () => {
		render(<LoginModal {...defaultProps} />);

		// 로그인 성공 버튼 찾기
		const loginSuccessButton = screen.getByTestId('simulate-login-success');

		// 버튼 클릭하여 로그인 성공 시뮬레이션
		fireEvent.click(loginSuccessButton);

		// 모달이 닫혀야 함 (setLoginModalOpen(false)가 호출되어야 함)
		await waitFor(() => {
			expect(mockSetLoginModalOpen).toHaveBeenCalledWith(false);
		});
	});

	test('애니메이션 트랜지션이 올바르게 구성되어 있어야 한다', () => {
		const { container } = render(<LoginModal {...defaultProps} />);

		// 트랜지션 컴포넌트 확인
		const transitionRoot = container.querySelector('[data-headlessui-state="open"]');
		expect(transitionRoot).toBeInTheDocument();

		// 트랜지션 설정 확인 (enterFrom, enterTo 클래스 등)
		const dialogPanel = container.querySelector('.bg-white');
		expect(dialogPanel).toHaveClass('transform');
	});

	test('ESC 키 누를 때 모달이 닫히지 않아야 한다', () => {
		render(<LoginModal {...defaultProps} />);

		// ESC 키 이벤트 발생
		fireEvent.keyDown(document, { key: 'Escape', code: 'Escape' });

		// setLoginModalOpen 함수가 호출되지 않았는지 확인
		expect(mockSetLoginModalOpen).not.toHaveBeenCalled();
	});
});
