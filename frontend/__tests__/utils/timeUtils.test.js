import { timestamp, timeDiffSec, timeDiffMin } from '../../utils/timeUtils';

describe('timeUtils', () => {
	// Date 객체 모킹을 위한 설정
	let originalDate;

	beforeAll(() => {
		// 원래 Date 객체 저장
		originalDate = global.Date;
	});

	afterAll(() => {
		// 테스트 후 원래 Date 객체 복원
		global.Date = originalDate;
	});

	beforeEach(() => {
		// 모든 mock 초기화
		jest.clearAllMocks();
	});

	describe('timestamp', () => {
		test('현재 시간을 ISO 문자열 형식으로 반환해야 한다', () => {
			// 특정 날짜로 Date 모킹
			const mockDate = new Date(2023, 0, 1, 10, 30, 0); // 2023-01-01 10:30:00
			global.Date = class extends Date {
				constructor(...args) {
					if (args.length === 0) {
						return mockDate;
					}
					return new originalDate(...args);
				}
			};

			// setHours 함수 모킹 (한국 시간(UTC+9) 설정)
			mockDate.setHours = jest.fn();

			// toISOString 함수 모킹
			mockDate.toISOString = jest.fn().mockReturnValue('2023-01-01T10:30:00.000Z');

			// 타임스탬프 함수 호출
			const result = timestamp();

			// setHours가 호출되었는지 확인
			expect(mockDate.setHours).toHaveBeenCalledWith(mockDate.getHours() + 9);

			// toISOString이 호출되었는지 확인
			expect(mockDate.toISOString).toHaveBeenCalled();

			// 결과가 예상 형식인지 확인
			expect(result).toBe('2023-01-01 10:30:00');
		});
	});

	describe('timeDiffSec', () => {
		test('두 시간 사이의 차이를 초 단위로 계산해야 한다', () => {
			// 테스트 데이터
			const start = '2023-01-01 10:00:00';
			const end = '2023-01-01 10:01:30'; // 1분 30초 차이

			// Date 생성자 모킹
			const startDate = new Date('2023-01-01T10:00:00');
			const endDate = new Date('2023-01-01T10:01:30');

			global.Date = jest.fn(arg => {
				if (arg === start) return startDate;
				if (arg === end) return endDate;
				return new originalDate(arg);
			});

			// getTime 메소드 모킹
			startDate.getTime = jest.fn(() => 1672567200000); // 임의의 타임스탬프
			endDate.getTime = jest.fn(() => 1672567290000); // 90초(1분 30초) 후의 타임스탬프

			const result = timeDiffSec(start, end);

			// 1분 30초 = 90초
			expect(result).toBe(90);
		});

		test('end가 start보다 이전 시간일 경우 음수 값을 반환해야 한다', () => {
			// 테스트 데이터
			const start = '2023-01-01 10:01:30';
			const end = '2023-01-01 10:00:00'; // -1분 30초 차이

			// Date 생성자 모킹
			const startDate = new Date('2023-01-01T10:01:30');
			const endDate = new Date('2023-01-01T10:00:00');

			global.Date = jest.fn(arg => {
				if (arg === start) return startDate;
				if (arg === end) return endDate;
				return new originalDate(arg);
			});

			// getTime 메소드 모킹
			startDate.getTime = jest.fn(() => 1672567290000); // 임의의 타임스탬프
			endDate.getTime = jest.fn(() => 1672567200000); // 90초(1분 30초) 이전의 타임스탬프

			const result = timeDiffSec(start, end);

			// -1분 30초 = -90초
			expect(result).toBe(-90);
		});
	});

	describe('timeDiffMin', () => {
		test('두 시간 사이의 차이를 분 단위로 계산해야 한다', () => {
			// 테스트 데이터
			const start = '2023-01-01 10:00:00';
			const end = '2023-01-01 10:30:00'; // 30분 차이

			// Date 생성자 모킹
			const startDate = new Date('2023-01-01T10:00:00');
			const endDate = new Date('2023-01-01T10:30:00');

			global.Date = jest.fn(arg => {
				if (arg === start) return startDate;
				if (arg === end) return endDate;
				return new originalDate(arg);
			});

			// getTime 메소드 모킹
			startDate.getTime = jest.fn(() => 1672567200000); // 임의의 타임스탬프
			endDate.getTime = jest.fn(() => 1672569000000); // 30분 후의 타임스탬프 (1800000 밀리초 차이)

			const result = timeDiffMin(start, end);

			// 30분
			expect(result).toBe(30);
		});

		test('초 단위의 차이도 소수점 둘째 자리까지 정확하게 계산해야 한다', () => {
			// 테스트 데이터
			const start = '2023-01-01 10:00:00';
			const end = '2023-01-01 10:01:30'; // 1분 30초 차이

			// Date 생성자 모킹
			const startDate = new Date('2023-01-01T10:00:00');
			const endDate = new Date('2023-01-01T10:01:30');

			global.Date = jest.fn(arg => {
				if (arg === start) return startDate;
				if (arg === end) return endDate;
				return new originalDate(arg);
			});

			// getTime 메소드 모킹
			startDate.getTime = jest.fn(() => 1672567200000); // 임의의 타임스탬프
			endDate.getTime = jest.fn(() => 1672567290000); // 90초(1분 30초) 후의 타임스탬프

			const result = timeDiffMin(start, end);

			// 1분 30초 = 1.5분
			expect(result).toBe(1.5);
		});

		test('end가 start보다 이전 시간일 경우 음수 값을 반환해야 한다', () => {
			// 테스트 데이터
			const start = '2023-01-01 10:30:00';
			const end = '2023-01-01 10:00:00'; // -30분 차이

			// Date 생성자 모킹
			const startDate = new Date('2023-01-01T10:30:00');
			const endDate = new Date('2023-01-01T10:00:00');

			global.Date = jest.fn(arg => {
				if (arg === start) return startDate;
				if (arg === end) return endDate;
				return new originalDate(arg);
			});

			// getTime 메소드 모킹
			startDate.getTime = jest.fn(() => 1672569000000); // 임의의 타임스탬프
			endDate.getTime = jest.fn(() => 1672567200000); // 30분 이전의 타임스탬프 (1800000 밀리초 차이)

			const result = timeDiffMin(start, end);

			// -30분
			expect(result).toBe(-30);
		});
	});
});
