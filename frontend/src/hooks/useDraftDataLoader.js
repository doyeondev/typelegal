/**
 * 드래프트 페이지 데이터 로딩 커스텀 훅
 * 계약서 드래프트 페이지의 초기 데이터 로딩 및 상태 관리를 담당합니다.
 */

import { useState, useEffect } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { useQuery } from '@tanstack/react-query';
import { useUser } from '../context/UserContext';
import { fetchProcessedData } from '../utils/dataUtils.js';
import { groupBy, orderBy, uniqueArray, flatten } from '../utils/arrayUtils.js';
import { deepClone } from '../utils/objectUtils.js';
import { timestamp } from '../utils/timeUtils.js';
import logService from '../services/logService';
import draftService from '../services/draftService';

// 서버사이드 API 함수 정의
const fetchTemplateInfo = async type => {
	const response = await fetch(`https://conan.ai/_functions/getTemplateInfo/${type}`);
	if (!response.ok) {
		throw new Error(`템플릿 정보 가져오기 실패: ${response.status}`);
	}
	const data = await response.json();
	return data.items;
};

/**
 * 드래프트 데이터 로딩 및 초기화 훅
 * @param {Object} params - 훅 파라미터
 * @param {Object} params.user - 서버에서 전달받은 사용자 정보
 * @param {Object} params.contract - 서버에서 전달받은 계약 템플릿 정보
 * @param {Object} params.contractData - 서버에서 전달받은 계약 데이터
 * @param {Object} params.searchParams - URL 검색 파라미터
 * @param {Object} params.draftStore - Zustand 드래프트 스토어
 * @returns {Object} 로딩 상태와 기타 드래프트 관련 상태들
 */
