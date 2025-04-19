import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import Header from '../../components/Header';

// Next.js 모듈 모킹
jest.mock('next/image', () => ({
	__esModule: true,
	default: props => {
		// eslint-disable-next-line jsx-a11y/alt-text
		return <img {...props} />;
	},
}));

jest.mock('next/link', () => ({
	__esModule: true,
	default: ({ children, href }) => <a href={href}>{children}</a>,
}));

// tippy.js 모듈 모킹
jest.mock('tippy.js', () => {
	return jest.fn(() => ({
		destroy: jest.fn(),
	}));
});

// 스토리지 모킹
const mockSessionStorage = {
	getItem: jest.fn(),
	setItem: jest.fn(),
	removeItem: jest.fn(),
};

const mockLocalStorage = {
	getItem: jest.fn(),
	setItem: jest.fn(),
	theme: '',
};

Object.defineProperty(window, 'sessionStorage', { value: mockSessionStorage });
Object.defineProperty(window, 'localStorage', { value: mockLocalStorage });

// 페이지 리로드 모킹
const mockReload = jest.fn();
Object.defineProperty(window, 'location', {
	value: { reload: mockReload },
	writable: true,
});

describe('Header 컴포넌트', () => {
	beforeEach(() => {
		jest.clearAllMocks();
	});

	test('로그인하지 않은 상태에서는 로그인 버튼이 표시되어야 한다', () => {
		// sessionStorage에서 member_key가 없는 상태 모킹
		mockSessionStorage.getItem.mockReturnValue(null);

		render(<Header />);

		// 로그인 버튼이 존재하는지 확인
		expect(screen.getByText('로그인')).toBeInTheDocument();

		// 로그아웃 버튼이 없는지 확인
		expect(screen.queryByText('로그아웃')).not.toBeInTheDocument();

		// 계약서 작성하기 버튼이 없는지 확인
		expect(screen.queryByText('계약서 작성하기')).not.toBeInTheDocument();
	});

	test('로그인한 상태에서는 로그아웃과 계약서 작성하기 버튼이 표시되어야 한다', () => {
		// sessionStorage에서 member_key가 있는 상태 모킹
		const mockMember = { id: 1, name: 'Test User' };
		mockSessionStorage.getItem.mockReturnValue(JSON.stringify(mockMember));

		render(<Header />);

		// 로그아웃 버튼이 존재하는지 확인
		expect(screen.getByText('로그아웃')).toBeInTheDocument();

		// 계약서 작성하기 버튼이 존재하는지 확인
		expect(screen.getByText('계약서 작성하기')).toBeInTheDocument();

		// 로그인 버튼이 없는지 확인
		expect(screen.queryByText('로그인')).not.toBeInTheDocument();
	});

	test('로그아웃 버튼 클릭 시 세션스토리지에서 member_key가 제거되고 페이지가 리로드되어야 한다', () => {
		// sessionStorage에서 member_key가 있는 상태 모킹
		const mockMember = { id: 1, name: 'Test User' };
		mockSessionStorage.getItem.mockReturnValue(JSON.stringify(mockMember));

		render(<Header />);

		// 로그아웃 버튼 클릭
		fireEvent.click(screen.getByText('로그아웃'));

		// sessionStorage.removeItem이 호출되었는지 확인
		expect(mockSessionStorage.removeItem).toHaveBeenCalledWith('member_key');

		// 페이지가 리로드되었는지 확인
		expect(mockReload).toHaveBeenCalled();
	});
});
