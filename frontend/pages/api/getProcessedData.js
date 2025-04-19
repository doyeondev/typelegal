import axios from 'axios';
import _ from 'lodash';

export default async function handle(req, res) {
	try {
		// 환경 변수 또는 기본값으로 API URL 설정
		const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8082/api';

		// 요청 시작 시간 기록 (성능 측정용)
		const startTime = Date.now();

		// 클라이언트에서 query1, query2를 GET 요청 파라미터로 받음
		const { query1, query2 } = req.query;
		console.log(`[getProcessedData] API 요청 파라미터: query1=${query1}, query2=${query2}`);

		try {
			// 경로 변경: 이전에는 /clause/filtered와 /question/filtered를 사용했지만
			// 이제는 리팩터링된 백엔드 구조에 맞게 `/template/process` 단일 엔드포인트를 사용
			const apiUrl = `${API_BASE_URL}/template/process`;
			console.log(`[getProcessedData] 템플릿 데이터 처리 API 호출 URL: ${apiUrl}`);

			const processedResponse = await axios.get(apiUrl, {
				params: { query1, query2 },
				timeout: 8000, // 타임아웃 8초로 증가 (데이터 처리에 시간이 걸릴 수 있음)
				headers: {
					Accept: 'application/json',
					'Content-Type': 'application/json',
				},
			});

			// 응답 처리 시간 계산
			const responseTime = Date.now() - startTime;
			console.log(`[getProcessedData] 템플릿 데이터 응답 수신 (${responseTime}ms)`);
			console.log(`[getProcessedData] 응답 상태 코드: ${processedResponse.status}`);

			const responseData = processedResponse.data;
			console.log(`[getProcessedData] 응답 데이터 구조: ${Object.keys(responseData)}`);

			// 응답 데이터 검증
			if (!responseData.clause || !responseData.question) {
				console.warn('[getProcessedData] 백엔드에서 필수 데이터(clause 또는 question)가 누락되었습니다');
				return res.status(500).json({
					error: true,
					message: '백엔드에서 필수 데이터가 누락되었습니다',
					received: Object.keys(responseData),
				});
			} else {
				console.log(`[getProcessedData] 데이터 크기: clause=${responseData.clause.length}, question=${responseData.question.length}`);
			}

			// question 데이터에 binding_question_ko가 없는 경우 기본값 설정
			if (responseData.question && responseData.question.length > 0) {
				console.log('[getProcessedData] question 데이터 검증 및 보완 중...');
				responseData.question = responseData.question.map(q => {
					// binding_question_ko가 없으면 기본값 설정
					if (!q.binding_question_ko) {
						q.binding_question_ko = '기본 정보';
					}
					// 기타 필수 필드에 대한 기본값 설정
					q.is_default = q.is_default !== undefined ? q.is_default : true;
					return q;
				});
			}

			// grouped_question이 없으면 생성
			if (!responseData.grouped_question && responseData.question && responseData.question.length > 0) {
				console.log('[getProcessedData] grouped_question 생성 중...');
				responseData.grouped_question = _.groupBy(_.orderBy(responseData.question, ['midx', 'qidx'], ['asc', 'asc']), q => q.binding_question_ko || '기본 정보');
				console.log('[getProcessedData] grouped_question 생성 완료:', Object.keys(responseData.grouped_question));
			}

			// 필수 필드에 빈 배열 기본값 설정
			responseData.input_array = responseData.input_array || [];
			responseData.clauseGuide = responseData.clauseGuide || [];

			// 백엔드에서 이미 처리된 데이터를 클라이언트에 전달
			res.status(200).json(responseData);
		} catch (apiError) {
			// axios 오류 상세 정보 추출
			const errorDetails = apiError.response ? `상태 코드: ${apiError.response.status}, 메시지: ${JSON.stringify(apiError.response.data)}` : apiError.message;

			console.error(`[getProcessedData] ❌ 백엔드 API 호출 실패: ${errorDetails}`);

			// API 요청 실패 시 오류 응답
			res.status(apiError.response?.status || 500).json({
				error: true,
				message: '데이터를 불러오는 중 오류가 발생했습니다.',
				details: errorDetails,
				path: req.url,
			});
		}
	} catch (error) {
		console.error(`[getProcessedData] ❌ API 요청 처리 중 예상치 못한 오류: ${error.message}`);
		// 스택 트레이스 로깅 (디버깅용)
		console.error(error.stack);

		// 최종 오류 시 오류 응답
		res.status(500).json({
			error: true,
			message: '서버 내부 오류가 발생했습니다.',
			details: error.message,
			path: req.url,
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
