import { returnCurrencyValue, returnCheckboxValue, returnInputValue } from '../../utils/inputUtils';

// numberUtils 모킹
jest.mock('../../utils/numberUtils', () => ({
	num2han: jest.fn(val => `${val}원`),
}));

// console 메서드 모킹
console.log = jest.fn();

describe('inputUtils 테스트', () => {
	beforeEach(() => {
		// 각 테스트 전에 모의 함수 초기화
		jest.clearAllMocks();
	});

	describe('returnCurrencyValue 함수', () => {
		test('숫자를 올바른 통화 형식으로 변환해야 한다', () => {
			// 테스트 데이터 설정
			const event = {
				target: {
					value: '1000',
				},
			};

			// 함수 실행
			const result = returnCurrencyValue(event);

			// 결과 확인
			expect(result).toBe('1,000 (1000원)');
			expect(console.log).toHaveBeenCalled();
		});

		test('콤마가 포함된 숫자를 올바르게 처리해야 한다', () => {
			// 테스트 데이터 설정
			const event = {
				target: {
					value: '1,000,000',
				},
			};

			// 함수 실행
			const result = returnCurrencyValue(event);

			// 결과 확인
			expect(result).toBe('1,000,000 (1000000원)');
			expect(console.log).toHaveBeenCalled();
		});

		test('숫자가 아닌 입력은 그대로 반환해야 한다', () => {
			// 테스트 데이터 설정
			const event = {
				target: {
					value: '천만원',
				},
			};

			// 함수 실행
			const result = returnCurrencyValue(event);

			// 결과 확인
			expect(result).toBe('천만원');
			expect(console.log).not.toHaveBeenCalled();
		});

		test('빈 문자열 입력은 그대로 반환해야 한다', () => {
			// 테스트 데이터 설정
			const event = {
				target: {
					value: '',
				},
			};

			// 함수 실행
			const result = returnCurrencyValue(event);

			// 결과 확인
			expect(result).toBe('');
			expect(console.log).not.toHaveBeenCalled();
		});

		test('숫자와 문자가 혼합된 입력은 그대로 반환해야 한다', () => {
			// 테스트 데이터 설정
			const event = {
				target: {
					value: '123abc',
				},
			};

			// 함수 실행
			const result = returnCurrencyValue(event);

			// 결과 확인
			expect(result).toBe('123abc');
			expect(console.log).not.toHaveBeenCalled();
		});
	});

	describe('returnCheckboxValue 함수', () => {
		test('숫자를 올바른 통화 형식으로 변환해야 한다', () => {
			// 테스트 데이터 설정
			const event = {
				target: {
					value: '2000',
				},
			};

			// 함수 실행
			const result = returnCheckboxValue(event);

			// 결과 확인
			expect(result).toBe('2,000 (2000원)');
			expect(console.log).toHaveBeenCalled();
		});

		test('콤마가 포함된 숫자를 올바르게 처리해야 한다', () => {
			// 테스트 데이터 설정
			const event = {
				target: {
					value: '2,000,000',
				},
			};

			// 함수 실행
			const result = returnCheckboxValue(event);

			// 결과 확인
			expect(result).toBe('2,000,000 (2000000원)');
			expect(console.log).toHaveBeenCalled();
		});

		test('숫자가 아닌 입력은 undefined를 반환해야 한다', () => {
			// 테스트 데이터 설정
			const event = {
				target: {
					value: '천만원',
				},
			};

			// 함수 실행
			const result = returnCheckboxValue(event);

			// 결과 확인
			expect(result).toBeUndefined();
			expect(console.log).not.toHaveBeenCalled();
		});

		test('빈 문자열 입력은 undefined를 반환해야 한다', () => {
			// 테스트 데이터 설정
			const event = {
				target: {
					value: '',
				},
			};

			// 함수 실행
			const result = returnCheckboxValue(event);

			// 결과 확인
			expect(result).toBeUndefined();
			expect(console.log).not.toHaveBeenCalled();
		});
	});

	describe('returnInputValue 함수', () => {
		test('text 타입 입력에 대해 올바른 값을 반환해야 한다', () => {
			// 테스트 데이터 설정
			const event = {
				target: {
					type: 'text',
					value: '테스트 입력',
				},
			};

			// 함수 실행
			const result = returnInputValue(event);

			// 결과 확인
			expect(result).toBe('테스트 입력');
		});

		test('select 타입 입력에 대해 올바른 값을 반환해야 한다', () => {
			// 테스트 데이터 설정
			const event = {
				target: {
					toString: () => 'HTMLSelectElement',
					selectedIndex: 1,
					options: [{ value: '옵션1' }, { value: '옵션2' }, { value: '옵션3' }],
				},
			};

			// 함수 실행
			const result = returnInputValue(event);

			// 결과 확인
			expect(result).toBe('옵션2');
		});

		test('date 타입 입력에 대해 올바른 값을 반환해야 한다', () => {
			// 테스트 데이터 설정
			const event = {
				target: {
					type: 'date',
					value: '2023-05-01',
				},
			};

			// 함수 실행
			const result = returnInputValue(event);

			// 결과 확인
			expect(result).toBe('2023-05-01');
		});

		test('radio 타입 입력에 대해 올바른 값을 반환해야 한다', () => {
			// 테스트 데이터 설정
			const event = {
				target: {
					type: 'radio',
					value: '선택옵션',
				},
			};

			// 함수 실행
			const result = returnInputValue(event);

			// 결과 확인
			expect(result).toBe('선택옵션');
		});

		test('checkbox 타입 입력에 대해 올바른 값을 반환해야 한다', () => {
			// 테스트 데이터 설정
			document.querySelectorAll = jest.fn().mockReturnValue([{ value: '옵션1' }, { value: '옵션2' }]);

			const event = {
				target: {
					type: 'checkbox',
					name: 'checkboxGroup',
				},
			};

			// 함수 실행
			const result = returnInputValue(event);

			// 결과 확인
			expect(result).toBe('옵션1, 옵션2');
			expect(document.querySelectorAll).toHaveBeenCalledWith('[name=checkboxGroup]:checked');
		});

		test('checkboxList 타입 입력에 대해 올바른 값을 반환해야 한다', () => {
			// 테스트 데이터 설정
			document.querySelectorAll = jest.fn().mockReturnValue([{ value: '리스트옵션1' }, { value: '리스트옵션2' }]);

			const event = {
				target: {
					type: 'checkboxList',
					name: 'checkboxListGroup',
				},
			};

			// 함수 실행
			const result = returnInputValue(event);

			// 결과 확인
			expect(result).toBe('- 리스트옵션1<br>- 리스트옵션2');
			expect(document.querySelectorAll).toHaveBeenCalledWith('[name=checkboxListGroup]:checked');
		});

		test('select 타입에서 선택된 옵션이 없을 때 undefined를 반환해야 한다', () => {
			const event = {
				target: {
					toString: () => 'HTMLSelectElement',
					selectedIndex: -1,
					options: [{ value: '옵션1' }, { value: '옵션2' }],
				},
			};

			const result = returnInputValue(event);

			expect(result).toBeUndefined();
		});

		test('checkbox 타입에서 선택된 항목이 없을 때 빈 문자열을 반환해야 한다', () => {
			document.querySelectorAll = jest.fn().mockReturnValue([]);

			const event = {
				target: {
					type: 'checkbox',
					name: 'emptyCheckboxGroup',
				},
			};

			const result = returnInputValue(event);

			expect(result).toBe('');
			expect(document.querySelectorAll).toHaveBeenCalledWith('[name=emptyCheckboxGroup]:checked');
		});

		test('checkboxList 타입에서 선택된 항목이 없을 때 빈 문자열을 반환해야 한다', () => {
			document.querySelectorAll = jest.fn().mockReturnValue([]);

			const event = {
				target: {
					type: 'checkboxList',
					name: 'emptyCheckboxListGroup',
				},
			};

			const result = returnInputValue(event);

			expect(result).toBe('');
			expect(document.querySelectorAll).toHaveBeenCalledWith('[name=emptyCheckboxListGroup]:checked');
		});

		test('지원되지 않는 입력 타입에 대해 undefined를 반환해야 한다', () => {
			const event = {
				target: {
					type: 'unsupportedType',
					value: '테스트 값',
				},
			};

			const result = returnInputValue(event);

			expect(result).toBeUndefined();
		});
	});
});
