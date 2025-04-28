/**
 * 스토리지 클라이언트
 * 로컬 스토리지와 세션 스토리지에 대한 접근을 추상화
 */

/**
 * 로컬 스토리지 관련 유틸리티
 */
export const localStorageClient = {
	/**
	 * 로컬 스토리지에 데이터 저장
	 * @param {string} key - 키
	 * @param {any} value - 저장할 값
	 */
	set: (key, value) => {
		if (typeof window === 'undefined') return;
		try {
			const serializedValue = typeof value === 'object' ? JSON.stringify(value) : value;
			localStorage.setItem(key, serializedValue);
		} catch (error) {
			console.error('로컬 스토리지 저장 실패:', error);
		}
	},

	/**
	 * 로컬 스토리지에서 데이터 조회
	 * @param {string} key - 키
	 * @param {boolean} parseJSON - JSON 파싱 여부
	 * @returns {any} 저장된 값
	 */
	get: (key, parseJSON = true) => {
		if (typeof window === 'undefined') return null;
		try {
			const value = localStorage.getItem(key);
			if (!value) return null;

			if (parseJSON) {
				try {
					return JSON.parse(value);
				} catch {
					return value;
				}
			}
			return value;
		} catch (error) {
			console.error('로컬 스토리지 조회 실패:', error);
			return null;
		}
	},

	/**
	 * 로컬 스토리지에서 데이터 삭제
	 * @param {string} key - 키
	 */
	remove: key => {
		if (typeof window === 'undefined') return;
		try {
			localStorage.removeItem(key);
		} catch (error) {
			console.error('로컬 스토리지 삭제 실패:', error);
		}
	},

	/**
	 * 로컬 스토리지 전체 삭제
	 */
	clear: () => {
		if (typeof window === 'undefined') return;
		try {
			localStorage.clear();
		} catch (error) {
			console.error('로컬 스토리지 초기화 실패:', error);
		}
	},
};

/**
 * 세션 스토리지 관련 유틸리티
 */
export const sessionStorageClient = {
	/**
	 * 세션 스토리지에 데이터 저장
	 * @param {string} key - 키
	 * @param {any} value - 저장할 값
	 */
	set: (key, value) => {
		if (typeof window === 'undefined') return;
		try {
			const serializedValue = typeof value === 'object' ? JSON.stringify(value) : value;
			sessionStorage.setItem(key, serializedValue);
		} catch (error) {
			console.error('세션 스토리지 저장 실패:', error);
		}
	},

	/**
	 * 세션 스토리지에서 데이터 조회
	 * @param {string} key - 키
	 * @param {boolean} parseJSON - JSON 파싱 여부
	 * @returns {any} 저장된 값
	 */
	get: (key, parseJSON = true) => {
		if (typeof window === 'undefined') return null;
		try {
			const value = sessionStorage.getItem(key);
			if (!value) return null;

			if (parseJSON) {
				try {
					return JSON.parse(value);
				} catch {
					return value;
				}
			}
			return value;
		} catch (error) {
			console.error('세션 스토리지 조회 실패:', error);
			return null;
		}
	},

	/**
	 * 세션 스토리지에서 데이터 삭제
	 * @param {string} key - 키
	 */
	remove: key => {
		if (typeof window === 'undefined') return;
		try {
			sessionStorage.removeItem(key);
		} catch (error) {
			console.error('세션 스토리지 삭제 실패:', error);
		}
	},

	/**
	 * 세션 스토리지 전체 삭제
	 */
	clear: () => {
		if (typeof window === 'undefined') return;
		try {
			sessionStorage.clear();
		} catch (error) {
			console.error('세션 스토리지 초기화 실패:', error);
		}
	},
};

export default {
	local: localStorageClient,
	session: sessionStorageClient,
};
