// playwright.config.js
// @ts-check
const { defineConfig } = require('@playwright/test');

/**
 * @see https://playwright.dev/docs/test-configuration
 */
module.exports = defineConfig({
	testDir: './',
	timeout: 30000,
	fullyParallel: true,
	forbidOnly: !!process.env.CI,
	retries: process.env.CI ? 2 : 0,
	workers: process.env.CI ? 1 : undefined,
	reporter: 'html',
	use: {
		baseURL: process.env.API_BASE_URL || 'http://localhost:8082',
		trace: 'on-first-retry',
		extraHTTPHeaders: {
			Accept: 'application/json',
		},
	},
});
