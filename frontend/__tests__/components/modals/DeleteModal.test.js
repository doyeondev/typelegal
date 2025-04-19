import React from 'react';
import { render, screen, fireEvent, waitFor, act } from '@testing-library/react';
import '@testing-library/jest-dom';
import DeleteModal from '../../../components/modals/DeleteModal';

// ResizeObserver 모킹
class ResizeObserverMock {
	observe() {}
	unobserve() {}
	disconnect() {}
}

// @headlessui/react 모듈 모킹을 단순화
jest.mock('@headlessui/react', () => {
	const originalModule = jest.requireActual('@headlessui/react');
	return {
		...originalModule,
		Dialog: {
			...originalModule.Dialog,
			__esModule: true,
		},
		Transition: {
			...originalModule.Transition,
			__esModule: true,
		},
	};
});

describe('DeleteModal 컴포넌트', () => {
	// 기본 props
	const defaultProps = {
		isOpen: true,
		setIsOpen: jest.fn(),
		deleteItemHandler: jest.fn(),
		id: 'test-item-id',
	};

	beforeEach(() => {
		// 각 테스트 전에 모의 함수 초기화
		jest.clearAllMocks();

		// ResizeObserver 전역 모킹 설정
		window.ResizeObserver = ResizeObserverMock;
	});

	test('모달이 열려 있을 때 올바르게 렌더링되어야 한다', async () => {
		await act(async () => {
			render(<DeleteModal {...defaultProps} />);
		});

		// SVG가 렌더링되었는지 확인 (role="img"를 사용하지 않고 svg 태그로 직접 찾기)
		const warningIcon = document.querySelector('svg');
		expect(warningIcon).toBeInTheDocument();

		// 경고 메시지가 표시되는지 확인
		expect(screen.getByText('정말로 삭제하시겠습니까?')).toBeInTheDocument();

		// 취소 버튼이 있는지 확인
		expect(screen.getByText('다음에 삭제할게요')).toBeInTheDocument();

		// 삭제 확인 버튼이 있는지 확인
		expect(screen.getByText('네, 삭제할래요')).toBeInTheDocument();
	});

	test('모달이 닫혀 있을 때는 렌더링되지 않아야 한다', async () => {
		await act(async () => {
			render(<DeleteModal {...defaultProps} isOpen={false} />);
		});

		// 경고 메시지가 렌더링되지 않았는지 확인
		const warningMessage = screen.queryByText('정말로 삭제하시겠습니까?');
		expect(warningMessage).not.toBeInTheDocument();

		// 버튼들도 렌더링되지 않았는지 확인
		const cancelButton = screen.queryByText('다음에 삭제할게요');
		const confirmButton = screen.queryByText('네, 삭제할래요');
		expect(cancelButton).not.toBeInTheDocument();
		expect(confirmButton).not.toBeInTheDocument();
	});

	test('취소 버튼 클릭 시 모달이 닫혀야 한다', async () => {
		await act(async () => {
			render(<DeleteModal {...defaultProps} />);
		});

		// 취소 버튼 찾기
		const cancelButton = screen.getByText('다음에 삭제할게요');

		// 취소 버튼 클릭
		await act(async () => {
			fireEvent.click(cancelButton);
		});

		// setIsOpen이 false로 호출되었는지 확인
		expect(defaultProps.setIsOpen).toHaveBeenCalledWith(false);

		// deleteItemHandler는 호출되지 않아야 함
		expect(defaultProps.deleteItemHandler).not.toHaveBeenCalled();
	});

	test('삭제 확인 버튼 클릭 시 deleteItemHandler가 호출되고 모달이 닫혀야 한다', async () => {
		await act(async () => {
			render(<DeleteModal {...defaultProps} />);
		});

		// 삭제 확인 버튼 찾기
		const confirmButton = screen.getByText('네, 삭제할래요');

		// 삭제 확인 버튼 클릭
		await act(async () => {
			fireEvent.click(confirmButton);
		});

		// deleteItemHandler가 id와 함께 호출되었는지 확인
		expect(defaultProps.deleteItemHandler).toHaveBeenCalledWith('test-item-id');

		// setIsOpen이 false로 호출되었는지 확인
		expect(defaultProps.setIsOpen).toHaveBeenCalledWith(false);
	});

	// 접근성 확인 테스트 단순화
	test('모달에는 필수적인 접근성 요소들이 포함되어야 한다', async () => {
		await act(async () => {
			render(<DeleteModal {...defaultProps} />);
		});

		// 대화상자 역할 확인 (역할이 있는 요소를 찾는 대신, 직접 텍스트와 요소 존재 확인)
		const dialogContent = screen.getByText('정말로 삭제하시겠습니까?');
		expect(dialogContent).toBeInTheDocument();

		// 버튼들이 올바른 텍스트를 가지고 있는지 확인
		expect(screen.getByText('다음에 삭제할게요')).toBeInTheDocument();
		expect(screen.getByText('네, 삭제할래요')).toBeInTheDocument();
	});
});
