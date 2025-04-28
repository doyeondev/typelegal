/**
 * 드래프트 로그 관련 서비스 함수
 */
import apiClient from '../../libs/apiClient';

/**
 * 드래프트 로그 기록 함수
 * @param {Object} data - 드래프트 로그 데이터
 * @returns {Promise<any>} API 응답
 */
export async function post_draftLog(data) {
	console.log('드래프트 로그 기록 요청:', data);

	try {
		// 기존 호환성 유지를 위해 외부 API 호출 방식 그대로 사용
		const apiUrlEndpoint = `https://conan.ai/_functions/submitDraftLog`;

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
				console.log(`Error: ${String(e)}`);
			});
	} catch (error) {
		console.error('드래프트 로그 기록 실패:', error);
		throw error;
	}
}

/**
 * 내부 API를 사용하는 새 버전 함수 (미래 사용을 위해 준비)
 * @param {Object} data - 드래프트 로그 데이터
 * @returns {Promise<any>} API 응답
 */
export async function postDraftLog(data) {
	console.log('드래프트 로그 기록 요청 (내부 API):', data);

	try {
		return await apiClient.post('/api/logs/docDraft', {
			documentId: data.contractId,
			status: data.status,
			category: data.category,
			title: data.title,
			userName: data.userName,
			userEmail: data.userEmail,
		});
	} catch (error) {
		console.error('드래프트 로그 기록 실패:', error);
		throw error;
	}
}