export const useDraftDataLoader = ({ user, contract, contractData, searchParams, draftStore }) => {
	const { setContractId, setDocStatus, setQuestionData, setClauseData, setInputData, setQuestionGroupData, setAnsweredQuestionData, setQuestionGroupKey, setActiveClauseKeys, setGlossary, setActivityLog } = draftStore;

	const { user: userContext } = useUser();

	const [loaded, setLoaded] = useState(false);
	const [currentMember, setCurrentMember] = useState(user || '');
	const [userOS, setUserOS] = useState('');
	const [formSubmitted, setFormSubmitted] = useState(user?.submittedSurvey || '');
	const [clause_template, setClauseTemplate] = useState(null);
	const [question_template, setQuestionTemplate] = useState(null);

	// React Query 훅 사용 (SSR prefetch와 통합)
	const { data: templateData } = useQuery(['templateInfo', contract.type], () => fetchTemplateInfo(contract.type), {
		initialData: contract,
	});

	// 계약서 데이터 쿼리 (이미 서버에서 가져온 경우 사용)
	const { data: processedData } = useQuery(['processedData', contract.type], () => fetchProcessedData('10', contract.type), {
		initialData: contractData,
		enabled: !!contract.type,
	});

	// 질문을 카테고리별로 그룹화하는 공통 함수
	const groupQuestionsByCategory = questions => {
		return groupBy(orderBy(questions, ['midx', 'qidx'], ['asc', 'asc']), q => q.binding_question_ko || '기본 정보');
	};

	// 데이터 로딩 함수
	const loadDraftData = async () => {
		try {
			localStorage.theme = 'light';
			setUserOS(window.navigator.userAgent.includes('Mac') ? 'Mac' : 'Window');

			// 서버에서 사용자 정보가 없는 경우만 세션스토리지 확인
			if (!user) {
				// 로그인 상태 확인 및 처리
				if (!sessionStorage.getItem('member_key')) {
					// 로그인 페이지로 리디렉션
					const currentUrl = window.location.pathname + window.location.search;
					sessionStorage.setItem('redirectAfterLogin', currentUrl);
					window.location.href = '/login';
					return;
				}

				// 세션스토리지에서 사용자 정보 가져오기
				try {
					const member_value = JSON.parse(sessionStorage.getItem('member_key'));

					if (!member_value || !member_value.email) {
						window.location.href = '/login';
						return;
					}

					setCurrentMember(member_value);
					setFormSubmitted(member_value.submittedSurvey);
				} catch (parseError) {
					window.location.href = '/login';
					return;
				}
			}

			// ID 파라미터 처리 (URL 또는 세션스토리지)
			const item_value = searchParams.get('_id') || searchParams.get('id') || sessionStorage.getItem('item_key');

			let contract_id;

			// 기존 문서 로드 또는 신규 문서 작성 분기
			if (item_value) {
				// 기존 문서 로드
				try {
					const fetchedData = await draftService.getDraft(item_value);
					contract_id = fetchedData.id;
					const data = fetchedData.contractData;

					// 데이터 유효성 검사
					if (!data || !data.question_array || !data.clause_array) {
						alert('계약서 데이터 형식이 올바르지 않습니다. 다시 시도해 주세요.');
						return;
					}

					// 질문 그룹화
					const groupdata = groupQuestionsByCategory(data.question_array);

					// 데이터 주입
					setClauseData(data.clause_array);
					setQuestionData(data.question_array);
					setInputData(data.input_array || []);
					setQuestionGroupData(groupdata);
					setAnsweredQuestionData(data.answeredQuestion_array || []);
					setQuestionGroupKey(Object.keys(groupdata));
					setGlossary(data.clauseGuide_array || []);

					// 변수 초기화
					setClauseTemplate(data.clause_template);
					setLoaded(true);
					setContractId(contract_id);
					setDocStatus('문서 수정');
					setActivityLog(prev => ({ ...prev, docStatus: '문서 수정' }));
				} catch (error) {
					alert('계약서 데이터를 가져오는 데 실패했습니다: ' + error.message);
					setLoaded(true);
				}
			} else {
				// 신규 문서 작성
				// 데이터 소스 결정 (서버사이드 또는 클라이언트)
				let data;
				if (contractData) {
					data = contractData;
				} else {
					// 클라이언트에서 데이터 로드
					try {
						data = await fetchProcessedData('10', contract.type);
					} catch (fetchError) {
						alert('계약서 데이터를 가져오는 데 실패했습니다. 페이지를 새로고침해주세요.');
						setLoaded(true);
						return;
					}
				}

				// 데이터 유효성 검사
				if (!data || !data.clause || !data.question) {
					alert('계약서 데이터 형식이 올바르지 않습니다. 다시 시도해 주세요.');
					setLoaded(true);
					return;
				}

				contract_id = uuidv4();

				// 데이터 주입
				setClauseData(data.clause);
				setQuestionData(data.question);
				setInputData(data.input_array || []);

				// 질문 데이터 처리
				if (data.question && data.question.length > 0) {
					// binding_question_ko 유효성 확인 및 설정
					const processedQuestions = data.question.map(q => (!q.binding_question_ko ? { ...q, binding_question_ko: '기본 정보' } : q));

					// 질문 데이터로 업데이트
					if (processedQuestions !== data.question) {
						setQuestionData(processedQuestions);
					}

					// 그룹화 데이터 처리
					if (!data.grouped_question) {
						// 직접 생성
						const groupedData = groupQuestionsByCategory(processedQuestions);

						// 그룹 데이터 유효성 확인
						if (Object.keys(groupedData).length === 0) {
							const defaultGroup = { '기본 정보': processedQuestions };
							setQuestionGroupData(defaultGroup);
							setQuestionGroupKey(['기본 정보']);
						} else {
							setQuestionGroupData(groupedData);
							setQuestionGroupKey(Object.keys(groupedData));
						}
					} else {
						// 기존 그룹화 데이터 사용
						setQuestionGroupData(data.grouped_question);
						const groupKeys = Object.keys(data.grouped_question);

						if (groupKeys.length === 0) {
							const defaultGroup = { '기본 정보': processedQuestions };
							setQuestionGroupData(defaultGroup);
							setQuestionGroupKey(['기본 정보']);
						} else {
							setQuestionGroupKey(groupKeys);
						}
					}
				} else {
					// 질문 데이터가 없는 경우 기본 그룹 설정
					setQuestionGroupData({ '기본 정보': [] });
					setQuestionGroupKey(['기본 정보']);
				}

				setGlossary(data.clauseGuide || []);
				setLoaded(true);
				setContractId(contract_id);
				// 변수 초기화
				setClauseTemplate(deepClone(data.clause)); // 변하지 않는 Original Clause Data
				setQuestionTemplate([...data.question]); // 변하지 않는 Original Question Data
				setDocStatus('신규 작성');
				setActivityLog(prev => ({ ...prev, docStatus: '신규 작성' }));
			}

			// 활성화된 clause key 초기 설정
			if (processedData?.clause) {
				const activeClauses = processedData.clause.filter(x => x.is_default === true);
				let clause_keys = [];
				for (let i = 0; i < activeClauses.length; i++) {
					clause_keys.push(activeClauses[i].clause_trigger); // push all keys to array
				}
				clause_keys = uniqueArray(flatten(clause_keys)).sort(); // flat array, remove duplicates, sort ascending
				setActiveClauseKeys(clause_keys);
			}

			// 활동 로그 초기화
			const memberInfo = user || (currentMember && typeof currentMember === 'object' ? currentMember : null);
			if (memberInfo) {
				setActivityLog(prev => ({
					...prev,
					id: contract_id,
					title: contract.category + ' 계약서',
					docId: contract_id,
					_userName: memberInfo.name,
					userEmail: memberInfo.email,
					startTime: timestamp(),
				}));

				// 로그 생성
				if (contract_id) {
					const draftLog = {
						userName: memberInfo.name,
						userEmail: memberInfo.email,
						status: memberInfo.docStatus || '신규 작성',
						category: contract.title,
						title: `${contract.category} 계약서`,
						contractId: contract_id,
					};
					logService.submitDraftLog(draftLog);
				}
			}
		} catch (error) {
			console.error('데이터 로딩 오류:', error);
			alert('페이지 로딩 중 오류가 발생했습니다. 페이지를 새로고침하거나 다시 로그인해주세요.');
		}
	};

	return {
		loaded,
		currentMember,
		formSubmitted,
		setFormSubmitted,
		userOS,
		clause_template,
		question_template,
		loadDraftData,
	};
};

export default useDraftDataLoader;
