import _ from 'lodash';
import { replaceArray, findItemsFromArray, findItem, findItemIndex, findAllItem, findAllIndex, findIndexesFromArray, replaceValue, replaceValue2, getKeyAndValue, getArrayOfKeys } from '../../utils/arrayUtils';

// console.log 모킹
console.log = jest.fn();

describe('arrayUtils 테스트', () => {
	beforeEach(() => {
		// 각 테스트 전에 모의 함수 초기화
		jest.clearAllMocks();
	});

	describe('replaceArray 함수', () => {
		test('배열에서 특정 키를 가진 객체의 값을 변경해야 한다', () => {
			// 테스트 데이터 설정
			const testArray = [
				{ key: 'item1', value: 'value1' },
				{ key: 'item2', value: 'value2' },
				{ key: 'item3', value: 'value3' },
			];

			// 함수 실행
			const result = replaceArray(testArray, 'item2', 'newValue');

			// 예상 결과 확인
			expect(result).toEqual({ key: 'item2', value: 'newValue' });
			expect(testArray[1].value).toBe('newValue');
		});

		test('키가 존재하지 않는 경우 undefined를 반환해야 한다', () => {
			// 테스트 데이터 설정
			const testArray = [
				{ key: 'item1', value: 'value1' },
				{ key: 'item2', value: 'value2' },
			];

			// 함수 실행
			const result = replaceArray(testArray, 'nonexistent', 'newValue');

			// 예상 결과 확인
			expect(result).toBeUndefined();
		});
	});

	describe('findItemsFromArray 함수', () => {
		test('값 배열에 일치하는 항목을 모두 찾아야 한다', () => {
			// 테스트 데이터 설정
			const testArray = [
				{ id: 1, category: 'A' },
				{ id: 2, category: 'B' },
				{ id: 3, category: 'A' },
				{ id: 4, category: 'C' },
			];

			// 함수 실행
			const result = findItemsFromArray(testArray, ['A', 'C'], 'category');

			// 예상 결과 확인
			expect(result).toHaveLength(3);
			expect(result).toEqual(
				expect.arrayContaining([
					{ id: 1, category: 'A' },
					{ id: 3, category: 'A' },
					{ id: 4, category: 'C' },
				])
			);
			expect(console.log).toHaveBeenCalledWith('val이 Array 아닌 경우');
		});

		test('값이 배열인 경우 올바르게 처리해야 한다', () => {
			// 테스트 데이터 설정
			const testArray = [
				{ id: 1, tags: ['red', 'blue'] },
				{ id: 2, tags: ['green', 'yellow'] },
				{ id: 3, tags: ['blue', 'red'] }, // 순서가 다르지만 동일한 내용
				{ id: 4, tags: ['black'] },
			];

			// 함수 실행
			const result = findItemsFromArray(testArray, [['red', 'blue']], 'tags');

			// 예상 결과 확인
			expect(result).toHaveLength(2);
			expect(result).toEqual(
				expect.arrayContaining([
					{ id: 1, tags: ['red', 'blue'] },
					{ id: 3, tags: ['blue', 'red'] },
				])
			);
			expect(console.log).toHaveBeenCalledWith('val이 Array인 경우');
		});
	});

	describe('findItem 함수', () => {
		test('배열에서 특정 키와 값을 가진 첫 번째 항목을 반환해야 한다', () => {
			// 테스트 데이터 설정
			const testArray = [
				{ id: 1, name: 'John' },
				{ id: 2, name: 'Jane' },
				{ id: 3, name: 'John' },
			];

			// 함수 실행
			const result = findItem(testArray, 'John', 'name');

			// 예상 결과 확인
			expect(result).toEqual({ id: 1, name: 'John' });
		});

		test('일치하는 항목이 없는 경우 undefined를 반환해야 한다', () => {
			// 테스트 데이터 설정
			const testArray = [
				{ id: 1, name: 'John' },
				{ id: 2, name: 'Jane' },
			];

			// 함수 실행
			const result = findItem(testArray, 'Alice', 'name');

			// 예상 결과 확인
			expect(result).toBeUndefined();
		});
	});

	describe('findItemIndex 함수', () => {
		test('배열에서 특정 키와 값을 가진 첫 번째 항목의 인덱스를 반환해야 한다', () => {
			// 테스트 데이터 설정
			const testArray = [
				{ id: 1, name: 'John' },
				{ id: 2, name: 'Jane' },
				{ id: 3, name: 'John' },
			];

			// 함수 실행
			const result = findItemIndex(testArray, 'Jane', 'name');

			// 예상 결과 확인
			expect(result).toBe(1);
		});

		test('일치하는 항목이 없는 경우 undefined를 반환해야 한다', () => {
			// 테스트 데이터 설정
			const testArray = [
				{ id: 1, name: 'John' },
				{ id: 2, name: 'Jane' },
			];

			// 함수 실행
			const result = findItemIndex(testArray, 'Alice', 'name');

			// 예상 결과 확인
			expect(result).toBeUndefined();
		});
	});

	describe('findAllItem 함수', () => {
		test('배열에서 특정 키와 값을 가진 모든 항목을 반환해야 한다', () => {
			// 테스트 데이터 설정
			const testArray = [
				{ id: 1, status: 'active' },
				{ id: 2, status: 'inactive' },
				{ id: 3, status: 'active' },
				{ id: 4, status: 'active' },
			];

			// 함수 실행
			const result = findAllItem(testArray, 'active', 'status');

			// 예상 결과 확인
			expect(result).toHaveLength(3);
			expect(result).toEqual(
				expect.arrayContaining([
					{ id: 1, status: 'active' },
					{ id: 3, status: 'active' },
					{ id: 4, status: 'active' },
				])
			);
		});

		test('일치하는 항목이 없는 경우 빈 배열을 반환해야 한다', () => {
			// 테스트 데이터 설정
			const testArray = [
				{ id: 1, status: 'active' },
				{ id: 2, status: 'inactive' },
			];

			// 함수 실행
			const result = findAllItem(testArray, 'deleted', 'status');

			// 예상 결과 확인
			expect(result).toEqual([]);
		});
	});

	describe('findAllIndex 함수', () => {
		test('배열에서 특정 키와 값을 가진 모든 항목의 인덱스를 반환해야 한다', () => {
			// 테스트 데이터 설정
			const testArray = [
				{ id: 1, category: 'food' },
				{ id: 2, category: 'tech' },
				{ id: 3, category: 'food' },
				{ id: 4, category: 'food' },
			];

			// 함수 실행
			const result = findAllIndex(testArray, 'food', 'category');

			// 예상 결과 확인
			expect(result).toEqual([0, 2, 3]);
		});

		test('일치하는 항목이 없는 경우 빈 배열을 반환해야 한다', () => {
			// 테스트 데이터 설정
			const testArray = [
				{ id: 1, category: 'food' },
				{ id: 2, category: 'tech' },
			];

			// 함수 실행
			const result = findAllIndex(testArray, 'clothing', 'category');

			// 예상 결과 확인
			expect(result).toEqual([]);
		});
	});

	describe('findIndexesFromArray 함수', () => {
		test('여러 값에 대해 배열에서 일치하는 모든 항목의 인덱스를 반환해야 한다', () => {
			// 테스트 데이터 설정
			const testArray = [
				{ id: 1, type: 'A' },
				{ id: 2, type: 'B' },
				{ id: 3, type: 'C' },
				{ id: 4, type: 'A' },
			];

			// 함수 실행
			const result = findIndexesFromArray(testArray, ['A', 'C'], 'type');

			// 예상 결과 확인
			expect(result).toEqual([0, 2, 3]);
			expect(console.log).toHaveBeenCalledWith('val이 Array 아닌 경우');
		});

		test('값이 배열인 경우 올바르게 처리해야 한다', () => {
			// 테스트 데이터 설정
			const testArray = [
				{ id: 1, colors: ['red', 'blue'] },
				{ id: 2, colors: ['green'] },
				{ id: 3, colors: ['blue', 'red'] }, // 순서가 다르지만 동일한 내용
				{ id: 4, colors: ['yellow'] },
			];

			// 함수 실행
			const result = findIndexesFromArray(testArray, [['red', 'blue']], 'colors');

			// 예상 결과 확인
			expect(result).toEqual([0, 2]);
			expect(console.log).toHaveBeenCalledWith('val이 Array인 경우');
		});
	});

	describe('replaceValue 함수', () => {
		test('배열에서 특정 키를 가진 객체의 값을 변경해야 한다', () => {
			// 테스트 데이터 설정
			const testArray = [
				{ key: 'item1', value: 'value1' },
				{ key: 'item2', value: 'value2' },
				{ key: 'item3', value: 'value3' },
			];

			// 함수 실행
			replaceValue(testArray, 'item2', 'newValue');

			// 예상 결과 확인
			expect(testArray[1].value).toBe('newValue');
		});

		test('highlight 속성이 있는 경우 highlight를 true로 설정해야 한다', () => {
			// 테스트 데이터 설정
			const testArray = [
				{ key: 'item1', value: 'value1', highlight: false },
				{ key: 'item2', value: 'value2', highlight: false },
			];

			// 함수 실행
			replaceValue(testArray, 'item2', 'newValue');

			// 예상 결과 확인
			expect(testArray[1].value).toBe('newValue');
			expect(testArray[1].highlight).toBe(true);
		});
	});

	describe('replaceValue2 함수', () => {
		test('배열에서 특정 binding_key를 가진 객체의 값을 변경해야 한다', () => {
			// 테스트 데이터 설정
			const testArray = [
				{ binding_key: 'key1', value: 'value1' },
				{ binding_key: 'key2', value: 'value2' },
				{ binding_key: 'key3', value: 'value3' },
			];

			// 함수 실행
			replaceValue2(testArray, 'key2', 'newValue');

			// 예상 결과 확인
			expect(testArray[1].value).toBe('newValue');
		});
	});

	describe('getKeyAndValue 함수', () => {
		test('배열에서 key, value, placeholder 속성을 추출해야 한다', () => {
			// 테스트 데이터 설정
			const testArray = [
				{ key: 'key1', value: 'value1', placeholder: 'place1' },
				{ key: 'key2', value: 'value2', placeholder: 'place2' },
			];

			// 함수 실행
			const result = getKeyAndValue(testArray);

			// 예상 결과 확인
			expect(result).toEqual({
				keys: ['key1', 'key2'],
				values: ['value1', 'value2'],
				placeholder: ['place1', 'place2'],
			});
		});
	});

	describe('getArrayOfKeys 함수', () => {
		test('배열에서 id 속성만 추출해야 한다', () => {
			// 테스트 데이터 설정
			const testArray = [
				{ id: 1, name: 'Item 1' },
				{ id: 2, name: 'Item 2' },
				{ id: 3, name: 'Item 3' },
			];

			// 함수 실행
			const result = getArrayOfKeys(testArray);

			// 예상 결과 확인
			expect(result).toEqual([1, 2, 3]);
		});
	});

	describe('Array.prototype.unique 함수', () => {
		test('배열에서 중복된 요소를 제거해야 한다', () => {
			// 테스트 데이터 설정
			const testArray = [1, 2, 2, 3, 3, 3, 4];

			// 함수 실행
			const result = testArray.unique();

			// 예상 결과 확인
			expect(result).toEqual([1, 2, 3, 4]);
		});

		test('빈 배열인 경우 빈 배열을 반환해야 한다', () => {
			// 테스트 데이터 설정
			const testArray = [];

			// 함수 실행
			const result = testArray.unique();

			// 예상 결과 확인
			expect(result).toEqual([]);
		});
	});
});
