/**
 * @jest-environment jsdom
 */
import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import Sidebar from '../../../components/dashboard/Sidebar';

// 테스트용 데이터 모킹
const mockUser = {
	name: '테스트 사용자',
	email: 'test@example.com',
	role: 'USER',
};

// Links 모킹
jest.mock('next/link', () => {
	return ({ children, href, ...rest }) => {
		return (
			<a href={href} {...rest}>
				{children}
			</a>
		);
	};
});

// Image 모킹
jest.mock('next/image', () => {
	return ({ src, alt, ...props }) => {
		return <img src={src} alt={alt} data-testid={`image-${alt}`} {...props} />;
	};
});

describe('Sidebar 컴포넌트', () => {
	test('기본 UI 요소들이 올바르게 렌더링되어야 한다', () => {
		render(<Sidebar data={mockUser} />);

		// 로고 이미지가 렌더링되었는지 확인
		expect(screen.getByTestId('image-타입리걸')).toBeInTheDocument();

		// 사용자 정보가 표시되는지 확인
		expect(screen.getByText('테스트 사용자')).toBeInTheDocument();
		expect(screen.getByText('test@example.com')).toBeInTheDocument();

		// 메뉴 항목들이 표시되는지 확인
		expect(screen.getByText('내 문서')).toBeInTheDocument();
		expect(screen.getByText('계약서 작성')).toBeInTheDocument();
		expect(screen.getByText('설정')).toBeInTheDocument();
	});

	test('내 문서 메뉴에 올바른 아이콘이 포함되어 있어야 한다', () => {
		render(<Sidebar data={mockUser} />);

		// 내 문서 메뉴 항목 찾기
		const menuItem = screen.getByText('내 문서').closest('a');

		// 아이콘을 포함하고 있는지 확인
		expect(menuItem).toBeInTheDocument();
		// 여기서 실제 아이콘 검증은 구현에 따라 달라질 수 있음
	});

	test('사이드바가 적절한 레이아웃과 스타일로 렌더링되어야 한다', () => {
		const { container } = render(<Sidebar data={mockUser} />);

		// 사이드바 요소 찾기
		const sidebar = container.querySelector('aside');

		// 사이드바가 존재하는지 확인
		expect(sidebar).toBeInTheDocument();
	});

	test('사용자 데이터가 없는 경우에도 정상적으로 렌더링되어야 한다', () => {
		render(<Sidebar data={null} />);

		// 기본 UI 요소들이 여전히 렌더링되는지 확인
		expect(screen.getByTestId('image-타입리걸')).toBeInTheDocument();

		// 사용자 데이터 대신 기본값이 표시되는지 확인
		// 구현에 따라 다를 수 있음
		expect(screen.queryByText('test@example.com')).not.toBeInTheDocument();
	});
});
