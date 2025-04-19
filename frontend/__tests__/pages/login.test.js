import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import Login from '../../pages/login';
import memberApi from '../../pages/api/services/memberApi';
import { useRouter } from 'next/router';

// Next.js 모듈 모킹
jest.mock('next/image', () => ({
	__esModule: true,
	default: props => {
		// eslint-disable-next-line jsx-a11y/alt-text
		return <img {...props} data-testid="mock-image" />;
	},
}));

jest.mock('next/head', () => ({
	__esModule: true,
	default: ({ children }) => <div data-testid="mock-head">{children}</div>,
}));

// Next.js 라우터 모킹
jest.mock('next/router', () => ({
	useRouter: jest.fn(),
}));

// memberApi 모킹
jest.mock('../../pages/api/services/memberApi', () => ({
	login: jest.fn(),
}));

// localStorage와 sessionStorage 모킹
const localStorageMock = (() => {
	let store = {};
	return {
		getItem: jest.fn(key => store[key] || null),
		setItem: jest.fn((key, value) => {
			store[key] = value;
		}),
		removeItem: jest.fn(key => {
			delete store[key];
		}),
		clear: jest.fn(() => {
			store = {};
		}),
	};
})();

const sessionStorageMock = (() => {
	let store = {};
	return {
		getItem: jest.fn(key => store[key] || null),
		setItem: jest.fn((key, value) => {
			store[key] = value;
		}),
		removeItem: jest.fn(key => {
			delete store[key];
		}),
		clear: jest.fn(() => {
			store = {};
		}),
	};
})();

Object.defineProperty(window, 'localStorage', { value: localStorageMock });
Object.defineProperty(window, 'sessionStorage', { value: sessionStorageMock });

// console 모킹
console.log = jest.fn();
console.error = jest.fn();

