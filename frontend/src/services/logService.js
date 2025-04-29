/**
 * 로그 관련 서비스
 * 각종 로그 데이터를 Wix CMS에 저장하는 기능을 제공합니다.
 */

// 개발 환경인지 확인
const isDev = process.env.NODE_ENV !== 'production';

// 로깅 유틸리티
const log = {
	debug: (...args) => isDev && console.log(...args),
	info: (...args) => console.info(...args),
	error: (...args) => console.error(...args),
	warn: (...args) => console.warn(...args),
};

/**
 * 로그 서비스
 * @type {Object}
 */
const logService = {
	/**
	 * 드래프트 로그를 기록합니다.
	 * @param {Object} data - 드래프트 로그 데이터
	 * @returns {Promise<Object>} 로그 저장 결과
	 */
	submitDraftLog: async data => {
		console.log('entered submitDraftLog');
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
	},

	/**
	 * 활동 로그를 기록합니다.
	 * @param {Object} data - 활동 로그 데이터
	 * @returns {Promise<Object>} 로그 저장 결과
	 */
	saveActivityLog: async data => {
		console.log('entered saveActivityLog', data);
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
				console.log(`Error: ${String(e)}`);
			});
	},

	/**
	 * 저장 로그를 기록합니다.
	 * @param {Object} data - 저장 로그 데이터
	 * @returns {Promise<Object>} 로그 저장 결과
	 */
	submitSaveLog: async data => {
		console.log('entered submitSaveLog');
		const apiUrlEndpoint = `https://conan.ai/_functions/submitSaveLog`;

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
	},

	/**
	 * 다운로드 로그를 기록합니다.
	 * @param {Object} data - 다운로드 로그 데이터
	 * @returns {Promise<Object>} 로그 저장 결과
	 */
	submitDownloadLog: async data => {
		console.log('entered submitDownloadLog');
		const apiUrlEndpoint = `https://conan.ai/_functions/submitDownloadLog`;

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
	},
};

export default logService;
