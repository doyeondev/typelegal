const { test, expect } = require('@playwright/test');
const axios = require('axios');

// 테스트에 사용할 API 기본 URL
const API_BASE_URL = process.env.API_BASE_URL || 'http://localhost:8082';

// 테스트 사용자 정보
const TEST_USER = {
	email: `test-${Date.now()}@typelegal.com`,
	password: 'Test1234!',
	name: '테스트 사용자',
};

// API 클라이언트 생성
const apiClient = axios.create({
	baseURL: API_BASE_URL,
	headers: {
		'Content-Type': 'application/json',
		Accept: 'application/json',
	},
});

// 테스트 시나리오: 회원가입 → 로그인 → 회원정보 조회
test.describe('TypeLegal API E2E 테스트', () => {
	let authToken;
	let userId;

	// 이메일 중복 체크
	test('이메일 중복 체크 API 테스트', async ({ request }) => {
		// 랜덤 이메일 생성 (중복 방지)
		const randomEmail = `test-${Date.now()}@typelegal.com`;

		const response = await request.get(`/api/auth/check-email?email=${encodeURIComponent(randomEmail)}`);

		expect(response.ok()).toBeTruthy();
		expect(await response.text()).toContain('사용 가능한 이메일입니다');
	});

	// 회원가입 테스트
	test('회원가입 API 테스트', async ({ request }) => {
		const response = await request.post('/api/auth/register', {
			data: {
				email: TEST_USER.email,
				password: TEST_USER.password,
				name: TEST_USER.name,
			},
		});

		expect(response.status()).toBe(201);
		const responseText = await response.text();
		expect(responseText).toContain('회원가입이 완료되었습니다');
	});

	// 로그인 테스트
	test('로그인 API 테스트', async ({ request }) => {
		const response = await request.post('/api/auth/login', {
			data: {
				email: TEST_USER.email,
				password: TEST_USER.password,
			},
		});

		expect(response.ok()).toBeTruthy();

		const responseData = await response.json();
		expect(responseData.token).toBeDefined();
		expect(responseData.email).toBe(TEST_USER.email);
		expect(responseData.name).toBe(TEST_USER.name);

		// 이후 테스트에서 사용할 토큰과 ID 저장
		authToken = responseData.token;
		userId = responseData.id;
	});

	// 내 정보 조회 테스트
	test('회원 정보 조회 API 테스트', async ({ request }) => {
		test.skip(!authToken, '로그인 테스트가 실패하여 토큰이 없습니다.');

		const response = await request.get(`/api/auth/me?email=${encodeURIComponent(TEST_USER.email)}`, {
			headers: {
				Authorization: `Bearer ${authToken}`,
			},
		});

		expect(response.ok()).toBeTruthy();
		const userData = await response.json();
		expect(userData.email).toBe(TEST_USER.email);
		expect(userData.name).toBe(TEST_USER.name);
	});

	// 잘못된 비밀번호로 로그인 테스트
	test('잘못된 비밀번호로 로그인 시 에러 반환', async ({ request }) => {
		const response = await request.post('/api/auth/login', {
			data: {
				email: TEST_USER.email,
				password: 'WrongPassword123!',
			},
		});

		expect(response.status()).toBe(401);
		const responseText = await response.text();
		expect(responseText).toContain('이메일 또는 비밀번호가 일치하지 않습니다');
	});
});
