/**
 * 템플릿 관련 API
 */

import { get } from './httpClient';

const templateApi = {
	/**
	 * 템플릿 정보를 조회합니다.
	 * @param {string} type - 템플릿 타입
	 * @returns {Promise<Object>} 템플릿 데이터
	 */
	getTemplate: type => {
		console.log(`[templateApi.getTemplate] 템플릿 정보 요청: type=${type}`);
		try {
			const response = get(`/api/data/template/${type}`);
			console.log(`[templateApi.getTemplate] 템플릿 정보 조회 성공`);
			return response;
		} catch (error) {
			console.error('[templateApi.getTemplate] 템플릿 정보 조회 실패:', error);
			throw error;
		}
	},

	/**
	 * 조항 템플릿 목록을 조회합니다.
	 * @param {string} query1 - 조회 쿼리 파라미터1
	 * @param {string} query2 - 조회 쿼리 파라미터2
	 * @returns {Promise<Array>} 조항 템플릿 목록
	 */
	getClauseTemplates: (query1, query2) => {
		console.log(`[templateApi.getClauseTemplates] 조항 템플릿 요청: query1=${query1}, query2=${query2}`);
		try {
			const response = get(`/api/data/clause-templates?query1=${query1}&query2=${query2}`);
			console.log(`[templateApi.getClauseTemplates] 조항 템플릿 조회 성공`);
			return response;
		} catch (error) {
			console.error('[templateApi.getClauseTemplates] 조항 템플릿 조회 실패:', error);
			throw error;
		}
	},

	/**
	 * 질문 템플릿 목록을 조회합니다.
	 * @param {string} query1 - 조회 쿼리 파라미터1
	 * @param {string} query2 - 조회 쿼리 파라미터2
	 * @returns {Promise<Array>} 질문 템플릿 목록
	 */
	getQuestionTemplates: (query1, query2) => {
		console.log(`[templateApi.getQuestionTemplates] 질문 템플릿 요청: query1=${query1}, query2=${query2}`);
		try {
			const response = get(`/api/data/question-templates?query1=${query1}&query2=${query2}`);
			console.log(`[templateApi.getQuestionTemplates] 질문 템플릿 조회 성공`);
			return response;
		} catch (error) {
			console.error('[templateApi.getQuestionTemplates] 질문 템플릿 조회 실패:', error);
			throw error;
		}
	},
};

export default templateApi;
