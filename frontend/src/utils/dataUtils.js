import _ from 'lodash';
import apiClient from '../libs/apiClient';
import userService from '../services/userService';

export async function fetchProcessedData(query1, query2) {
	try {
		console.log(`[fetchProcessedData] 데이터 요청 시작 - query1:${query1}, query2:${query2}`);

		// 백엔드 API URL 사용
		const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8082';
		const requestUrl = `${API_BASE_URL}/api/template/process`;
		console.log(`[fetchProcessedData] 백엔드 직접 요청 URL: ${requestUrl}`);

		// 백엔드 API 직접 호출 - POST 방식으로 변경
		const response = await fetch(requestUrl, {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json',
			},
			body: JSON.stringify({
				query1: query1 || '10',
				query2: query2,
				type: query2, // 이전 코드와의 호환성을 위해 type도 유지
			}),
			credentials: 'include', // 쿠키 포함하여 요청
		});

		// 응답 상태 체크 및 로깅
		console.log(`[fetchProcessedData] API 응답 상태: ${response.status} ${response.statusText}`);

		if (!response.ok) {
			// 에러 응답이 JSON인 경우 에러 메시지 추출
			try {
				const errorData = await response.json();
				console.error('[fetchProcessedData] API 오류 세부정보:', errorData);
				throw new Error(`API 오류: ${errorData.message || '알 수 없는 오류'} ${errorData.details ? `(${errorData.details})` : ''}`);
			} catch (jsonError) {
				console.error('[fetchProcessedData] 오류 응답 파싱 실패:', jsonError);
				throw new Error(`Network response was not ok: ${response.status} ${response.statusText}`);
			}
		}

		// 응답 데이터 파싱
		const data = await response.json();
		console.log('[fetchProcessedData] 받은 데이터 키:', Object.keys(data));
		console.log('[fetchProcessedData] 데이터 크기:', JSON.stringify(data).length, 'bytes');

		// 중요 데이터 확인
		if (!data.clause || !data.question) {
			console.warn('[fetchProcessedData] 필수 데이터가 누락되었습니다:', data);
			throw new Error('필수 데이터(clause 또는 question)가 누락되었습니다.');
		}

		// grouped_question이 없는 경우 생성
		if (!data.grouped_question && data.question && data.question.length > 0) {
			console.log('[fetchProcessedData] grouped_question이 없어서 생성합니다');
			data.grouped_question = _.groupBy(_.orderBy(data.question, ['midx', 'qidx'], ['asc', 'asc']), item => item.binding_question_ko || '기본 정보');
			console.log('[fetchProcessedData] grouped_question 생성 완료:', Object.keys(data.grouped_question));
		}

		// 누락된 필드에 기본값 설정
		data.input_array = data.input_array || [];
		data.clauseGuide = data.clauseGuide || [];

		console.log(`[fetchProcessedData] 처리 완료: clause ${data.clause.length}개, question ${data.question.length}개`);
		return data;
	} catch (error) {
		console.error('❌ [fetchProcessedData] 데이터 요청 실패:', error);
		throw error; // 상위로 에러를 전달하여 UI에서 처리할 수 있도록 함
	}
}

// 계약서 데이터 저장 함수 - 새로운 API로 변경
export async function saveContractData(data) {
	console.log('[saveContractData] 계약서 데이터 저장 시작', { contractId: data.id });

	try {
		// 데이터 형식 변환 (기존 -> 새 API)
		const draftingDto = {
			id: data.id,
			contractTitle: data.title,
			contractData: JSON.stringify(data.contractData),
			memberId: userService.getUserFromStorage()?.id, // 세션스토리지에서 회원 ID 가져오기
			status: data.status || 'stage1',
			query: data.query,
			contractInfo: JSON.stringify(data.templateInfo),
			type: data.typeEn,
		};

		console.log(`[saveContractData] 변환된 데이터:`, draftingDto);

		// 새로운 API 엔드포인트
		const apiUrlEndpoint = `/api/data/drafting-data`;
		let method = 'POST';

		// 이미 ID가 있는 경우 업데이트 (PUT)
		if (data.id) {
			apiUrlEndpoint = `/api/data/drafting-data/${data.id}`;
			method = 'PUT';
		}

		console.log(`[saveContractData] 요청 URL: ${apiUrlEndpoint}, 메서드: ${method}`);

		const response = await (method === 'POST' ? apiClient.post(apiUrlEndpoint, draftingDto) : apiClient.put(apiUrlEndpoint, draftingDto));

		console.log(`[saveContractData] 응답:`, response);
		return response;
	} catch (error) {
		console.error('❌ [saveContractData] 저장 실패:', error);
		throw error; // 명시적으로 에러를 던져 상위 컴포넌트에서 처리할 수 있도록 함
	}
}
