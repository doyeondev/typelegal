/**
 * usage: const now = new Date()
 * - formatDate(now, 'yyyy-MM-dd HH:mm:ss') // 2019-03-28 12:12:12
 * - formatDate(now, 'yyMMdd') // 190328
 * - formatDate(now, 'a/p hh시 mm분') // 오후 03시 28분
 * - formatDate(now, 'MM월 dd일 E') // 03월 28일 목요일
 */

// const now = new Date()
// let myDateFormat = 'yyyy년 MM월 dd일(E) a/p hh:mm'

/**
 * 주어진 날짜를 지정된 형식의 문자열로 변환합니다.
 * @param {Date|string} d - 변환할 날짜 객체 또는 날짜 문자열
 * @param {string} type - 날짜 형식 ('full', 'short') 또는 사용자 지정 형식
 * @returns {string} 형식화된 날짜 문자열
 */
export function formatDate(d, type) {
	// null, undefined 체크
	if (d === null || d === undefined) return '';

	// 문자열인 경우 Date 객체로 변환
	if (typeof d === 'string') {
		d = new Date(d);
	}

	// 유효한 날짜인지 확인
	if (isNaN(d.getTime())) return '';

	// 기본 포맷 (YYYY-MM-DD)
	if (!type) {
		return `${d.getFullYear()}-${subFormatNum(d.getMonth() + 1, 2)}-${subFormatNum(d.getDate(), 2)}`;
	}

	let format;
	if (type === 'full') format = 'yyyy년 MM월 dd일(E) a/p hh:mm';
	else if (type === 'short') format = 'yyyy. MM. dd.';
	else format = type;

	// const weekName = ['일요일', '월요일', '화요일', '수요일', '목요일', '금요일', '토요일'];
	const weekName = ['일', '월', '화', '수', '목', '금', '토'];
	const h = d.getHours() % 12;

	const now = new Date();
	if (now.getFullYear() !== d.getFullYear()) {
		format = 'yy년 ' + format;
	}

	return format.replace(/(yyyy|yy|MM|dd|E|hh|mm|sss|ss|a\/p)/gi, function (ele) {
		switch (ele) {
			case 'yyyy':
				return d.getFullYear();
			case 'yy':
				// return (d.getFullYear() % 1000).subFormatNum(2); // subFormatNum(d.getFullYear() % 1000, 2)
				return subFormatNum(d.getFullYear() % 1000, 2);
			case 'MM':
				return subFormatNum(d.getMonth() + 1, 2);
			case 'dd':
				return subFormatNum(d.getDate(), 2);
			case 'E':
				return weekName[d.getDay()];
			case 'HH':
				return subFormatNum(d.getHours(), 2);
			case 'hh':
				return subFormatNum(h ? h : 12, 2);
			// return (((d.getHours() % 12) ? (d.getHours() % 12) : 12)).subFormat(2);
			case 'mm':
				return subFormatNum(d.getMinutes(), 2);
			case 'sss':
				return subFormatNum(d.getMilliseconds(), 3);
			case 'ss':
				return subFormatNum(d.getSeconds(), 2);
			case 'a/p':
				return d.getHours() < 12 ? '오전' : '오후';
			default:
				return ele;
		}
	});
}

function subFormatNum(num, len) {
	return subFormat(num.toString(), len);
}

function subFormat(foo, len) {
	// return num.toString().subFormat(len)
	return string('0', len - foo.length) + foo;
}

function string(bar, len) {
	let s = '';
	let i = 0;
	while (i++ < len) {
		s += bar;
	}
	return s;
}

/**
 * 날짜를 한국어 형식으로 변환합니다 (예: 2023. 6. 15. 목)
 * @param {Date} date - 변환할 날짜 객체
 * @returns {string} 변환된 날짜 문자열
 */
export function dateFormatter(date) {
	const dateString = date.toLocaleDateString('ko-KR', {
		year: 'numeric',
		month: 'numeric',
		day: 'numeric',
	});
	const dayName = date.toLocaleDateString('ko-KR', {
		weekday: 'long',
	});
	return `${dateString} ${dayName.substring(0, 1)}`;
}

