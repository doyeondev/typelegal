import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import Spinner from '../../../components/ui/Spinner';

describe('Spinner 컴포넌트', () => {
	test('스피너가 올바르게 렌더링되는지 확인', () => {
		render(<Spinner />);

		// 로딩 메시지가 표시되는지 확인
		expect(screen.getByText('문서를 생성중입니다')).toBeInTheDocument();

		// 스피너 SVG가 렌더링되었는지 확인
		const spinnerElement = screen.getByRole('status');
		expect(spinnerElement).toBeInTheDocument();

		// SVG 요소가 애니메이션 클래스를 가지고 있는지 확인
		const svgElement = spinnerElement.querySelector('svg');
		expect(svgElement).toHaveClass('animate-spin');
	});

	test('스피너가 올바른 구조와 스타일을 가지고 있는지 확인', () => {
		const { container } = render(<Spinner />);

		// 메인 컨테이너가 그리드 레이아웃을 사용하는지 확인
		const mainContainer = container.firstChild.firstChild;
		expect(mainContainer).toHaveClass('grid');

		// 내부 컨테이너가 중앙 정렬을 위한 클래스를 가지고 있는지 확인
		const innerContainer = mainContainer.firstChild;
		expect(innerContainer).toHaveClass('mx-auto');

		// 스피너 요소가 mx-auto 클래스를 가지고 있는지 확인
		const spinnerElement = screen.getByRole('status');
		expect(spinnerElement).toHaveClass('mx-auto');

		// 로딩 텍스트가 올바른 스타일을 가지고 있는지 확인
		const loadingText = screen.getByText('문서를 생성중입니다');
		expect(loadingText).toHaveClass('mx-auto');
		expect(loadingText).toHaveClass('text-sm');
		expect(loadingText).toHaveClass('text-gray-500');
	});
});
