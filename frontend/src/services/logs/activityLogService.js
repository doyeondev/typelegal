/**
 * 활동 로그 관련 서비스 함수
 */
import apiClient from '../../libs/apiClient';

/**
 * 활동 로그 기록 함수
 * @param {Object} data - 활동 로그 데이터
 * @returns {Promise<any>} API 응답
 */
export async function post_activityLog(data) {
	console.log('활동 로그 기록 요청:', data);

	try {
		// 기존 코드와 호환성을 위해 데이터 형식 유지
		// 하지만 이제 내부 API를 호출합니다
		return await apiClient.post('/api/logs/docActivity', {
			documentId: data.documentId || data.contractId || 'unknown',
			action: data.action || data.status || 'view',
			userId: data.userEmail,
			metadata: data,
		});
	} catch (error) {
		console.error('활동 로그 기록 실패:', error);
		throw error;
	}
}

/**
 * 이전 형식 호환을 위한 함수 (외부 API 호출)
 * @deprecated - 가능한 위의 함수를 사용하세요
 */
export async function post_activityLog_legacy(data) {
	console.log('entered post_activityLog (legacy)', data);
	const apiUrlEndpoint = `https://conan.ai/_functions/saveActivityLog`;

	const body = JSON.stringify({
		data: data,
	});

	return fetch(apiUrlEndpoint, {
		method: 'post',
		body,
	})
		.then(response => {
			console.log('response', response);
			if (response.ok) {
				return response.json();
			}
			return Promise.reject('fetch to wix function has failed ' + response.status);
		})
		.catch(e => {
			console.log(`Error :  ${String(e)}`);
		});
}
