import React from 'react';
import { render } from '@testing-library/react';
import '@testing-library/jest-dom';
import Document from '../../pages/_document';

// next/document 모듈 모킹
jest.mock('next/document', () => ({
	Html: ({ children, ...props }) => (
		<div data-testid="html" {...props}>
			{children}
		</div>
	),
	Head: ({ children }) => <div data-testid="head">{children}</div>,
	Main: () => <div data-testid="main" />,
	NextScript: () => <div data-testid="next-script" />,
}));

// next/script 모듈 모킹
jest.mock('next/script', () => {
	return function MockScript({ children, id, strategy }) {
		return (
			<script data-testid={`script-${id}`} data-strategy={strategy}>
				{children}
			</script>
		);
	};
});

describe('Document 컴포넌트', () => {
	test('기본 HTML 구조가 올바르게 렌더링되어야 한다', () => {
		const { getByTestId } = render(<Document />);

		// Html 컴포넌트가 렌더링되었는지 확인
		const html = getByTestId('html');
		expect(html).toBeInTheDocument();
		expect(html).toHaveAttribute('lang', 'en');

		// Head 컴포넌트가 렌더링되었는지 확인
		expect(getByTestId('head')).toBeInTheDocument();

		// Main 컴포넌트가 렌더링되었는지 확인
		expect(getByTestId('main')).toBeInTheDocument();

		// NextScript 컴포넌트가 렌더링되었는지 확인
		expect(getByTestId('next-script')).toBeInTheDocument();
	});

	test('Google Tag Manager 스크립트가 포함되어 있어야 한다', () => {
		const { getByTestId } = render(<Document />);

		// Google Tag Manager 스크립트가 렌더링되었는지 확인
		const gtmScript = getByTestId('script-google-tag-manager');
		expect(gtmScript).toBeInTheDocument();

		// 스크립트가 afterInteractive 전략을 사용하는지 확인
		expect(gtmScript).toHaveAttribute('data-strategy', 'afterInteractive');

		// 스크립트 내용에 Google Tag Manager ID가 포함되어 있는지 확인
		expect(gtmScript.textContent).toContain('GTM-KM93WS9');
	});

	test('noscript 태그가 Google Tag Manager iframe을 포함하고 있어야 한다', () => {
		const { container } = render(<Document />);

		// noscript 태그가 존재하는지 확인
		const noscript = container.querySelector('noscript');
		expect(noscript).toBeInTheDocument();

		// Document 컴포넌트 코드에 Google Tag Manager ID와 iframe이 포함되어 있는지 확인
		const documentCode = Document.toString();
		expect(documentCode).toContain('GTM-KM93WS9');
		expect(documentCode).toContain('googletagmanager.com/ns.html');
	});
});
