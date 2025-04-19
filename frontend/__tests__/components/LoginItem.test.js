import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import LoginItem from '../../components/LoginItem';

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

// fetch API 모킹
global.fetch = jest.fn();

// localStorage 모킹
const localStorageMock = {
	getItem: jest.fn(),
	setItem: jest.fn(),
	clear: jest.fn(),
	theme: '',
};

Object.defineProperty(window, 'localStorage', { value: localStorageMock });

// sessionStorage 모킹
const sessionStorageMock = {
	getItem: jest.fn(),
	setItem: jest.fn(),
	clear: jest.fn(),
};

Object.defineProperty(window, 'sessionStorage', { value: sessionStorageMock });

// location.reload 모킹
const mockReload = jest.fn();
Object.defineProperty(window, 'location', {
	value: { reload: mockReload },
	writable: true,
});

// console.log 모킹
console.log = jest.fn();

describe('LoginItem 컴포넌트', () => {
	beforeEach(() => {
		// 모든 mock 초기화
		jest.clearAllMocks();
	});

	test('로그인 폼이 올바르게 렌더링되는지 확인', () => {
		render(<LoginItem />);

		// 제목이 표시되는지 확인
		expect(screen.getByText('로그인이 필요한 서비스입니다 🙂')).toBeInTheDocument();

		// 이메일 입력 필드가 있는지 확인
		expect(screen.getByPlaceholderText('name@company.com')).toBeInTheDocument();

		// 비밀번호 입력 필드가 있는지 확인
		expect(screen.getByPlaceholderText('••••••••')).toBeInTheDocument();

		// 로그인 버튼이 있는지 확인
		expect(screen.getByRole('button', { name: '로그인' })).toBeInTheDocument();
	});

	test('이메일과 비밀번호 입력이 제대로 작동하는지 확인', () => {
		render(<LoginItem />);

		// 이메일 입력 필드 설정
		const emailInput = screen.getByPlaceholderText('name@company.com');
		fireEvent.change(emailInput, { target: { value: 'test@example.com' } });
		expect(emailInput.value).toBe('test@example.com');

		// 비밀번호 입력 필드 설정
		const passwordInput = screen.getByPlaceholderText('••••••••');
		fireEvent.change(passwordInput, { target: { value: 'password123' } });
		expect(passwordInput.value).toBe('password123');
	});

	test('로그인 성공 시 세션 스토리지 설정 및 페이지 리로드 확인', async () => {
		// 성공적인 로그인 응답 모킹
		global.fetch.mockResolvedValueOnce({
			status: 200,
			json: async () => ({
				items: {
					_id: '123',
					user_email: 'test@example.com',
					user_name: '테스트 사용자',
					submittedSurvey: true,
				},
			}),
		});

		render(<LoginItem />);

		// 이메일과 비밀번호 입력
		fireEvent.change(screen.getByPlaceholderText('name@company.com'), { target: { value: 'test@example.com' } });
		fireEvent.change(screen.getByPlaceholderText('••••••••'), { target: { value: 'password123' } });

		// 로그인 버튼 클릭
		fireEvent.click(screen.getByRole('button', { name: '로그인' }));

		// 비동기 작업 대기
		await waitFor(() => {
			// fetch가 호출되었는지 확인
			expect(global.fetch).toHaveBeenCalledWith(expect.stringContaining('loginMember/test@example.com/password123'));

			// 세션 스토리지에 사용자 정보가 저장되었는지 확인
			expect(sessionStorageMock.setItem).toHaveBeenCalledWith(
				'member_key',
				JSON.stringify({
					email: 'test@example.com',
					name: '테스트 사용자',
					submittedSurvey: true,
				})
			);

			// 페이지가 리로드되었는지 확인
			expect(mockReload).toHaveBeenCalled();
		});
	});

	test('로그인 실패 시 오류 메시지 표시 확인', async () => {
		// 로그인 실패 응답 모킹
		global.fetch.mockResolvedValueOnce({
			status: 404,
		});

		render(<LoginItem />);

		// 이메일과 비밀번호 입력
		fireEvent.change(screen.getByPlaceholderText('name@company.com'), { target: { value: 'wrong@example.com' } });
		fireEvent.change(screen.getByPlaceholderText('••••••••'), { target: { value: 'wrongpassword' } });

		// 로그인 버튼 클릭
		fireEvent.click(screen.getByRole('button', { name: '로그인' }));

		// 오류 메시지가 표시되는지 확인
		await waitFor(() => {
			expect(screen.getByText('이메일 혹은 비밀번호가 일치하지 않습니다')).toBeInTheDocument();
		});
	});

	test('Enter 키를 눌러도 로그인이 시도되는지 확인', async () => {
		// 성공적인 로그인 응답 모킹
		global.fetch.mockResolvedValueOnce({
			status: 200,
			json: async () => ({
				items: {
					user_email: 'test@example.com',
					user_name: '테스트 사용자',
					submittedSurvey: false,
				},
			}),
		});

		render(<LoginItem />);

		// 이메일과 비밀번호 입력
		fireEvent.change(screen.getByPlaceholderText('name@company.com'), { target: { value: 'test@example.com' } });
		fireEvent.change(screen.getByPlaceholderText('••••••••'), { target: { value: 'password123' } });

		// 비밀번호 필드에서 엔터 키 누르기
		fireEvent.keyDown(screen.getByPlaceholderText('••••••••'), { keyCode: 13 });

		// 비동기 작업 대기
		await waitFor(() => {
			// fetch가 호출되었는지 확인
			expect(global.fetch).toHaveBeenCalledWith(expect.stringContaining('loginMember/test@example.com/password123'));
		});
	});
});
