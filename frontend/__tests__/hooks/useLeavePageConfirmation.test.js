import { renderHook, act } from '@testing-library/react';
import { useLeavePageConfirmation } from '../../src/hooks/useLeavePageConfirmation';
import * as timeUtils from '../../src/utils/timeUtils';
// import * as docActivity from '../../pages/api/logs/docActivity';
import logService from '../../src/services/logService';
import SingletonRouter, { Router } from 'next/router';

// timeUtils 모킹
jest.mock('../../src/utils/timeUtils', () => ({
	timeDiffSec: jest.fn().mockReturnValue(60),
	timeDiffMin: jest.fn().mockReturnValue(1),
	timestamp: jest.fn().mockReturnValue('2023-01-01T00:00:00'),
}));

// 활동 로그 API 모킹
jest.mock('../../src/services/logService', () => ({
	saveActivityLog: jest.fn(),
	submitDraftLog: jest.fn(),
}));

// next/router 모킹
jest.mock('next/router', () => {
	const router = {
		push: jest.fn(),
		events: {
			on: jest.fn(),
			off: jest.fn(),
		},
		asPath: '/current-path',
		pathname: '/current-path',
		query: {},
		route: '/current-path',
		change: jest.fn(),
	};

	return {
		useRouter: jest.fn().mockReturnValue(router),
	};
});

describe('useLeavePageConfirmation 훅 테스트', () => {
	// 테스트용 데이터
	const defaultActivityLog = {
		startTime: '2023-01-01T00:00:00',
		action: 'test',
	};

	// confirm 대화상자 모킹
	const mockConfirm = jest.fn();
	global.confirm = mockConfirm;

	// window.onbeforeunload 백업 및 복원
	const originalOnBeforeUnload = window.onbeforeunload;

	beforeEach(() => {
		jest.clearAllMocks();
		window.onbeforeunload = null;
		mockConfirm.mockImplementation(() => true);
	});

	afterAll(() => {
		window.onbeforeunload = originalOnBeforeUnload;
	});

	test('shouldPreventLeaving이 true일 때 window.onbeforeunload가 설정됨', () => {
		const { result } = renderHook(() => useLeavePageConfirmation(true, defaultActivityLog));

		expect(typeof window.onbeforeunload).toBe('function');
	});

	test('shouldPreventLeaving이 false일 때 window.onbeforeunload가 설정되지 않음', () => {
		const { result } = renderHook(() => useLeavePageConfirmation(false, defaultActivityLog));

		expect(window.onbeforeunload).toBe(null);
	});

	test('shouldPreventLeaving 값이 변경되면 onbeforeunload 설정이 변경됨', () => {
		const { rerender } = renderHook(({ shouldPrevent }) => useLeavePageConfirmation(shouldPrevent, defaultActivityLog), { initialProps: { shouldPrevent: false } });

		expect(window.onbeforeunload).toBe(null);

		rerender({ shouldPrevent: true });

		expect(typeof window.onbeforeunload).toBe('function');
	});
});
