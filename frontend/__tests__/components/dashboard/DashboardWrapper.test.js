import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import DashboardWrapper from '../../../components/dashboard/DashboardWrapper';
import { DashboardHeader, DashboardBody, DashboardFooter } from '../../../components/dashboard/DashboardTable';

// uuid 모킹
jest.mock('uuid', () => ({
	v4: () => 'mock-uuid',
}));

// 서브 컴포넌트 모킹
jest.mock('../../../components/dashboard/DashboardTable', () => ({
	DashboardHeader: jest.fn(() => <thead data-testid="mock-header"></thead>),
	DashboardBody: jest.fn(() => <tbody data-testid="mock-body"></tbody>),
	DashboardFooter: jest.fn(() => <div data-testid="mock-footer"></div>),
}));

// Next.js Link 모킹
jest.mock('next/link', () => {
	return function MockLink({ children, href, onClick }) {
		return (
			<a data-testid={`link-to-${href}`} href={href} onClick={onClick}>
				{children}
			</a>
		);
	};
});

// DeleteModal 모킹
jest.mock('../../../components/modals/DeleteModal', () => {
	return function MockDeleteModal(props) {
		return <div data-testid="mock-delete-modal"></div>;
	};
});

describe('DashboardWrapper 컴포넌트', () => {
	// 테스트 props
	const mockProps = {
		dataList: [
			{
				id: 'doc1',
				contract_title: '로고 디자인 계약서',
				type: '디자인 계약',
				status: 'draft',
				progress: '50%',
				updated_at: '2023-04-17T06:47:00.000Z',
				query: 'logo',
			},
			{
				id: 'doc2',
				contract_title: '웹사이트 디자인 계약서',
				type: '디자인 계약',
				status: 'completed',
				progress: '100%',
				updated_at: '2023-04-17T15:48:00.000Z',
				query: 'web',
			},
		],
		currentIndex: 0,
		maxIndex: 2,
		onClickHandler: jest.fn(),
		deleteItemHandler: jest.fn(),
	};

	beforeEach(() => {
		jest.clearAllMocks();
	});

	test('최근 활동 섹션 제목이 올바르게 표시되어야 한다', () => {
		render(<DashboardWrapper {...mockProps} />);

		// 섹션 제목이 표시되는지 확인
		expect(screen.getByText('최근 활동')).toBeInTheDocument();
	});

	test('DashboardHeader 컴포넌트가 렌더링되어야 한다', () => {
		render(<DashboardWrapper {...mockProps} />);

		// DashboardHeader가 호출되었는지 확인
		expect(DashboardHeader).toHaveBeenCalled();
		expect(screen.getByTestId('mock-header')).toBeInTheDocument();
	});

	test('데이터 항목 수만큼 DashboardBody 컴포넌트가 렌더링되어야 한다', () => {
		render(<DashboardWrapper {...mockProps} />);

		// 데이터 항목 수만큼 DashboardBody가 호출되었는지 확인
		expect(DashboardBody).toHaveBeenCalledTimes(2);
		expect(DashboardBody).toHaveBeenCalledWith(
			expect.objectContaining({
				dataItem: mockProps.dataList[0],
				deleteItemHandler: mockProps.deleteItemHandler,
			}),
			expect.anything()
		);

		// 모든 바디 요소가 렌더링되었는지 확인
		const bodyElements = screen.getAllByTestId('mock-body');
		expect(bodyElements.length).toBe(2);
	});

	test('DashboardFooter 컴포넌트가 올바른 props와 함께 렌더링되어야 한다', () => {
		render(<DashboardWrapper {...mockProps} />);

		// DashboardFooter가 호출되었는지 확인
		expect(DashboardFooter).toHaveBeenCalledWith(
			expect.objectContaining({
				onClickHandler: mockProps.onClickHandler,
				currentIndex: mockProps.currentIndex,
				maxIndex: mockProps.maxIndex,
			}),
			expect.anything()
		);

		// 푸터가 렌더링되었는지 확인
		expect(screen.getByTestId('mock-footer')).toBeInTheDocument();
	});

	test('테이블이 적절한 레이아웃으로 렌더링되어야 한다', () => {
		const { container } = render(<DashboardWrapper {...mockProps} />);

		// 테이블 요소가 있는지 확인
		const table = container.querySelector('table');
		expect(table).toBeInTheDocument();

		// 테이블에 적절한 클래스가 적용되었는지 확인
		expect(table).toHaveClass('w-[100%]');
		expect(table).toHaveClass('divide-y');
	});
});