/**
 * 주어진 날짜에 일수를 더합니다
 * @param {Date} oldDate - 기준 날짜
 * @param {number} daysToAdd - 더할 일수
 * @returns {number} 새 날짜의 타임스탬프
 */
export function addDaysToDate(oldDate, daysToAdd) {
	let newDate = new Date(oldDate.toLocaleDateString());
	return newDate.setDate(newDate.getDate() + daysToAdd);
}

/**
 * 날짜에서 연도, 월, 일을 추출합니다
 * @param {Date|string} date - 날짜 객체 또는 문자열
 * @returns {object} 연도, 월, 일 정보를 담은 객체
 */
export function getYearMonthDay(date) {
	let dateObj;

	// 문자열이거나 유효하지 않은 날짜인 경우 처리
	if (typeof date === 'string') {
		dateObj = new Date(date);
	} else {
		dateObj = date;
	}

	// 유효하지 않은 날짜는 현재 날짜 사용
	if (date === null || date === undefined || isNaN(dateObj.getTime())) {
		dateObj = new Date();
	}

	return {
		year: dateObj.getFullYear(),
		month: dateObj.getMonth() + 1, // 월은 0부터 시작하므로 1을 더함
		day: dateObj.getDate(),
	};
}

/**
 * 날짜에 해당하는 요일을 반환합니다
 * @param {Date|string} date - 날짜 객체 또는 문자열
 * @returns {string} 요일 (한글)
 */
export function findWeekday(date) {
	const weekNames = ['일', '월', '화', '수', '목', '금', '토'];
	let dateObj;

	// 문자열이거나 유효하지 않은 날짜인 경우 처리
	if (typeof date === 'string') {
		dateObj = new Date(date);
	} else {
		dateObj = date;
	}

	// 유효하지 않은 날짜는 현재 날짜 사용
	if (date === null || date === undefined || isNaN(dateObj.getTime())) {
		dateObj = new Date();
	}

	return weekNames[dateObj.getDay()];
}

/**
 * 두 날짜 사이의 일수 차이를 계산합니다
 * @param {Date|string} startDate - 시작 날짜
 * @param {Date|string} endDate - 종료 날짜
 * @returns {number} 일수 차이 (종료일 - 시작일)
 */
export function calculateDiffDays(startDate, endDate) {
	// 날짜 객체 변환 함수
	const getDateObj = date => {
		if (typeof date === 'string') {
			const d = new Date(date);
			return isNaN(d.getTime()) ? new Date() : d;
		}
		return date === null || date === undefined || isNaN(date.getTime()) ? new Date() : date;
	};

	const start = getDateObj(startDate);
	const end = getDateObj(endDate);

	// 시간 부분을 제거하여 순수한 날짜만 비교
	const startUtc = Date.UTC(start.getFullYear(), start.getMonth(), start.getDate());
	const endUtc = Date.UTC(end.getFullYear(), end.getMonth(), end.getDate());

	// 차이 계산 (밀리초를 일수로 변환)
	return Math.floor((endUtc - startUtc) / (1000 * 60 * 60 * 24));
}

/**
 * 두 날짜 사이의 기간(일수)을 계산합니다 (양 끝 날짜 포함)
 * @param {Date|string} startDate - 시작 날짜
 * @param {Date|string} endDate - 종료 날짜
 * @returns {number} 기간 (일수)
 */
export function calculateDuration(startDate, endDate) {
	const diffDays = calculateDiffDays(startDate, endDate);

	if (diffDays < 0) return 0; // 시작일이 종료일보다 나중이면 0 반환

	// 양 끝 날짜를 포함하므로 +1
	return diffDays + 1;
}

/**
 * 오늘 날짜를 YYYY-MM-DD 형식으로 반환합니다
 * @returns {string} 오늘 날짜 문자열
 */
export function getToday() {
	const today = new Date();
	return formatDate(today);
}
