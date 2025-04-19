import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import SelectContract from '../../../components/dashboard/SelectContract';

// uuid 모킹
jest.mock('uuid', () => ({
	v4: () => 'mock-uuid',
}));

// Next.js 모듈 모킹
jest.mock('next/image', () => ({
	__esModule: true,
	default: props => {
		// eslint-disable-next-line jsx-a11y/alt-text
		return <img data-testid={`image-${props.alt}`} {...props} />;
	},
}));

jest.mock('next/link', () => {
	return function MockLink({ children, href }) {
		return (
			<a data-testid={`link-to-${href}`} href={href}>
				{children}
			</a>
		);
	};
});

/**
 * SelectContract 컴포넌트 테스트
 *
 * 테스트 시나리오:
 * 1. 계약서 작성하기 타이틀 렌더링 검증
 * 2. 계약서 템플릿 링크 활성화/비활성화 검증
 * 3. Coming Soon 메시지 표시 검증
 * 4. 계약서 타이틀 및 이미지 렌더링 검증
 * 5. 템플릿 없을 때 처리 검증
 */
describe('SelectContract 컴포넌트', () => {
	// 테스트용 목업 데이터
	const mockDummies = [
		{
			image: 'image/logo_design2.png',
			title: '로고 디자인',
			title2: '계약서',
			price: '$16.00',
			color: 'bg-[#FDE93A]',
			ready: true,
			url: '/draft/logo',
		},
		{
			image: 'image/logo_design2.png',
			title: '인쇄 · 홍보물',
			title2: '디자인 계약서',
			price: '$17.00',
			color: 'bg-[#01BB73]',
			ready: true,
			url: '/draft/printing',
		},
		{
			image: 'image/logo_design2.png',
			title: '패키지 디자인',
			title2: '계약서',
			price: '$18.00',
			color: 'bg-[#FEDBE8]',
			ready: false,
			url: '/draft/package',
		},
	];

	// 대시보드 데이터 있는 경우
	const mockDashboardData = [
		{ title: '테스트 계약서 1', _id: 'draft1' },
		{ title: '테스트 계약서 2', _id: 'draft2' },
	];

	// 기본 상태 렌더링 테스트
	test('계약서 작성하기 타이틀이 있는 경우 올바르게 렌더링되어야 한다', () => {
		render(<SelectContract dummies={mockDummies} dashboardData={mockDashboardData} />);

		// 타이틀이 표시되는지 확인
		expect(screen.getByText('계약서 작성하기')).toBeInTheDocument();
	});

	test('계약서 작성하기 타이틀이 없는 경우 (dashboardData가 비어있을 때) 타이틀이 보이지 않아야 한다', () => {
		render(<SelectContract dummies={mockDummies} dashboardData={[]} />);

		// 타이틀이 표시되지 않는지 확인
		expect(screen.queryByText('계약서 작성하기')).not.toBeInTheDocument();
	});

	// 링크 활성화 테스트
	test('준비된(ready) 계약서 템플릿은 링크가 활성화되어야 한다', () => {
		render(<SelectContract dummies={mockDummies} dashboardData={mockDashboardData} />);

		// 로고 디자인 계약서 링크 확인
		const logoContractLink = screen.getAllByTestId('link-to-/draft/logo');
		expect(logoContractLink.length).toBeGreaterThan(0);

		// 인쇄·홍보물 디자인 계약서 링크 확인
		const printingContractLink = screen.getAllByTestId('link-to-/draft/printing');
		expect(printingContractLink.length).toBeGreaterThan(0);

		// 패키지 디자인 계약서 링크는 없어야 함 (ready: false)
		const packageContractLink = screen.queryAllByTestId('link-to-/draft/package');
		expect(packageContractLink.length).toBe(0);
	});

	test('준비되지 않은(ready:false) 계약서 템플릿은 Coming Soon 메시지를 표시해야 한다', () => {
		render(<SelectContract dummies={mockDummies} dashboardData={mockDashboardData} />);

		// Coming Soon 메시지가 표시되는지 확인
		expect(screen.getByText('Coming Soon')).toBeInTheDocument();

		// Coming Soon 메시지가 정확히 한 번만 표시되는지 확인
		const comingSoonMessages = screen.getAllByText('Coming Soon');
		expect(comingSoonMessages.length).toBe(1);
	});

	test('템플릿 타이틀이 올바르게 표시되어야 한다', () => {
		render(<SelectContract dummies={mockDummies} dashboardData={mockDashboardData} />);

		// 각 템플릿의 타이틀이 표시되는지 확인
		expect(screen.getByText('로고 디자인')).toBeInTheDocument();
		expect(screen.getByText('인쇄 · 홍보물')).toBeInTheDocument();
		expect(screen.getByText('패키지 디자인')).toBeInTheDocument();

		// 부제목(title2)이 표시되는지 확인
		expect(screen.getAllByText('계약서').length).toBeGreaterThan(1); // 여러 개의 '계약서' 텍스트 확인
		expect(screen.getByText('디자인 계약서')).toBeInTheDocument(); // 인쇄·홍보물 디자인 계약서의 부제목
	});

	test('로고 이미지가 올바르게 표시되어야 한다', () => {
		render(<SelectContract dummies={mockDummies} dashboardData={mockDashboardData} />);

		// 타입리걸 로고 이미지 확인
		const logoImages = screen.getAllByTestId('image-타입리걸');
		expect(logoImages.length).toBe(2); // ready:true인 템플릿마다 하나씩 (2개)

		// 각 템플릿 이미지 확인
		expect(screen.getByTestId('image-로고 디자인 계약서')).toBeInTheDocument();
		expect(screen.getByTestId('image-인쇄 · 홍보물 디자인 계약서')).toBeInTheDocument();
		expect(screen.getByTestId('image-패키지 디자인 계약서')).toBeInTheDocument();
	});

	// Edge 케이스 테스트
	test('템플릿이 없는 경우에도 오류 없이 렌더링되어야 한다', () => {
		// dummies가 빈 배열일 때
		render(<SelectContract dummies={[]} dashboardData={mockDashboardData} />);
		expect(screen.getByText('계약서 작성하기')).toBeInTheDocument();

		// 섹션이 존재하는지 확인
		const section = document.querySelector('section');
		expect(section).toBeInTheDocument();
	});

	test('title2가 없는 템플릿의 경우에도 제목이 올바르게 표시되어야 한다', () => {
		// title2가 없는 템플릿 추가
		const mockDummiesWithoutTitle2 = [
			...mockDummies,
			{
				image: 'image/logo_design2.png',
				title: '단일 제목 템플릿',
				price: '$19.00',
				color: 'bg-[#123456]',
				ready: true,
				url: '/draft/single-title',
			},
		];

		render(<SelectContract dummies={mockDummiesWithoutTitle2} dashboardData={mockDashboardData} />);

		// 단일 제목이 올바르게 표시되는지 확인
		expect(screen.getByText('단일 제목 템플릿')).toBeInTheDocument();
	});
});
