/**
 * Ramda 라이브러리의 렌즈 및 set 기능을 대체하는 순수 JavaScript 유틸리티 함수들
 */

/**
 * 객체 속성을 업데이트하는 함수 (원본 변경 없이 새 객체 반환)
 * Ramda의 R.set(R.lensProp('prop'), value, obj) 대체
 *
 * @param {string} propName - 변경할 속성 이름
 * @param {any} value - 설정할 새 값
 * @param {Object} obj - 대상 객체
 * @returns {Object} 새로운 객체 (원본 변경 없음)
 */
export function setProp(propName, value, obj) {
	if (!obj || typeof obj !== 'object') return obj;
	return { ...obj, [propName]: value };
}

/**
 * 객체를 깊은 복사하는 함수 (중첩된 객체와 배열 모두 처리)
 * Ramda의 R.clone 대체
 *
 * @param {any} obj - 복사할 객체나 배열
 * @returns {any} 깊은 복사된 객체나 배열
 */
export function deepClone(obj) {
	if (obj === null || typeof obj !== 'object') {
		return obj;
	}

	// 날짜 객체인 경우
	if (obj instanceof Date) {
		return new Date(obj.getTime());
	}

	// 배열인 경우
	if (Array.isArray(obj)) {
		return obj.map(item => deepClone(item));
	}

	// 일반 객체인 경우
	const clonedObj = {};
	for (const key in obj) {
		if (Object.prototype.hasOwnProperty.call(obj, key)) {
			clonedObj[key] = deepClone(obj[key]);
		}
	}

	return clonedObj;
}

/**
 * 객체 배열에서 특정 조건에 맞는 첫 번째 객체의 인덱스 찾기
 *
 * @param {Array} arr - 객체 배열
 * @param {Function} predicate - 조건 함수
 * @returns {number} 찾은 항목의 인덱스 (없으면 -1)
 */
export function findIndexBy(arr, predicate) {
	if (!Array.isArray(arr)) return -1;

	for (let i = 0; i < arr.length; i++) {
		if (predicate(arr[i])) {
			return i;
		}
	}

	return -1;
}

/**
 * 배열에서 중복 제거 (Ramda의 R.uniq 대체)
 *
 * @param {Array} arr - 입력 배열
 * @returns {Array} 중복이 제거된 배열
 */
export function uniq(arr) {
	return [...new Set(arr)];
}

/**
 * 다차원 배열을 단일 배열로 평탄화 (Ramda의 R.flatten 대체)
 *
 * @param {Array} arr - 중첩 배열
 * @returns {Array} 평탄화된 배열
 */
export function flatten(arr) {
	return arr.reduce((acc, val) => acc.concat(Array.isArray(val) ? flatten(val) : val), []);
}
