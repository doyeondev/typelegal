import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import Footer from '../../components/Footer';

describe('Footer 컴포넌트', () => {
	test('푸터가 올바르게 렌더링되는지 확인', () => {
		render(<Footer />);

		// 저작권 텍스트가 표시되는지 확인
		expect(screen.getByText(/© 타입리걸 2023-2025/i)).toBeInTheDocument();

		// 이메일 정보가 표시되는지 확인
		expect(screen.getByText(/이메일: team@typelegal.io/i)).toBeInTheDocument();
	});

	test('푸터가 올바른 클래스를 가지고 있는지 확인', () => {
		const { container } = render(<Footer />);

		// footer 태그가 존재하는지 확인
		const footerElement = container.querySelector('footer');
		expect(footerElement).toBeInTheDocument();

		// footer 태그가 올바른 클래스를 가지고 있는지 확인
		expect(footerElement).toHaveClass('body-font');
	});
});
