// Lodash 의존성 제거
// import _ from 'lodash';

// multiple object일 경우
export function replaceArray(myArray, objKey, newValue) {
	// Find index of specific object using findIndex method.
	const index = myArray.findIndex(o => o.key == objKey);
	// Update object's name property.
	if (index > -1) {
		myArray[index].value = newValue;
	}
	return myArray[index];
}

// 순수 JavaScript로 객체 배열 비교 함수 구현
function isArrayEqual(arr1, arr2) {
	if (arr1.length !== arr2.length) return false;

	for (let i = 0; i < arr1.length; i++) {
		if (arr1[i] !== arr2[i]) return false;
	}

	return true;
}

export function findItemsFromArray(arr, vals, key) {
	const items = [];

	for (let i = 0; i < arr.length; i++) {
		for (let j = 0; j < vals.length; j++) {
			if (Array.isArray(vals[j]) === true) {
				console.log('val이 Array인 경우');
				// 배열의 순서와 관계없이 내용이 같은지 확인
				// 양쪽 배열을 정렬하여 비교 (원본 배열은 수정하지 않음)
				const arrKeySorted = [...arr[i][key]].sort();
				const valsSorted = [...vals[j]].sort();

				if (isArrayEqual(arrKeySorted, valsSorted)) {
					items[items.length] = arr[i];
				}
			} else if (arr[i][key] == vals[j]) {
				console.log('val이 Array 아닌 경우');
				items[items.length] = arr[i];
			}
		}
	}
	return items;
}

// arr[] <-> val (returns unique "item" from index)
export function findItem(arr, val, key) {
	let index = arr.findIndex(e => e[key] == val);

	if (index > -1) {
		return arr[index];
	}
}

export function findItemIndex(arr, val, key) {
	let index = arr.findIndex(e => e[key] == val);

	if (index > -1) {
		return index;
	}
}

// arr[] <-> vals (returns all items[])
export function findAllItem(arr, val, key) {
	const items = [];
	const mapped_array = arr.map(function (x) {
		return x[key];
	});

	mapped_array.forEach((e, i) => {
		if (e == val) {
			items[items.length] = arr[i]; // items.push(arr[i]);
		}
	});
	return items;
}

// arr[] <-> vals[] (returns all indexes[])
export function findAllIndex(arr, val, key) {
	const indexes = [];
	const mapped_array = arr.map(function (x) {
		return x[key];
	});

	mapped_array.forEach((e, i) => {
		if (e == val) {
			indexes[indexes.length] = i; // indexes.push(i);
		}
	});
	return indexes;
}

// arr[] <-> vals[] (returns all "index" of matching value)
export function findIndexesFromArray(arr, vals, key) {
	const indexes = [];

	for (let i = 0; i < arr.length; i++) {
		for (let j = 0; j < vals.length; j++) {
			if (Array.isArray(vals[j]) === true) {
				console.log('val이 Array인 경우');
				// 배열의 순서와 관계없이 내용이 같은지 확인
				// 양쪽 배열을 정렬하여 비교 (원본 배열은 수정하지 않음)
				const arrKeySorted = [...arr[i][key]].sort();
				const valsSorted = [...vals[j]].sort();

				if (isArrayEqual(arrKeySorted, valsSorted)) {
					indexes[indexes.length] = i;
				}
			} else if (arr[i][key] == vals[j]) {
				console.log('val이 Array 아닌 경우');
				indexes[indexes.length] = i;
			}
		}
	}
	return indexes;
}

// multiple object일 경우
export function replaceValue(myArray, objKey, newValue) {
	// Find index of specific object using findIndex method.
	const index = myArray.findIndex(o => o.key == objKey);
	// Update object's name property.
	if (index > -1) {
		myArray[index].value = newValue;
		if ('highlight' in myArray[index]) {
			myArray[index].highlight = true;
		}
	}
}

export function replaceValue2(myArray, objKey, newValue) {
	// Find index of specific object using findIndex method.
	const index = myArray.findIndex(o => o.binding_key == objKey);
	// Update object's name property.
	if (index > -1) {
		myArray[index].value = newValue;
	}
}

/**
 * 객체 배열에서 특정 속성만 추출하여 객체로 반환
 * @param {Array} arr - 객체 배열
 * @returns {Object} 추출된 키와 값들을 포함한 객체
 */
export function getKeyAndValue(arr) {
	const keys = arr.map(item => item.key);
	const values = arr.map(item => item.value);
	const placeholder = arr.map(item => item.placeholder);

	return {
		keys,
		values,
		placeholder,
	};
}

/**
 * 객체 배열에서 id 값만 추출하여 배열로 반환
 * @param {Array} arr - 객체 배열
 * @returns {Array} id 값들의 배열
 */
export function getArrayOfKeys(arr) {
	return arr.map(item => item.id);
}

/**
 * 배열 내 중복 요소를 제거하여 고유한 값만 포함하는 배열 반환
 * @param {Array} arr - 입력 배열
 * @returns {Array} 중복이 제거된 배열
 */
export function uniqueArray(arr) {
	return [...new Set(arr)];
}

/**
 * 객체 배열을 정렬하는 함수
 * @param {Array} arr - 객체 배열
 * @param {Array} keys - 정렬 기준이 되는 키 배열 (우선순위 순서대로)
 * @param {Array} directions - 정렬 방향 배열 ('asc' 또는 'desc')
 * @returns {Array} 정렬된 객체 배열
 */
export function orderBy(arr, keys, directions) {
	if (!Array.isArray(arr) || arr.length === 0) return [];

	// 복사본 생성 (원본 변경 방지)
	const result = [...arr];

	return result.sort((a, b) => {
		for (let i = 0; i < keys.length; i++) {
			const key = keys[i];
			const direction = directions[i] === 'desc' ? -1 : 1;

			if (a[key] < b[key]) return -1 * direction;
			if (a[key] > b[key]) return 1 * direction;
		}
		return 0;
	});
}

/**
 * 객체 배열을 특정 키를 기준으로 그룹화
 * @param {Array} arr - 객체 배열
 * @param {Function} keySelector - 각 객체에서 그룹화 기준 키를 추출하는 함수
 * @returns {Object} 그룹화된 객체
 */
export function groupBy(arr, keySelector) {
	return arr.reduce((result, item) => {
		const key = typeof keySelector === 'function' ? keySelector(item) : item[keySelector] || '기본 정보';

		if (!result[key]) {
			result[key] = [];
		}

		result[key].push(item);
		return result;
	}, {});
}

// 기존 Array.prototype.unique 제거 (직접 함수 호출로 대체)
// Array.prototype.unique = function () {
// 	return Array.from(new Set(this));
// };

/**
 * 다차원 배열을 단일 배열로 평탄화
 *
 * @param {Array} arr - 중첩 배열
 * @returns {Array} 평탄화된 배열
 */
export function flatten(arr) {
	if (!Array.isArray(arr)) return [arr];

	return arr.reduce((acc, val) => acc.concat(Array.isArray(val) ? flatten(val) : val), []);
}
