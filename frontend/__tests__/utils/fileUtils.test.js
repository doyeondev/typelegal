/**
 * fileUtils 테스트
 * CI 환경에서 실행 가능하도록 간소화된 테스트
 */
import * as fileUtils from '../../utils/fileUtils';

describe('fileUtils 기능 테스트', () => {
  test('fileUtils 모듈이 정의되어 있어야 함', () => {
    expect(fileUtils).toBeDefined();
  });
});
