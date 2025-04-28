/**
 * 템플릿 데이터 처리 API
 * 백엔드에서 계약서 템플릿 데이터를 가져와 가공하는 API 라우트
 */

// 백엔드 API 기본 URL
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8082';

export default async function handler(req, res) {
	// 요청 파라미터 확인
	const { query1, query2 } = req.method === 'GET' ? req.query : req.body;

	console.log(`[getProcessedData] API 요청 파라미터: query1=${query1}, query2=${query2}`);

	if (!query1 && !query2) {
		return res.status(400).json({ error: '필수 파라미터가 누락되었습니다.' });
	}

	try {
		// 백엔드 API 엔드포인트 설정
		const url = `${API_BASE_URL}/api/template/process`;
		console.log(`[getProcessedData] 템플릿 데이터 처리 API 호출 URL: ${url}`);

		// 요청 시작 시간 기록 (성능 측정용)
		const startTime = Date.now();

		// 백엔드 API 호출
		const response = await fetch(url, {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json',
				Authorization: req.headers.authorization || '',
				Cookie: req.headers.cookie || '',
			},
			body: JSON.stringify({
				type: query2 || query1,
			}),
			credentials: 'include',
		});

		// 응답 시간 계산
		const responseTime = Date.now() - startTime;
		console.log(`[getProcessedData] 템플릿 데이터 응답 수신 (${responseTime}ms)`);

		// 응답 상태 코드 확인
		console.log(`[getProcessedData] 응답 상태 코드: ${response.status}`);

		// 오류 응답 처리
		if (!response.ok) {
			// 인증 오류인 경우
			if (response.status === 401 || response.status === 403) {
				console.error(`[getProcessedData] 인증 오류: ${response.status}`);
				return res.status(response.status).json({
					error: '인증이 필요합니다.',
					status: response.status,
				});
			}

			// 기타 오류
			console.error(`[getProcessedData] API 오류 응답: ${response.status}`);
			return res.status(response.status).json({
				error: `템플릿 데이터 요청 실패 (${response.status})`,
				status: response.status,
			});
		}

		// 응답 데이터 파싱
		let data;
		try {
			data = await response.json();
		} catch (jsonError) {
			console.error('[getProcessedData] JSON 파싱 오류:', jsonError);

			// 응답 내용 확인 (디버깅용)
			try {
				const textResponse = await response.text();
				console.error('[getProcessedData] 원본 응답 텍스트:', textResponse.substring(0, 200));

				return res.status(500).json({
					error: 'JSON 파싱 오류',
					message: jsonError.message,
					debugText: textResponse.substring(0, 200),
				});
			} catch (textError) {
				return res.status(500).json({
					error: 'JSON 및 텍스트 파싱 오류',
					message: jsonError.message,
				});
			}
		}

		// 데이터 유효성 검증
		if (!data || typeof data !== 'object') {
			console.error('[getProcessedData] 유효하지 않은; 데이터 형식:', typeof data);
			return res.status(500).json({
				error: '유효하지 않은 데이터 형식',
				received: typeof data,
			});
		}

		// 데이터 구조 로깅
		console.log(`[getProcessedData] 응답 데이터 구조: ${Object.keys(data).join(',')}`);

		// 주요 데이터 필드 크기 확인
		if (data.clause) console.log(`[getProcessedData] 데이터 크기: clause=${data.clause.length}`);
		if (data.question) console.log(`[getProcessedData] question 데이터 크기=${data.question.length}`);

		// 데이터 보강 및 유효성 검증
		if (data.question && Array.isArray(data.question)) {
			console.log(`[getProcessedData] question 데이터 검증 및 보완 중...`);
			// 여기에 question 데이터 검증/보강 로직 추가 가능
		}

		// 성공 응답 반환
		return res.status(200).json(data);
	} catch (error) {
		console.error('[getProcessedData] 처리 중 오류 발생:', error);

		return res.status(500).json({
			error: '템플릿 데이터 처리 중 오류',
			message: error.message,
		});
	}
}

/**
 * 아래 함수들은 더 이상 사용하지 않습니다.
 * 백엔드의 리팩터링으로 인해 이제 template/process 엔드포인트에서
 * 모든 데이터 처리와 그룹화가 이루어집니다.
 */

// function buildInputArray(clauses, questions) {
//    // 이 함수는 더 이상 사용되지 않습니다.
// }

// function buildGroupedQuestions(questions) {
//    // 이 함수는 더 이상 사용되지 않습니다.
// }
