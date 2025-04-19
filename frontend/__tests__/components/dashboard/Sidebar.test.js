import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import Sidebar from '../../../components/dashboard/Sidebar';

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

describe('Sidebar 컴포넌트', () => {
	// 테스트용 사용자 데이터
	const mockUser = {
		name: '홍길동',
		email: 'test@example.com',
	};

	test('기본 UI 요소들이 올바르게 렌더링되어야 한다', () => {
		render(<Sidebar data={mockUser} />);

		// 로고 이미지가 렌더링되었는지 확인
		expect(screen.getByTestId('image-타입리걸')).toBeInTheDocument();

		// 홈 링크가 있는지 확인
		expect(screen.getByTestId('link-to-/')).toBeInTheDocument();

		// 내 문서 메뉴가 표시되는지 확인
		expect(screen.getByText('내 문서')).toBeInTheDocument();

		// 문의 정보가 표시되는지 확인
		expect(screen.getByText('문제가 발생했나요?')).toBeInTheDocument();
		expect(screen.getByText('문의가능 : M-F, 09:00-19:00')).toBeInTheDocument();
		expect(screen.getByText('이메일 : team@typelegal.io')).toBeInTheDocument();
	});

	test('내 문서 메뉴에 올바른 아이콘이 포함되어 있어야 한다', () => {
		render(<Sidebar data={mockUser} />);

		// 내 문서 메뉴 항목 찾기
		const menuItem = screen.getByText('내 문서').closest('a');

		// SVG 아이콘이 있는지 확인
		const svg = menuItem.querySelector('svg');
		expect(svg).toBeInTheDocument();

		// 내 문서 메뉴에 적절한 스타일 클래스가 적용되었는지 확인
		expect(menuItem).toHaveClass('bg-gray-100');
	});

	test('사이드바가 적절한 레이아웃과 스타일로 렌더링되어야 한다', () => {
		const { container } = render(<Sidebar data={mockUser} />);

		// 사이드바 요소 찾기
		const sidebar = container.querySelector('aside');

		// 사이드바 요소가 있는지 확인
		expect(sidebar).toBeInTheDocument();

		// 적절한 너비와 스타일이 적용되었는지 확인
		expect(sidebar).toHaveClass('w-[240px]');
		expect(sidebar).toHaveClass('h-screen');
		expect(sidebar).toHaveClass('bg-white');
	});

	test('사용자 데이터가 없는 경우에도 정상적으로 렌더링되어야 한다', () => {
		render(<Sidebar data={null} />);

		// 기본 UI 요소들이 여전히 렌더링되는지 확인
		expect(screen.getByTestId('image-타입리걸')).toBeInTheDocument();
		expect(screen.getByText('내 문서')).toBeInTheDocument();
	});
});
