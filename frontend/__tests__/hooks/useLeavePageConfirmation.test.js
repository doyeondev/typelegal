import { renderHook, act } from '@testing-library/react';
import { useLeavePageConfirmation } from '../../pages/hooks/useLeavePageConfirmation';
import * as timeUtils from '../../utils/timeUtils';
import * as docActivity from '../../pages/api/logs/docActivity';
import SingletonRouter, { Router } from 'next/router';

// Next.js 라우터 모킹
jest.mock('next/router', () => {
	const mockRouter = {
		router: {
			state: { asPath: '/current-path' },
			change: jest.fn(),
			push: jest.fn(),
		},
	};
	return {
		__esModule: true,
		default: mockRouter,
		Router: {
			prototype: {
				change: jest.fn(),
			},
		},
	};
});

// 시간 관련 유틸리티 모킹
jest.mock('../../utils/timeUtils', () => ({
	timeDiffSec: jest.fn(),
	timeDiffMin: jest.fn(),
	timestamp: jest.fn(),
}));

// 활동 로그 API 모킹
jest.mock('../../pages/api/logs/docActivity', () => ({
	post_activityLog: jest.fn(),
}));

describe('useLeavePageConfirmation 훅', () => {
	// 원래 window 객체의 속성들 저장
	const originalWindowOnBeforeUnload = window.onbeforeunload;
	const originalHistoryGo = window.history.go;

	// 모의 객체와 함수들
	const mockConfirmationDialog = jest.fn();
	const mockHistoryGo = jest.fn();

	beforeEach(() => {
		// 모든 모의 함수 초기화
		jest.clearAllMocks();

		// window.onbeforeunload 초기화
		window.onbeforeunload = originalWindowOnBeforeUnload;

		// history.go 모킹
		window.history.go = mockHistoryGo;

		// 타임스탬프 모킹
		timeUtils.timestamp.mockReturnValue('2023-01-01T00:00:00');
		timeUtils.timeDiffSec.mockReturnValue(60);
		timeUtils.timeDiffMin.mockReturnValue(1);

		// 확인 대화상자 모킹 초기화
		mockConfirmationDialog.mockReset();
	});

	afterAll(() => {
		// 테스트 후 원래 값으로 복원
		window.onbeforeunload = originalWindowOnBeforeUnload;
		window.history.go = originalHistoryGo;
	});

	test('shouldPreventLeaving이 true일 때 window.onbeforeunload가 설정되어야 한다', () => {
		// 테스트 데이터
		const shouldPreventLeaving = true;
		const activityLog = { startTime: '2023-01-01T00:00:00', action: 'test' };

		// 훅 렌더링
		renderHook(() => useLeavePageConfirmation(shouldPreventLeaving, activityLog));

		// onbeforeunload가 함수로 설정되었는지 확인
		expect(typeof window.onbeforeunload).toBe('function');

		// 함수 호출 시 빈 문자열을 반환하는지 확인
		expect(window.onbeforeunload()).toBe('');
	});

	test('shouldPreventLeaving이 false일 때 window.onbeforeunload가 변경되지 않아야 한다', () => {
		// 테스트 데이터
		const shouldPreventLeaving = false;
		const activityLog = { startTime: '2023-01-01T00:00:00', action: 'test' };

		// 훅 렌더링
		renderHook(() => useLeavePageConfirmation(shouldPreventLeaving, activityLog));

		// onbeforeunload가 원래 값과 동일한지 확인
		expect(window.onbeforeunload).toBe(originalWindowOnBeforeUnload);
	});

	test('컴포넌트 언마운트 시 원래 함수들로 복원되어야 한다', () => {
		// 테스트 데이터
		const shouldPreventLeaving = true;
		const activityLog = { startTime: '2023-01-01T00:00:00', action: 'test' };

		// 훅 렌더링 및 클린업
		const { unmount } = renderHook(() => useLeavePageConfirmation(shouldPreventLeaving, activityLog));

		// 언마운트
		unmount();

		// 원래 함수들로 복원되었는지 확인
		expect(window.onbeforeunload).toBe(originalWindowOnBeforeUnload);
	});

	test('라우터 변경 시 사용자가 확인을 수락하면 라우팅이 진행되어야 한다', async () => {
		// 테스트 데이터
		const shouldPreventLeaving = true;
		const activityLog = { startTime: '2023-01-01T00:00:00', action: 'test' };

		// 확인 대화상자가 true를 반환하도록 설정
		mockConfirmationDialog.mockResolvedValue(true);

		// 훅 렌더링
		renderHook(() => useLeavePageConfirmation(shouldPreventLeaving, activityLog, '페이지를 떠나시겠습니까?', mockConfirmationDialog));

		// 라우터 변경 시뮬레이션
		await act(async () => {
			await SingletonRouter.router.change('replaceState', '/new-path', '/new-path');
		});

		// 확인 대화상자가 호출되었는지 확인
		expect(mockConfirmationDialog).toHaveBeenCalledWith('페이지를 떠나시겠습니까?');

		// 라우터 변경 함수가 호출되었는지 확인
		expect(Router.prototype.change).toHaveBeenCalledWith('replaceState', '/new-path', '/new-path');
	});

	test('라우터 변경 시 사용자가 확인을 거부하면 라우팅이 취소되어야 한다', async () => {
		// 테스트 데이터
		const shouldPreventLeaving = true;
		const activityLog = { startTime: '2023-01-01T00:00:00', action: 'test' };

		// 확인 대화상자가 false를 반환하도록 설정
		mockConfirmationDialog.mockResolvedValue(false);

		// 훅 렌더링
		renderHook(() => useLeavePageConfirmation(shouldPreventLeaving, activityLog, '페이지를 떠나시겠습니까?', mockConfirmationDialog));

		// 라우터 변경 시뮬레이션
		await act(async () => {
			await SingletonRouter.router.change('replaceState', '/new-path', '/new-path');
		});

		// 확인 대화상자가 호출되었는지 확인
		expect(mockConfirmationDialog).toHaveBeenCalledWith('페이지를 떠나시겠습니까?');

		// 라우터 변경 함수가 호출되지 않았는지 확인
		expect(Router.prototype.change).not.toHaveBeenCalled();

		// 현재 경로로 다시 푸시되었는지 확인
		expect(SingletonRouter.router.push).toHaveBeenCalledWith('/current-path');

		// 히스토리 이동이 발생했는지 확인
		expect(mockHistoryGo).toHaveBeenCalledWith(1);
	});

	test('라우터 변경 시 활동 로그가 저장되어야 한다', async () => {
		// 테스트 데이터
		const shouldPreventLeaving = true;
		const activityLog = { startTime: '2023-01-01T00:00:00', action: 'test', userId: '123' };

		// 확인 대화상자가 true를 반환하도록 설정
		mockConfirmationDialog.mockResolvedValue(true);

		// 훅 렌더링
		renderHook(() => useLeavePageConfirmation(shouldPreventLeaving, activityLog, '페이지를 떠나시겠습니까?', mockConfirmationDialog));

		// 라우터 변경 시뮬레이션
		await act(async () => {
			await SingletonRouter.router.change('replaceState', '/new-path', '/new-path');
		});

		// 활동 로그 저장 함수가 호출되었는지 확인
		expect(docActivity.post_activityLog).toHaveBeenCalledWith({
			...activityLog,
			endTime: '2023-01-01T00:00:00',
			duration: 60,
			durationMin: 1,
		});
	});

	test('shouldPreventLeaving이 true로 변경될 때 window.onbeforeunload가 설정되어야 한다', () => {
		// 테스트 데이터
		const activityLog = { startTime: '2023-01-01T00:00:00', action: 'test' };

		// 초기에 false로 설정
		const { rerender } = renderHook(({ shouldPrevent, log }) => useLeavePageConfirmation(shouldPrevent, log), { initialProps: { shouldPrevent: false, log: activityLog } });

		// onbeforeunload가 원래 값과 동일한지 확인
		expect(window.onbeforeunload).toBe(originalWindowOnBeforeUnload);

		// true로 변경
		rerender({ shouldPrevent: true, log: activityLog });

		// onbeforeunload가 함수로 설정되었는지 확인
		expect(typeof window.onbeforeunload).toBe('function');
		expect(window.onbeforeunload()).toBe('');
	});

	test('shouldPreventLeaving이 false로 변경될 때 window.onbeforeunload가 원래 값으로 복원되어야 한다', () => {
		// 테스트 데이터
		const activityLog = { startTime: '2023-01-01T00:00:00', action: 'test' };

		// 초기에 true로 설정
		const { rerender } = renderHook(({ shouldPrevent, log }) => useLeavePageConfirmation(shouldPrevent, log), { initialProps: { shouldPrevent: true, log: activityLog } });

		// onbeforeunload가 함수로 설정되었는지 확인
		expect(typeof window.onbeforeunload).toBe('function');

		// false로 변경
		rerender({ shouldPrevent: false, log: activityLog });

		// onbeforeunload가 원래 값으로 복원되었는지 확인
		expect(window.onbeforeunload).toBe(originalWindowOnBeforeUnload);
	});
});
