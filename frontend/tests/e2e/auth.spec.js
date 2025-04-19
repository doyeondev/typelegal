import { test, expect } from '@playwright/test';

// 테스트 사용자 정보
const TEST_USER = {
	email: 'test@typelegal.com',
	password: 'Test1234!',
	name: '테스트 사용자',
};

test.describe('인증 플로우 테스트', () => {
	test.beforeEach(async ({ page }) => {
		// 각 테스트 전에 홈페이지로 이동
		await page.goto('/');
	});

	test('로그인 페이지로 이동할 수 있어야 한다', async ({ page }) => {
		// 로그인 버튼 클릭
		await page.click('text=로그인');

		// 로그인 페이지로 이동했는지 확인
		await expect(page).toHaveURL('/login');

		// 로그인 페이지 요소 확인
		await expect(page.locator('h1:has-text("로그인")')).toBeVisible();
		await expect(page.locator('input[type="email"]')).toBeVisible();
		await expect(page.locator('input[type="password"]')).toBeVisible();
	});

	test('유효하지 않은 자격 증명으로 로그인 시 오류 메시지가 표시되어야 한다', async ({ page }) => {
		// 로그인 페이지로 이동
		await page.goto('/login');

		// 유효하지 않은 자격 증명 입력
		await page.fill('input[type="email"]', 'invalid@example.com');
		await page.fill('input[type="password"]', 'wrongpassword');

		// 로그인 버튼 클릭
		await page.click('button:has-text("로그인")');

		// 오류 메시지가 표시되는지 확인 (실제 앱의 오류 메시지에 맞게 조정 필요)
		await expect(page.locator('text=이메일 또는 비밀번호가 올바르지 않습니다')).toBeVisible();
	});

	test('회원가입 페이지로 이동할 수 있어야 한다', async ({ page }) => {
		// 로그인 페이지로 이동
		await page.goto('/login');

		// 회원가입 링크 클릭
		await page.click('text=회원가입');

		// 회원가입 페이지로 이동했는지 확인
		await expect(page).toHaveURL('/signup');

		// 회원가입 페이지 요소 확인
		await expect(page.locator('h1:has-text("회원가입")')).toBeVisible();
		await expect(page.locator('input[type="email"]')).toBeVisible();
		await expect(page.locator('input[type="password"]')).toBeVisible();
		await expect(page.locator('input[type="text"]')).toBeVisible();
	});

	test('비밀번호가 일치하지 않으면 회원가입이 진행되지 않아야 한다', async ({ page }) => {
		// 회원가입 페이지로 이동
		await page.goto('/signup');

		// 사용자 정보 입력 (비밀번호 불일치)
		await page.fill('input[type="email"]', TEST_USER.email);
		await page.fill('input[name="password"]', TEST_USER.password);
		await page.fill('input[name="confirmPassword"]', 'DifferentPassword123!');
		await page.fill('input[name="name"]', TEST_USER.name);

		// 동의 체크박스 선택
		await page.check('input[type="checkbox"]');

		// 회원가입 버튼 클릭
		await page.click('button:has-text("회원가입")');

		// 오류 메시지가 표시되는지 확인
		await expect(page.locator('text=비밀번호가 일치하지 않습니다')).toBeVisible();

		// 회원가입 페이지에 계속 머물러 있는지 확인
		await expect(page).toHaveURL('/signup');
	});
});
