import { test, expect } from '@playwright/test';

const TEST_USER = {
	email: 'test@typelegal.io',
	password: 'test1234!',
};

test.describe('드래프트 문서 작성 흐름 테스트', () => {
	test.beforeEach(async ({ page }) => {
		await page.goto('/login');
		await page.fill('input[type="email"]', TEST_USER.email);
		await page.fill('input[type="password"]', TEST_USER.password);
		await page.click('button:has-text("로그인")');
		await page.waitForURL('/dashboard');
	});

	test('질문에 답변하면 조항 미리보기에 반영되어야 한다', async ({ page }) => {
		// 특정 템플릿으로 이동
		await page.goto('/draft/logo'); // `freelance` 대신 실제 존재하는 타입으로

		// 질문 섹션에서 첫 질문 입력
		const firstInput = await page.locator('input[name^="_"]').first(); // 첫 input 찾기
		await firstInput.fill('김도연');

		// 조항 미리보기에 반영됐는지 확인 (예: 이름이 조항에 뜨는지)
		await expect(page.locator('.drafted')).toContainText('김도연');
	});

	test('텍스트 입력이 동작해야 한다', async ({ page }) => {
		await page.goto('/draft/sample-type');
		await page.getByPlaceholder('성명 입력').fill('홍길동');
		await expect(page.getByPlaceholder('성명 입력')).toHaveValue('홍길동');
	});

	test('라디오, 체크박스, 날짜 선택이 동작해야 한다', async ({ page }) => {
		await page.goto('/draft/sample-type');
		await page.getByLabel('동의함').check();
		await page.getByLabel('추가 옵션').check();
		await page.locator('input[type="date"]').fill('2025-12-31');
	});

	test('워드 파일이 정상적으로 다운로드돼야 한다', async ({ page }) => {
		await page.goto('/draft/sample-type');
		const [download] = await Promise.all([page.waitForEvent('download'), page.getByText('내보내기').click()]);
		expect((await download.suggestedFilename()).endsWith('.docx')).toBeTruthy();
	});

	test('저장 버튼 클릭 시 200 응답을 받아야 한다', async ({ page }) => {
		await page.goto('/draft/sample-type');
		const [response] = await Promise.all([page.waitForResponse(res => res.url().includes('/api/draft/save') && res.status() === 200), page.getByText('저장').click()]);
		expect(response.ok()).toBeTruthy();
	});
});