describe('로그인 페이지', () => {
	const mockRouter = {
		push: jest.fn(),
	};

	beforeEach(() => {
		// 각 테스트 전에 모든 모의 함수 초기화
		jest.clearAllMocks();
		useRouter.mockReturnValue(mockRouter);

		// 타이머 모킹 설정
		jest.useFakeTimers();
	});

	afterEach(() => {
		// 테스트 후 타이머 복원
		jest.useRealTimers();
	});

	test('로그인 폼이 올바르게 렌더링되어야 한다', () => {
		render(<Login />);

		// 페이지 제목 확인
		expect(screen.getByRole('heading', { name: '로그인' })).toBeInTheDocument();

		// 입력 필드 확인
		expect(screen.getByLabelText('이메일')).toBeInTheDocument();
		expect(screen.getByLabelText('비밀번호')).toBeInTheDocument();

		// 버튼 확인
		expect(screen.getByRole('button', { name: '로그인' })).toBeInTheDocument();

		// 회원가입 링크 확인
		expect(screen.getByText('회원가입 하기')).toBeInTheDocument();
	});

	test('이메일과 비밀번호 입력이 정상적으로 작동해야 한다', () => {
		render(<Login />);

		// 이메일 입력
		const emailInput = screen.getByLabelText('이메일');
		fireEvent.change(emailInput, { target: { value: 'test@example.com' } });
		expect(emailInput.value).toBe('test@example.com');

		// 비밀번호 입력
		const passwordInput = screen.getByLabelText('비밀번호');
		fireEvent.change(passwordInput, { target: { value: 'password123' } });
		expect(passwordInput.value).toBe('password123');
	});

	test('입력값 없이 로그인 버튼을 클릭하면 오류 메시지가 표시되어야 한다', async () => {
		render(<Login />);

		// 로그인 버튼 클릭
		fireEvent.click(screen.getByRole('button', { name: '로그인' }));

		// 오류 메시지 확인
		await waitFor(() => {
			expect(screen.getByText(/이메일과 비밀번호를 모두 입력해주세요/i)).toBeInTheDocument();
		});
	});

	test('로그인 성공 시 사용자 정보가 저장되고 대시보드로 이동해야 한다', async () => {
		// 로그인 성공 응답 모킹
		memberApi.login.mockResolvedValueOnce({
			token: 'fake-token',
			id: '123',
			email: 'test@example.com',
			name: '홍길동',
			role: 'USER',
			submittedSurvey: true,
		});

		render(<Login />);

		// 이메일과 비밀번호 입력
		fireEvent.change(screen.getByLabelText('이메일'), { target: { value: 'test@example.com' } });
		fireEvent.change(screen.getByLabelText('비밀번호'), { target: { value: 'password123' } });

		// 로그인 버튼 클릭
		fireEvent.click(screen.getByRole('button', { name: '로그인' }));

		// API 호출 확인
		expect(memberApi.login).toHaveBeenCalledWith({
			email: 'test@example.com',
			password: 'password123',
		});

		// 비동기 작업 대기
		await waitFor(() => {
			// 로컬 스토리지에 토큰이 저장되었는지 확인
			expect(localStorage.setItem).toHaveBeenCalledWith('auth_token', 'fake-token');

			// 세션 스토리지에 사용자 정보가 저장되었는지 확인
			expect(sessionStorage.setItem).toHaveBeenCalledWith(
				'member_key',
				JSON.stringify({
					id: '123',
					email: 'test@example.com',
					name: '홍길동',
					role: 'USER',
					submittedSurvey: true,
				})
			);
		});

		// 타이머 함수를 동기적으로 진행
		jest.runAllTimers();

		// 대시보드로 리다이렉트 되었는지 확인
		await waitFor(() => {
			expect(mockRouter.push).toHaveBeenCalledWith('/dashboard');
		});
	});

	test('저장된 리디렉션 경로가 있을 경우 해당 경로로 이동해야 한다', async () => {
		// 로그인 성공 응답 모킹
		memberApi.login.mockResolvedValueOnce({
			token: 'fake-token',
			id: '123',
			email: 'test@example.com',
			name: '홍길동',
		});

		// 리디렉션 경로 설정
		sessionStorage.getItem.mockImplementation(key => {
			if (key === 'redirectAfterLogin') return '/my-profile';
			return null;
		});

		render(<Login />);

		// 이메일과 비밀번호 입력
		fireEvent.change(screen.getByLabelText('이메일'), { target: { value: 'test@example.com' } });
		fireEvent.change(screen.getByLabelText('비밀번호'), { target: { value: 'password123' } });

		// 로그인 버튼 클릭
		fireEvent.click(screen.getByRole('button', { name: '로그인' }));

		// 타이머 함수를 동기적으로 진행
		jest.runAllTimers();

		// 저장된 리디렉션 경로로 이동했는지 확인
		await waitFor(() => {
			expect(sessionStorage.removeItem).toHaveBeenCalledWith('redirectAfterLogin');
			expect(mockRouter.push).toHaveBeenCalledWith('/my-profile');
		});
	});

	test('로그인 실패 시 오류 메시지가 표시되어야 한다', async () => {
		// 로그인 실패 응답 모킹
		memberApi.login.mockRejectedValueOnce({
			status: 401,
			message: '이메일 또는 비밀번호가 올바르지 않습니다.',
		});

		render(<Login />);

		// 이메일과 비밀번호 입력
		fireEvent.change(screen.getByLabelText('이메일'), { target: { value: 'test@example.com' } });
		fireEvent.change(screen.getByLabelText('비밀번호'), { target: { value: 'wrong-password' } });

		// 로그인 버튼 클릭
		fireEvent.click(screen.getByRole('button', { name: '로그인' }));

		// 오류 메시지 확인
		await waitFor(() => {
			expect(screen.getByText(/이메일 또는 비밀번호가 올바르지 않습니다/i)).toBeInTheDocument();
		});
	});

	test('엔터 키를 눌러도 로그인이 시도되어야 한다', async () => {
		// 로그인 성공 응답 모킹
		memberApi.login.mockResolvedValueOnce({
			token: 'fake-token',
			id: '123',
			email: 'test@example.com',
			name: '홍길동',
		});

		render(<Login />);

		// 이메일과 비밀번호 입력
		fireEvent.change(screen.getByLabelText('이메일'), { target: { value: 'test@example.com' } });
		fireEvent.change(screen.getByLabelText('비밀번호'), { target: { value: 'password123' } });

		// 비밀번호 입력 필드에서 엔터 키 누르기
		fireEvent.keyDown(screen.getByLabelText('비밀번호'), { key: 'Enter', code: 'Enter' });

		// API 호출 확인
		await waitFor(() => {
			expect(memberApi.login).toHaveBeenCalledWith({
				email: 'test@example.com',
				password: 'password123',
			});
		});
	});
});
