import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import Layout from '../../components/Layout';

// Header와 Footer 컴포넌트 모킹
jest.mock('../../components/Header', () => {
	return function MockHeader() {
		return <div data-testid="header-mock">Header Mock</div>;
	};
});

jest.mock('../../components/Footer', () => {
	return function MockFooter() {
		return <div data-testid="footer-mock">Footer Mock</div>;
	};
});

describe('Layout 컴포넌트', () => {
	test('Layout이 Header, Footer, 그리고 children을 올바르게 렌더링하는지 확인', () => {
		// 테스트용 자식 컴포넌트
		const testContent = '테스트 콘텐츠';

		render(
			<Layout>
				<div data-testid="test-content">{testContent}</div>
			</Layout>
		);

		// Header가 렌더링되었는지 확인
		expect(screen.getByTestId('header-mock')).toBeInTheDocument();

		// 자식 컴포넌트가 렌더링되었는지 확인
		expect(screen.getByTestId('test-content')).toBeInTheDocument();
		expect(screen.getByText(testContent)).toBeInTheDocument();

		// Footer가 렌더링되었는지 확인
		expect(screen.getByTestId('footer-mock')).toBeInTheDocument();
	});

	test('Layout이 올바른 클래스와 구조를 가지고 있는지 확인', () => {
		const { container } = render(<Layout>테스트</Layout>);

		// 메인 컨테이너가 올바른 클래스를 가지고 있는지 확인
		const mainContainer = container.firstChild;
		expect(mainContainer).toHaveClass('bg-primary');

		// 콘텐츠 영역이 올바른 클래스를 가지고 있는지 확인
		const contentContainer = mainContainer.childNodes[1];
		expect(contentContainer).toHaveClass('h-auto');
	});
});
