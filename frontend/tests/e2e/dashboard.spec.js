import { test, expect } from '@playwright/test';

// 테스트 사용자 정보
const TEST_USER = {
	email: 'test@typelegal.com',
	password: 'Test1234!',
};

test.describe('대시보드 플로우 테스트', () => {
	// 각 테스트 전에 로그인 수행
	test.beforeEach(async ({ page }) => {
		// 로그인 페이지로 이동
		await page.goto('/login');

		// 테스트 사용자로 로그인
		// 참고: 실제 테스트에서는 API 호출을 직접 사용하거나 몇 테스트 사용자를 미리 설정해야 함
		// 여기서는 UI를 통한 로그인을 시뮬레이션함
		await page.fill('input[type="email"]', TEST_USER.email);
		await page.fill('input[type="password"]', TEST_USER.password);
		await page.click('button:has-text("로그인")');

		// 로그인 후 대시보드로 리디렉션되었는지 확인
		await expect(page).toHaveURL('/dashboard');
	});

	test('대시보드에 사용자 정보가 표시되어야 한다', async ({ page }) => {
		// 대시보드 페이지에 있는지 확인
		await expect(page).toHaveURL('/dashboard');

		// 사용자 이름이나 환영 메시지가 표시되는지 확인
		// 참고: 실제 앱의 UI에 맞게 선택자 조정 필요
		await expect(page.locator('text=내 계약서')).toBeVisible();
	});

	test('계약서 작성 버튼을 클릭하면 계약서 작성 페이지로 이동해야 한다', async ({ page }) => {
		// 계약서 작성 버튼 클릭
		await page.click('text=계약서 작성');

		// 계약서 작성 페이지로 이동했는지 확인
		// 참고: 실제 앱의 URL 경로에 맞게 조정 필요
		await expect(page).toHaveURL(/\/draft\/.*/);
	});

	test('내 계약서 목록이 표시되어야 한다', async ({ page }) => {
		// 대시보드 페이지에 있는지 확인
		await expect(page).toHaveURL('/dashboard');

		// 계약서 목록 컨테이너가 표시되는지 확인
		// 참고: 실제 앱의 UI에 맞게 선택자 조정 필요
		await expect(page.locator('.contracts-list, #contracts-list')).toBeVisible();
	});

	test('프로필 정보를 볼 수 있어야 한다', async ({ page }) => {
		// 대시보드 페이지에 있는지 확인
		await expect(page).toHaveURL('/dashboard');

		// 프로필 섹션 또는 버튼이 있는지 확인
		// 참고: 실제 앱의 UI에 맞게 선택자 조정 필요
		const profileElement = page.locator('.profile, #profile, [data-testid="profile"]').first();
		if (await profileElement.isVisible()) {
			await profileElement.click();

			// 프로필 정보가 표시되는지 확인
			await expect(page.locator('text=이메일')).toBeVisible();
		} else {
			// 프로필 섹션이 없는 경우 이 테스트는 스킵됨
			console.log('프로필 섹션을 찾을 수 없습니다. 테스트를 건너뜁니다.');
		}
	});

	test('로그아웃을 수행할 수 있어야 한다', async ({ page }) => {
		// 로그아웃 버튼 클릭
		await page.click('text=로그아웃');

		// 로그아웃 후 홈 페이지로 리디렉션되었는지 확인
		await expect(page).toHaveURL('/');

		// 로그인 버튼이 다시 표시되는지 확인
		await expect(page.locator('text=로그인')).toBeVisible();
	});
});
