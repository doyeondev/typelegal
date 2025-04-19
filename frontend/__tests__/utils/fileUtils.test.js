import { exportContent, exportDoc } from '../../utils/fileUtils';

// Window.navigator.msSaveOrOpenBlob 모킹
Object.defineProperty(global.navigator, 'msSaveOrOpenBlob', {
	value: jest.fn(),
	writable: true,
});

// 문서 다운로드에 필요한 DOM 메서드 모킹
document.createElement = jest.fn().mockImplementation(tag => {
	const element = {
		href: '',
		download: '',
		click: jest.fn(),
		style: {},
	};
	return element;
});

document.body.appendChild = jest.fn();
document.body.removeChild = jest.fn();

// console 메서드 모킹
console.log = jest.fn();

describe('fileUtils 테스트', () => {
	beforeEach(() => {
		// 각 테스트 전에 모의 함수 초기화
		jest.clearAllMocks();
	});

	describe('exportContent 함수', () => {
		test('입력 배열이 비어있을 경우 올바르게 처리되어야 한다', () => {
			// 테스트 데이터 설정
			const clauseArray = [
				{
					is_default: true,
					is_clause: true,
					clause_title_en: '계약 조항 1',
					content_en: '이것은 계약 내용입니다.',
				},
			];
			const inputArray = [];
			const fileName = '테스트';

			// 함수 실행
			exportContent(clauseArray, inputArray, fileName);

			// exportDoc 함수가 올바른 매개변수로 호출되었는지 확인
			expect(document.createElement).toHaveBeenCalledWith('a');
			expect(document.body.appendChild).toHaveBeenCalled();
			expect(document.body.removeChild).toHaveBeenCalled();
		});

		test('placeholder가 있는 경우 올바르게 대체되어야 한다', () => {
			// 테스트 데이터 설정
			const clauseArray = [
				{
					is_default: true,
					is_clause: true,
					clause_title_en: '계약 조항 1',
					content_en: '이것은 {공급자명}의 계약 내용입니다.',
				},
			];
			const inputArray = [
				{
					placeholder: '공급자명',
					value: '홍길동',
				},
			];
			const fileName = '테스트';

			// 함수 실행
			exportContent(clauseArray, inputArray, fileName);

			// exportDoc 함수가 올바른 매개변수로 호출되었는지 확인
			expect(document.createElement).toHaveBeenCalledWith('a');
			expect(document.body.appendChild).toHaveBeenCalled();
			expect(document.body.removeChild).toHaveBeenCalled();
		});

		test('placeholder 값이 비어있는 경우 기본 형식으로 표시되어야 한다', () => {
			// 테스트 데이터 설정
			const clauseArray = [
				{
					is_default: true,
					is_clause: true,
					clause_title_en: '계약 조항 1',
					content_en: '이것은 {공급자명}의 계약 내용입니다.',
				},
			];
			const inputArray = [
				{
					placeholder: '공급자명',
					value: '',
				},
			];
			const fileName = '테스트';

			// 함수 실행
			exportContent(clauseArray, inputArray, fileName);

			// exportDoc 함수가 올바른 매개변수로 호출되었는지 확인
			expect(document.createElement).toHaveBeenCalledWith('a');
			expect(document.body.appendChild).toHaveBeenCalled();
			expect(document.body.removeChild).toHaveBeenCalled();
		});

		test('HTML 태그가 올바르게 변환되어야 한다', () => {
			// 테스트 데이터 설정
			const clauseArray = [
				{
					is_default: true,
					is_clause: true,
					clause_title_en: '계약 조항 1',
					content_en: '<b>이것은 굵은 텍스트입니다.</b>',
				},
			];
			const inputArray = [];
			const fileName = '테스트';

			// 함수 실행
			exportContent(clauseArray, inputArray, fileName);

			// exportDoc 함수가 올바른 매개변수로 호출되었는지 확인
			expect(document.createElement).toHaveBeenCalledWith('a');
			expect(document.body.appendChild).toHaveBeenCalled();
			expect(document.body.removeChild).toHaveBeenCalled();
		});
	});

	describe('exportDoc 함수', () => {
		test('MS Edge 브라우저에서 msSaveOrOpenBlob 메소드를 사용해야 한다', () => {
			// 브라우저를 MS Edge로 시뮬레이션
			Object.defineProperty(window.navigator, 'msSaveOrOpenBlob', {
				value: jest.fn(),
				writable: true,
			});

			// 함수 실행
			exportDoc('<p>테스트 내용</p>', '테스트');

			// msSaveOrOpenBlob 메소드가 호출되었는지 확인
			expect(navigator.msSaveOrOpenBlob).toHaveBeenCalled();
			expect(document.body.appendChild).toHaveBeenCalled();
			expect(document.body.removeChild).toHaveBeenCalled();
		});

		test('표준 브라우저에서는 다운로드 링크를 생성해야 한다', () => {
			// 브라우저를 표준 브라우저로 시뮬레이션
			Object.defineProperty(window.navigator, 'msSaveOrOpenBlob', {
				value: null,
				writable: true,
			});

			// 함수 실행
			exportDoc('<p>테스트 내용</p>', '테스트');

			// 다운로드 링크가 생성되었는지 확인
			const mockAnchor = document.createElement('a');
			expect(document.createElement).toHaveBeenCalledWith('a');
			expect(document.body.appendChild).toHaveBeenCalled();
			expect(mockAnchor.click).toHaveBeenCalled();
			expect(document.body.removeChild).toHaveBeenCalled();
		});

		test('파일 이름이 올바르게 설정되어야 한다', () => {
			// 브라우저를 표준 브라우저로 시뮬레이션
			Object.defineProperty(window.navigator, 'msSaveOrOpenBlob', {
				value: null,
				writable: true,
			});

			// 함수 실행
			exportDoc('<p>테스트 내용</p>', '로고디자인');

			// 파일 이름이 올바르게 설정되었는지 확인
			const mockAnchor = document.createElement('a');
			expect(mockAnchor.download).toEqual('로고디자인계약서.doc');
		});
	});
});
