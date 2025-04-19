/**
 * API 클라이언트 (최상위 모듈)
 * 모든 API 서비스를 통합하여 export 합니다.
 */

// 기본 HTTP 클라이언트
import httpClient from './services/httpClient';

// 각 도메인별 API 클라이언트
import draftingApi from './services/draftingApi';
import memberApi from './services/memberApi';
import templateApi from './services/templateApi';

// 기존 코드 호환성을 위한 export
export { draftingApi, memberApi, templateApi };

// 기본 export
export default {
	...httpClient,
	draftingApi,
	memberApi,
	templateApi,
};
