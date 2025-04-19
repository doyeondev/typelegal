import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import Tooltip from '../../../components/ui/Tooltip';

describe('Tooltip 컴포넌트', () => {
	test('툴팁과 자식 요소가 올바르게 렌더링되는지 확인', () => {
		const tooltipMessage = '도움말 메시지';
		const childContent = '도움말';

		render(
			<Tooltip message={tooltipMessage}>
				<button>{childContent}</button>
			</Tooltip>
		);

		// 자식 요소가 렌더링되었는지 확인
		expect(screen.getByText(childContent)).toBeInTheDocument();

		// 툴팁 메시지가 렌더링되었는지 확인
		expect(screen.getByText(tooltipMessage)).toBeInTheDocument();
	});

	test('툴팁이 올바른 클래스와 스타일을 가지고 있는지 확인', () => {
		const { container } = render(
			<Tooltip message="테스트 메시지">
				<span>테스트</span>
			</Tooltip>
		);

		// 메인 컨테이너가 올바른 클래스를 가지고 있는지 확인
		const mainContainer = container.firstChild;
		expect(mainContainer).toHaveClass('ml-2');
		expect(mainContainer).toHaveClass('group');
		expect(mainContainer).toHaveClass('flex');

		// 툴팁 요소가 올바른 클래스를 가지고 있는지 확인
		const tooltipElement = screen.getByText('테스트 메시지');
		expect(tooltipElement).toHaveClass('absolute');
		expect(tooltipElement).toHaveClass('z-40');
		expect(tooltipElement).toHaveClass('scale-0');
		expect(tooltipElement).toHaveClass('group-hover:scale-100');
		expect(tooltipElement).toHaveClass('bg-gray-800');
		expect(tooltipElement).toHaveClass('text-white');
	});

	test('복잡한 자식 컴포넌트를 올바르게 렌더링하는지 확인', () => {
		render(
			<Tooltip message="복잡한 메시지">
				<div data-testid="complex-child">
					<span>첫 번째 자식</span>
					<button>두 번째 자식</button>
				</div>
			</Tooltip>
		);

		// 복잡한 자식 요소들이 렌더링되었는지 확인
		expect(screen.getByTestId('complex-child')).toBeInTheDocument();
		expect(screen.getByText('첫 번째 자식')).toBeInTheDocument();
		expect(screen.getByText('두 번째 자식')).toBeInTheDocument();

		// 툴팁 메시지가 렌더링되었는지 확인
		expect(screen.getByText('복잡한 메시지')).toBeInTheDocument();
	});
});
