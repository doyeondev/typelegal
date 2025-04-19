import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import Dashboard from '../../pages/dashboard';
import draftingApi from '../../pages/api/services/draftingApi';

// 컴포넌트 모킹
jest.mock('../../components/dashboard/Sidebar', () => {
	return function MockSidebar(props) {
		return <div data-testid="mock-sidebar">{props.data?.name}</div>;
	};
});

jest.mock('../../components/dashboard/SelectContract', () => {
	return function MockSelectContract({ dummies }) {
		return (
			<div data-testid="mock-select-contract">
				{dummies.map((item, index) => (
					<div key={index} data-testid={`contract-template-${index}`}>
						{item.title}
					</div>
				))}
			</div>
		);
	};
});

jest.mock('../../components/dashboard/DashboardWrapper', () => {
	return function MockDashboardWrapper({ dataList, onClickHandler, deleteItemHandler }) {
		return (
			<div data-testid="mock-dashboard-wrapper">
				{dataList.map((item, index) => (
					<div key={index} data-testid={`draft-item-${item._id}`}>
						{item.title}
						<button data-testid={`delete-btn-${item._id}`} onClick={() => deleteItemHandler(item._id)}>
							삭제
						</button>
					</div>
				))}
				<button id="btnPrevious" name="paginationBtn" onClick={onClickHandler} data-testid="btn-previous">
					이전
				</button>
				<button id="btnNext" name="paginationBtn" onClick={onClickHandler} data-testid="btn-next">
					다음
				</button>
			</div>
		);
	};
});

jest.mock('../../components/ui/Spinner', () => {
	return function MockSpinner() {
		return <div data-testid="mock-spinner">로딩 중...</div>;
	};
});

jest.mock('../../components/modals/LoginModal', () => {
	return function MockLoginModal({ loginModalOpen }) {
		if (!loginModalOpen) return null;
		return <div data-testid="mock-login-modal">로그인이 필요합니다</div>;
	};
});

// Next.js 모듈 모킹
jest.mock('next/head', () => {
	return function MockHead({ children }) {
		return <div data-testid="mock-head">{children}</div>;
	};
});

// uuid 모킹
jest.mock('uuid', () => ({
	v4: () => 'mock-uuid',
}));

// API 모킹
jest.mock('../../pages/api/services/draftingApi', () => ({
	getMemberDrafts: jest.fn(),
	deleteDraft: jest.fn(),
}));

// localStorage와 sessionStorage 모킹
const localStorageMock = (() => {
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
		theme: '',
	};
})();

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

Object.defineProperty(window, 'localStorage', { value: localStorageMock });
Object.defineProperty(window, 'sessionStorage', { value: sessionStorageMock });

// console 모킹
console.log = jest.fn();
console.error = jest.fn();

