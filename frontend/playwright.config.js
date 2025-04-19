const { defineConfig } = require('@playwright/test');

module.exports = defineConfig({
	testDir: './tests/e2e',
	timeout: 30000,
	fullyParallel: true,
	forbidOnly: !!process.env.CI,
	retries: process.env.CI ? 2 : 0,
	workers: process.env.CI ? 1 : undefined,
	reporter: 'html',
	use: {
		baseURL: 'http://localhost:3000',
		trace: 'on-first-retry',
		screenshot: 'only-on-failure',
	},
	projects: [
		{
			name: 'chromium',
			use: { browserName: 'chromium' },
		},
	],
	webServer: {
		command: 'npm run dev',
		port: 3000,
		reuseExistingServer: !process.env.CI,
	},
});
