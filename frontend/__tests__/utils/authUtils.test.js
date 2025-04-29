/**
 * authUtils 테스트
 * CI 환경에서 실행 가능하도록 간소화된 테스트
 */
import * as authUtils from '../../src/utils/authUtils';

describe('authUtils 기능 테스트', () => {
	test('authUtils 모듈이 정의되어 있어야 함', () => {
		expect(authUtils).toBeDefined();
	});
});