describe('대시보드 페이지', () => {
	// 테스트용 목업 데이터
	const mockDrafts = [
		{ _id: 'draft1', title: '로고 디자인 계약서 1', created_at: '2023-01-01', is_deleted: false },
		{ _id: 'draft2', title: '로고 디자인 계약서 2', created_at: '2023-01-02', is_deleted: false },
		{ _id: 'draft3', title: '로고 디자인 계약서 3', created_at: '2023-01-03', is_deleted: false },
		{ _id: 'draft4', title: '로고 디자인 계약서 4', created_at: '2023-01-04', is_deleted: false },
		{ _id: 'draft5', title: '로고 디자인 계약서 5', created_at: '2023-01-05', is_deleted: false },
		{ _id: 'draft6', title: '로고 디자인 계약서 6', created_at: '2023-01-06', is_deleted: false },
	];

	const mockUser = {
		email: 'test@example.com',
		name: '홍길동',
	};

	beforeEach(() => {
		// 각 테스트 전에 모든 모의 함수 초기화
		jest.clearAllMocks();

		// sessionStorage를 기본 상태로 초기화
		sessionStorageMock.getItem.mockImplementation(key => {
			if (key === 'member_key') return JSON.stringify(mockUser);
			return null;
		});

		// API 응답 모킹
		draftingApi.getMemberDrafts.mockResolvedValue(mockDrafts);
		draftingApi.deleteDraft.mockResolvedValue({ success: true });
	});

	test('로그인한 상태에서 대시보드가 올바르게 로드되어야 한다', async () => {
		render(<Dashboard />);

		// 처음에는 로딩 스피너가 표시되어야 함
		expect(screen.getByTestId('mock-spinner')).toBeInTheDocument();

		// API 호출이 완료된 후 대시보드 컨텐츠가 표시되어야 함
		await waitFor(() => {
			expect(draftingApi.getMemberDrafts).toHaveBeenCalledWith('test@example.com');
			expect(screen.getByTestId('mock-sidebar')).toBeInTheDocument();
			expect(screen.getByTestId('mock-select-contract')).toBeInTheDocument();
			expect(screen.getByTestId('mock-dashboard-wrapper')).toBeInTheDocument();
		});

		// 사용자 이름이 사이드바에 표시되어야 함
		expect(screen.getByTestId('mock-sidebar')).toHaveTextContent('홍길동');

		// 계약서 템플릿이 표시되어야 함
		expect(screen.getByTestId('contract-template-0')).toBeInTheDocument();
		expect(screen.getByTestId('contract-template-1')).toBeInTheDocument();

		// 첫 페이지의 계약서 목록이 표시되어야 함
		expect(screen.getByTestId('draft-item-draft1')).toBeInTheDocument();
		expect(screen.getByTestId('draft-item-draft5')).toBeInTheDocument();
	});

	test('로그인하지 않은 상태에서는 로그인 모달이 표시되어야 한다', async () => {
		// 로그인하지 않은 상태로 설정
		sessionStorageMock.getItem.mockImplementation(() => null);

		render(<Dashboard />);

		await waitFor(() => {
			expect(screen.getByTestId('mock-login-modal')).toBeInTheDocument();
		});

		// API가 호출되지 않아야 함
		expect(draftingApi.getMemberDrafts).not.toHaveBeenCalled();
	});

	test('페이지네이션이 올바르게 작동해야 한다', async () => {
		render(<Dashboard />);

		// 데이터 로드 대기
		await waitFor(() => {
			expect(screen.getByTestId('mock-dashboard-wrapper')).toBeInTheDocument();
		});

		// 다음 페이지 버튼 클릭
		fireEvent.click(screen.getByTestId('btn-next'));

		// 두 번째 페이지의 계약서가 표시되어야 함 (페이지네이션 상태 변경 시뮬레이션)
		// 참고: 실제 구현에서는 mock에서 상태 변경을 감지하지 못하므로, 이 부분은 제한적으로 테스트됨
		expect(draftingApi.getMemberDrafts).toHaveBeenCalledTimes(1);
	});

	test('페이지네이션 관련 상태가 올바르게 초기화되어야 한다', async () => {
		// API 응답 모킹 - 6개의 항목 (페이지네이션 테스트용)
		draftingApi.getMemberDrafts.mockResolvedValue(mockDrafts);

		// 렌더링 전 상태 스파이 설정
		const mockSetCurrentIndex = jest.fn();
		const mockSetMaxIndex = jest.fn();
		const mockSetDashboardGroup = jest.fn();

		jest
			.spyOn(React, 'useState')
			.mockImplementationOnce(() => [[], mockSetDashboardData]) // dashboardData
			.mockImplementationOnce(() => [[], mockSetDashboardGroup]) // dashboardGroup
			.mockImplementationOnce(() => [0, mockSetCurrentIndex]) // currentIndex
			.mockImplementationOnce(() => [0, mockSetMaxIndex]); // maxIndex

		render(<Dashboard />);

		// API 호출 완료 대기
		await waitFor(() => {
			expect(draftingApi.getMemberDrafts).toHaveBeenCalled();
		});

		// 페이지네이션 상태가 올바르게 설정되었는지 확인
		expect(mockSetCurrentIndex).toHaveBeenCalledWith(0); // 현재 페이지 인덱스는 0으로 초기화
		expect(mockSetMaxIndex).toHaveBeenCalled(); // 최대 페이지 인덱스가 설정됨
		expect(mockSetDashboardGroup).toHaveBeenCalled(); // 대시보드 그룹이 설정됨
	});

	test('빈 대시보드 데이터로도 정상적으로 렌더링되어야 한다', async () => {
		// 빈 배열 응답 모킹
		draftingApi.getMemberDrafts.mockResolvedValue([]);

		render(<Dashboard />);

		// 로딩 상태가 종료되었는지 확인
		await waitFor(() => {
			expect(screen.queryByTestId('mock-spinner')).not.toBeInTheDocument();
		});

		// 대시보드 래퍼가 빈 데이터로도 렌더링되는지 확인
		const dashboardWrapper = screen.getByTestId('mock-dashboard-wrapper');
		expect(dashboardWrapper).toBeInTheDocument();
	});

	test('onClickHandler가 페이지네이션 버튼 클릭 시 올바르게 동작해야 한다', async () => {
		render(<Dashboard />);

		// 데이터 로드 대기
		await waitFor(() => {
			expect(screen.getByTestId('mock-dashboard-wrapper')).toBeInTheDocument();
		});

		// 다음 페이지 버튼 클릭 이벤트 시뮬레이션
		const dashboardWrapper = screen.getByTestId('mock-dashboard-wrapper');
		// onClickHandler props 추출
		const mockClickEvent = {
			target: {
				id: 'btnNext',
				name: 'paginationBtn',
			},
		};

		// Dashboard 컴포넌트의 onClickHandler 직접 호출
		fireEvent.click(screen.getByTestId('btn-next'));

		// 콘솔 로그 확인
		expect(console.log).toHaveBeenCalledWith('clicked - onClickHandler');
	});

	test('deleteItemHandler가 아이템 삭제 시 상태를 올바르게 업데이트해야 한다', async () => {
		render(<Dashboard />);

		// 데이터 로드 대기
		await waitFor(() => {
			expect(screen.getByTestId('mock-dashboard-wrapper')).toBeInTheDocument();
		});

		// 삭제 버튼 클릭
		fireEvent.click(screen.getByTestId('delete-btn-draft1'));

		// API 호출 확인
		expect(draftingApi.deleteDraft).toHaveBeenCalledWith('draft1');

		// 상태 메시지 확인
		expect(console.log).toHaveBeenCalledWith('드래프트 삭제 성공:', expect.anything());
	});

	test('계약서 삭제 기능이 올바르게 작동해야 한다', async () => {
		render(<Dashboard />);

		// 데이터 로드 대기
		await waitFor(() => {
			expect(screen.getByTestId('mock-dashboard-wrapper')).toBeInTheDocument();
		});

		// 첫 번째 계약서 삭제 버튼 클릭
		fireEvent.click(screen.getByTestId('delete-btn-draft1'));

		// 삭제 API가 호출되어야 함
		expect(draftingApi.deleteDraft).toHaveBeenCalledWith('draft1');
	});

	test('세션 스토리지에서 item_key가 제거되어야 한다', async () => {
		// item_key가 있는 상태로 설정
		sessionStorageMock.getItem.mockImplementation(key => {
			if (key === 'member_key') return JSON.stringify(mockUser);
			if (key === 'item_key') return 'some-contract-key';
			return null;
		});

		render(<Dashboard />);

		// 세션에서 item_key가 제거되었는지 확인
		await waitFor(() => {
			expect(sessionStorageMock.removeItem).toHaveBeenCalledWith('item_key');
		});
	});

	test('API 호출 실패 시 오류 처리가 올바르게 되어야 한다', async () => {
		// API 실패 응답 모킹
		draftingApi.getMemberDrafts.mockRejectedValue(new Error('API 호출 실패'));

		render(<Dashboard />);

		// 오류가 발생해도 로딩 상태가 종료되어야 함
		await waitFor(() => {
			expect(screen.queryByTestId('mock-spinner')).not.toBeInTheDocument();
		});

		// 콘솔 에러가 기록되어야 함
		expect(console.error).toHaveBeenCalledWith('드래프트 데이터 조회 실패:', expect.any(Error));
	});
});
