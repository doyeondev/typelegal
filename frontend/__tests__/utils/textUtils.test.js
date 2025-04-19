import { replaceMulCharInString, removeHighlight, splice } from '../../utils/textUtils';

describe('textUtils 테스트', () => {
	describe('replaceMulCharInString 함수', () => {
		test('입력된 키에 해당하는 텍스트가 올바르게 변경되어야 한다', () => {
			// 테스트 데이터 설정
			const string = '<span id="span_key1" class="draft">[플레이스홀더1]</span>와 <span id="span_key2" class="draft">[플레이스홀더2]</span>';
			const input = {
				keys: ['key1', 'key2'],
				values: ['값1', '값2'],
				placeholder: ['플레이스홀더1', '플레이스홀더2'],
			};
			const tracerKey = 'key1';

			// 함수 실행
			const result = replaceMulCharInString(string, input, tracerKey);

			// 결과 확인
			expect(result).toBe('<span id="span_key1" class="variable">값1</span>와 <span id="span_key2" class="drafted">값2</span>');
		});

		test('값이 비어있는 경우 치환되지 않아야 한다', () => {
			// 테스트 데이터 설정
			const string = '<span id="span_key1" class="draft">[플레이스홀더1]</span>와 <span id="span_key2" class="draft">[플레이스홀더2]</span>';
			const input = {
				keys: ['key1', 'key2'],
				values: ['', '값2'],
				placeholder: ['플레이스홀더1', '플레이스홀더2'],
			};
			const tracerKey = 'key1';

			// 함수 실행
			const result = replaceMulCharInString(string, input, tracerKey);

			// 결과 확인
			expect(result).toBe('<span id="span_key1" class="draft">[플레이스홀더1]</span>와 <span id="span_key2" class="drafted">값2</span>');
		});
	});

	describe('removeHighlight 함수', () => {
		test('하이라이트된 텍스트가 올바르게 변경되어야 한다', () => {
			// 테스트 데이터 설정
			const string = '<span id="span_key1" class="variable">값1</span>와 <span id="span_key2" class="variable">값2</span>';
			const input = {
				keys: ['key1', 'key2'],
				values: ['값1', '값2'],
			};

			// 함수 실행
			const result = removeHighlight(string, input);

			// 결과 확인
			expect(result).toBe('<span id="span_key1" class="drafted">값1</span>와 <span id="span_key2" class="drafted">값2</span>');
		});

		test('값이 비어있는 경우 치환되지 않아야 한다', () => {
			// 테스트 데이터 설정
			const string = '<span id="span_key1" class="variable">값1</span>와 <span id="span_key2" class="variable">값2</span>';
			const input = {
				keys: ['key1', 'key2'],
				values: ['', '값2'],
			};

			// 함수 실행
			const result = removeHighlight(string, input);

			// 결과 확인
			expect(result).toBe('<span id="span_key1" class="variable">값1</span>와 <span id="span_key2" class="drafted">값2</span>');
		});
	});

	describe('splice 함수', () => {
		test('문자열의 특정 위치에 다른 문자열을 삽입해야 한다', () => {
			// 테스트 데이터 설정
			const str = '안녕하세요';
			const addString = ', ';
			const idx = 5;

			// 함수 실행
			const result = splice(str, addString, idx);

			// 결과 확인
			expect(result).toBe('안녕하세요, ');
		});

		test('문자열의 시작 위치에 다른 문자열을 삽입해야 한다', () => {
			// 테스트 데이터 설정
			const str = '안녕하세요';
			const addString = '여러분, ';
			const idx = 0;

			// 함수 실행
			const result = splice(str, addString, idx);

			// 결과 확인
			expect(result).toBe('여러분, 안녕하세요');
		});

		test('문자열의 중간 위치에 다른 문자열을 삽입해야 한다', () => {
			// 테스트 데이터 설정
			const str = '안녕하세요';
			const addString = '여러분 ';
			const idx = 2;

			// 함수 실행
			const result = splice(str, addString, idx);

			// 결과 확인
			expect(result).toBe('안녕여러분 하세요');
		});
	});
});
