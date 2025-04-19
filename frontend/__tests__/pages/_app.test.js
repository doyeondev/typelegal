import React from 'react';
import { render } from '@testing-library/react';
import '@testing-library/jest-dom';
import App from '../../pages/_app';

// 의존성 모킹
jest.mock('next/script', () => {
	return function MockScript({ children, dangerouslySetInnerHTML, id }) {
		if (dangerouslySetInnerHTML) {
			return <div data-testid={`script-${id}`} dangerouslySetInnerHTML={dangerouslySetInnerHTML} />;
		}
		return <div data-testid="mock-script">{children}</div>;
	};
});

jest.mock('next/head', () => {
	return function MockHead({ children }) {
		return <div data-testid="mock-head">{children}</div>;
	};
});

jest.mock('next-themes', () => ({
	ThemeProvider: ({ children }) => {
		return <div data-testid="theme-provider">{children}</div>;
	},
}));

describe('App 컴포넌트', () => {
	// 테스트용 모의 컴포넌트
	const MockComponent = () => <div data-testid="mock-component">MockComponent</div>;
	const mockPageProps = { test: 'test' };

	test('ThemeProvider로 컴포넌트가 감싸져 있어야 한다', () => {
		const { getByTestId } = render(<App Component={MockComponent} pageProps={mockPageProps} />);

		// ThemeProvider가 존재하는지 확인
		const themeProvider = getByTestId('theme-provider');
		expect(themeProvider).toBeInTheDocument();

		// 자식 컴포넌트가 렌더링되었는지 확인
		expect(getByTestId('mock-component')).toBeInTheDocument();
		expect(getByTestId('mock-component').textContent).toBe('MockComponent');
	});

	test('Google Analytics 스크립트가 페이지에 포함되어 있어야 한다', () => {
		const { getByTestId } = render(<App Component={MockComponent} pageProps={mockPageProps} />);

		// Google Analytics 초기화 스크립트가 존재하는지 확인
		const gtagInitScript = getByTestId('script-gtag-init');
		expect(gtagInitScript).toBeInTheDocument();

		// 스크립트 내용에 Google Analytics 설정이 포함되어 있는지 확인
		const scriptHTML = gtagInitScript.innerHTML;
		expect(scriptHTML).toContain("gtag('config', 'G-MS8Z3MX3ZN'");
	});

	test('pageProps가 컴포넌트로 전달되어야 한다', () => {
		// pageProps가 올바르게 전달되는지 확인하기 위한 테스트 컴포넌트
		const TestComponent = props => <div data-testid="test-component">{JSON.stringify(props)}</div>;

		const { getByTestId } = render(<App Component={TestComponent} pageProps={mockPageProps} />);

		// props가 올바르게 전달되었는지 확인
		const testComponent = getByTestId('test-component');
		expect(testComponent.textContent).toContain('"test":"test"');
	});
});
