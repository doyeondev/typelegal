import { formatDate, getYearMonthDay, findWeekday, calculateDiffDays, calculateDuration, getToday } from '../../utils/dateUtils';

/**
 * dateUtils 테스트
 * 날짜 관련 유틸리티 함수들의 기능을 검증합니다.
 */
describe('dateUtils 테스트', () => {
	// 원본 Date 저장
	const RealDate = global.Date;
	const fixedDate = new Date('2023-06-15T12:00:00Z');

	beforeEach(() => {
		jest.clearAllMocks();

		// Date 모킹 설정 - 안전한 방식으로 모킹
		global.Date = function (...args) {
			if (args.length === 0) {
				return fixedDate;
			}
			return new RealDate(...args);
		};
		global.Date.prototype = RealDate.prototype;

		// 정적 메서드 복원
		global.Date.UTC = RealDate.UTC;
		global.Date.parse = RealDate.parse;
		global.Date.now = jest.fn(() => fixedDate.getTime());
	});

	afterEach(() => {
		// 모든 모킹 복원
		global.Date = RealDate;
		jest.restoreAllMocks();
	});

	describe('formatDate 함수', () => {
		test('날짜를 YYYY-MM-DD 형식으로 변환해야 한다', () => {
			// 테스트 케이스
			const testDate = new RealDate('2023-05-10');
			const result = formatDate(testDate);

			// 결과 확인
			expect(result).toBe('2023-05-10');
		});

		test('날짜가 null이나 undefined인 경우 빈 문자열을 반환해야 한다', () => {
			expect(formatDate(null)).toBe('');
			expect(formatDate(undefined)).toBe('');
		});

		test('Invalid Date인 경우 빈 문자열을 반환해야 한다', () => {
			const invalidDate = new RealDate('invalid-date');
			expect(formatDate(invalidDate)).toBe('');
		});
	});

	describe('getYearMonthDay 함수', () => {
		test('날짜에서 연도, 월, 일을 추출해야 한다', () => {
			// 테스트 케이스
			const testDate = new RealDate('2023-05-10');
			const { year, month, day } = getYearMonthDay(testDate);

			// 결과 확인
			expect(year).toBe(2023);
			expect(month).toBe(5); // 실제 월 (1-12)
			expect(day).toBe(10);
		});

		test('날짜 문자열에서 연도, 월, 일을 추출해야 한다', () => {
			// 테스트 케이스 - RealDate 사용
			const { year, month, day } = getYearMonthDay('2023-08-15');

			// 결과 확인
			expect(year).toBe(2023);
			expect(month).toBe(8);
			expect(day).toBe(15);
		});

		test('유효하지 않은 날짜는 현재 날짜를 사용해야 한다', () => {
			// 현재 날짜 모킹 (2023-06-15)
			const { year, month, day } = getYearMonthDay('invalid-date');

			// 결과 확인 (모킹된 현재 날짜 기준)
			expect(year).toBe(2023);
			expect(month).toBe(6);
			expect(day).toBe(15);
		});
	});

	describe('findWeekday 함수', () => {
		test('날짜에 해당하는 요일을 반환해야 한다', () => {
			// 테스트 케이스 - RealDate 사용
			const result = findWeekday(new RealDate('2023-06-15'));

			// 결과 확인
			expect(result).toBe('목');
		});

		test('날짜 문자열에 해당하는 요일을 반환해야 한다', () => {
			// 테스트 케이스 - RealDate 사용
			expect(findWeekday('2023-06-18')).toBe('일');
			expect(findWeekday('2023-06-19')).toBe('월');
			expect(findWeekday('2023-06-20')).toBe('화');
			expect(findWeekday('2023-06-21')).toBe('수');
			expect(findWeekday('2023-06-22')).toBe('목');
			expect(findWeekday('2023-06-23')).toBe('금');
			expect(findWeekday('2023-06-24')).toBe('토');
		});

		test('유효하지 않은 날짜는 현재 날짜의 요일을 반환해야 한다', () => {
			// 현재 날짜 모킹 (2023-06-15는 목요일)
			expect(findWeekday('invalid-date')).toBe('목');
		});
	});

	describe('calculateDiffDays 함수', () => {
		test('두 날짜 사이의 일수 차이를 계산해야 한다', () => {
			// 테스트 케이스 - RealDate 사용
			const startDate = new RealDate('2023-06-01');
			const endDate = new RealDate('2023-06-10');

			// 결과 확인
			expect(calculateDiffDays(startDate, endDate)).toBe(9);
		});

		test('날짜 문자열 사이의 일수 차이를 계산해야 한다', () => {
			// 테스트 케이스
			expect(calculateDiffDays('2023-06-01', '2023-06-10')).toBe(9);
		});

		test('시작일이 종료일보다 나중이면 음수를 반환해야 한다', () => {
			// 테스트 케이스
			expect(calculateDiffDays('2023-06-10', '2023-06-01')).toBe(-9);
		});

		test('같은 날짜는 0을 반환해야 한다', () => {
			// 테스트 케이스
			expect(calculateDiffDays('2023-06-01', '2023-06-01')).toBe(0);
		});

		test('유효하지 않은 날짜는 현재 날짜를 사용해야 한다', () => {
			// 현재 날짜 기준 테스트
			const mockLater = new RealDate('2023-06-25');
			const mockEarlier = new RealDate('2023-06-05');

			// 현재 날짜는 2023-06-15로 모킹되어 있음
			expect(calculateDiffDays('invalid-date', mockLater)).toBe(10); // 6월 15일부터 6월 25일까지
			expect(calculateDiffDays(mockEarlier, 'invalid-date')).toBe(10); // 6월 5일부터 6월 15일까지
		});
	});

	describe('calculateDuration 함수', () => {
		test('두 날짜 사이의 기간(일수)을 계산해야 한다', () => {
			// 테스트 케이스 - RealDate 사용
			const startDate = new RealDate('2023-06-01');
			const endDate = new RealDate('2023-06-10');

			// 결과 확인 (양 끝 날짜 포함)
			expect(calculateDuration(startDate, endDate)).toBe(10);
		});

		test('날짜 문자열 사이의 기간을 계산해야 한다', () => {
			// 테스트 케이스
			expect(calculateDuration('2023-06-01', '2023-06-10')).toBe(10);
		});

		test('시작일이 종료일보다 나중이면 0을 반환해야 한다', () => {
			// 테스트 케이스
			expect(calculateDuration('2023-06-10', '2023-06-01')).toBe(0);
		});

		test('같은 날짜는 1을 반환해야 한다', () => {
			// 테스트 케이스
			expect(calculateDuration('2023-06-01', '2023-06-01')).toBe(1);
		});

		test('유효하지 않은 날짜는 현재 날짜를 사용해야 한다', () => {
			// 현재 날짜 기준 테스트
			const mockLater = new RealDate('2023-06-25');
			const mockEarlier = new RealDate('2023-06-05');

			// 현재 날짜는 2023-06-15로 모킹되어 있음
			expect(calculateDuration('invalid-date', mockLater)).toBe(11); // 6월 15일부터 6월 25일까지 (10일) + 1일(양끝 포함)
			expect(calculateDuration(mockEarlier, 'invalid-date')).toBe(11); // 6월 5일부터 6월 15일까지 (10일) + 1일(양끝 포함)
		});
	});

	describe('getToday 함수', () => {
		test('오늘 날짜를 YYYY-MM-DD 형식으로 반환해야 한다', () => {
			// 모킹된 현재 날짜 (2023-06-15)
			const result = getToday();
			expect(result).toBe('2023-06-15');
		});
	});
});
