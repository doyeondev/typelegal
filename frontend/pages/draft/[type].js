import { v4 as uuidv4 } from 'uuid';
import { useSearchParams } from 'next/navigation';

import React, { useEffect, useState, useCallback, useRef } from 'react';
import _ from 'lodash';
import * as R from 'ramda';

import Head from 'next/head';

// 분리된 컴포넌트 Import
import DraftHeader from '../../components/draft/DraftHeader';
import DraftFooter from '../../components/draft/DraftFooter';
import DraftSidebar from '../../components/draft/DraftSidebar';
import DraftContent from '../../components/draft/DraftContent';
import DraftPreview from '../../components/draft/DraftPreview';

// UI Component Import
import Spinner from '/components/ui/Spinner';
import SidePanel from '/components/ui/SidePanel';
import ToastSave from '/components/ui/ToastSave';

// 유틸 함수 Import
import { fetchProcessedData, saveContractData } from '/utils/dataUtils.js';
import { findItemIndex, replaceArray, getKeyAndValue, findItem, getArrayOfKeys } from '/utils/arrayUtils.js';
import { returnCurrencyValue, returnInputValue } from '/utils/inputUtils.js';
import { removeHighlight, replaceMulCharInString } from '/utils/textUtils.js';
import { timeDiffSec, timeDiffMin, timestamp } from '/utils/timeUtils.js';
import { handleScroll, handleScroll2 } from '/utils/uxUtils.js';
import { exportContent } from '/utils/fileUtils.js';
import { resetAuthToken } from '/utils/authUtils.js';

// hook, api Import
import { useLeavePageConfirmation } from '/pages/hooks/useLeavePageConfirmation';
import { post_saveLog } from '/pages/api/logs/docSave';
import { post_draftLog } from '/pages/api/logs/docDraft';
import { post_activityLog } from '/pages/api/logs/docActivity';
import draftingApi from '/pages/api/services/draftingApi';
import { getMemberIdFromStorage } from '/pages/api/services/httpClient';

let clause_template, question_template;
let tracerKey, tracer, cidx;
let item_value;

export default function Draft({ contract }) {
	const searchParams = useSearchParams();

	const [changesOnPage, setChangesOnPage] = useState(true);
	const [newClause, setNewClause] = useState('');
	const [contractId, setContractId] = useState('');
	const [clauseData, setClauseData] = useState([]);
	const [inputData, setInputData] = useState([]);
	const [questionData, setQuestionData] = useState([]);
	const [questionGroupData, setQuestionGroupData] = useState([]);

	const [saveBtnState, setSaveBtnState] = useState(false);
	const [saveToastState, setSaveToastState] = useState(false);
	const [exportBtnState, setExportBtnState] = useState(false);
	const [needSave, setNeedSave] = useState(false);

	const [lastInput, setLastInput] = useState({ key: '', obj: [], idx: [] });

	const [loaded, isLoaded] = useState(false);

	const [itemIndex, setItemIndex] = useState(0);
	const [lastItemIndex, setLastItemIndex] = useState(0);
	const [progress, setProgress] = useState(0);
	const [questionGroupKey, setQuestionGroupKey] = useState([]);

	const [answeredQuestionData, setAnsweredQuestionData] = useState([]);
	// NEW
	const [glossary, setGlossary] = useState([]);

	// NEW
	const [showSidebar, setShowSidebar] = useState(false);

	// NEW
	const [activeClauseKeys, setActiveClauseKeys] = useState([]);
	const [currentMember, setCurrentMember] = useState('');

	// Survey Modal
	const [isOpen, setIsOpen] = useState(false);

	const [userOS, setUserOS] = useState('');
	const [questionPanel, setQuestionPanel] = useState(true);
	const [docStatus, setDocStatus] = useState('');
	const [activityLog, setActivityLog] = useState({ id: '', title: '', _userName: '', userEmail: '', startTime: timestamp(), endTime: '', docProgress: '', docStatus: '', docId: '', duration: 0, durationMin: 0 });
	const [formSubmitted, setFormSubmitted] = useState('');

	useLeavePageConfirmation(changesOnPage, activityLog);

	useEffect(() => {
		async function getPageData() {
			try {
				localStorage.theme = 'light';

				if (window.navigator.userAgent.includes('Mac')) {
					setUserOS('Mac');
				} else {
					setUserOS('Window');
				}
				console.log('window.navigator.userAgent', window.navigator.userAgent);

				// JWT 토큰 확인
				const authToken = localStorage.getItem('auth_token');
				console.log('인증 토큰 존재 여부:', !!authToken);

				// 세션 스토리지 정보 확인
				console.log('세션 스토리지 키:', Object.keys(sessionStorage));
				console.log('member_key 존재 여부:', !!sessionStorage.getItem('member_key'));

				// URL에서 id 파라미터 추출 (수정: _id로 변경)
				item_value = searchParams.get('_id') || searchParams.get('id');
				console.log('URL에서 추출한 ID 값:', item_value);

				// 세션 스토리지에서 item_key 확인
				const session_item_value = sessionStorage.getItem('item_key');
				console.log('세션 스토리지에서 추출한 ID 값:', session_item_value);

				// URL 파라미터가 없으면 세션 스토리지 값 사용
				if (!item_value && session_item_value) {
					item_value = session_item_value;
					console.log('세션 스토리지 값으로 ID 설정:', item_value);
				}

				let contract_id, member_value;

				// 로그인 여부 확인
				if (!sessionStorage.getItem('member_key')) {
					console.log('세션에 사용자 정보가 없습니다 - 로그인 페이지로 리디렉션');
					// 현재 URL을 세션 스토리지에 저장
					const currentUrl = window.location.pathname + window.location.search;
					sessionStorage.setItem('redirectAfterLogin', currentUrl);
					// 로그인 페이지로 리디렉션
					window.location.href = '/login';
					return;
				}

				// 아이템이 있으면
				try {
					member_value = JSON.parse(sessionStorage.getItem('member_key'));
					console.log('로드된 사용자 정보:', member_value);

					if (!member_value || !member_value.email) {
						console.error('세션에 사용자 정보가 없거나 불완전합니다');
						// 로그인 페이지로 리디렉션
						window.location.href = '/login';
						return;
					}

					setCurrentMember(member_value);

					if (item_value) {
						console.log('기존 문서 로드 중:', item_value);

						try {
							// 변경: 새로운 API 클라이언트를 사용하여 드래프트 데이터 로드
							const fetchedData = await draftingApi.getDraft(item_value);
							console.log('드래프트 데이터 로드 완료:', fetchedData);

							contract_id = fetchedData.id;

							// contractData에서 필요한 데이터 추출
							const data = fetchedData.contractData;

							console.log('계약서 데이터:', data);

							// 데이터 확인 및 처리
							if (!data || !data.question_array || !data.clause_array) {
								console.error('필수 계약서 데이터가 없습니다:', data);
								alert('계약서 데이터 형식이 올바르지 않습니다. 다시 시도해 주세요.');
								return;
							}

							let groupdata = _.groupBy(_.orderBy(data.question_array, ['midx', 'qidx'], ['asc', 'asc']), _ => _.binding_question_ko);

							// 2. inject Data
							setClauseData(data.clause_array);
							setQuestionData(data.question_array);
							setInputData(data.input_array || []);
							setQuestionGroupData(_.groupBy(_.orderBy(data.question_array, ['midx', 'qidx'], ['asc', 'asc']), _ => _.binding_question_ko));
							setAnsweredQuestionData(data.answeredQuestion_array || []);
							setQuestionGroupKey(Object.keys(groupdata));
							setGlossary(data.clauseGuide_array || []);

							// 3. init Variables
							clause_template = data.clause_template; // 변하지 않는 Original Clause Data
							isLoaded(true);
							setContractId(contract_id);
							setDocStatus('문서 수정');
							setActivityLog(prev => ({ ...prev, docStatus: '문서 수정' }));
						} catch (error) {
							console.error('드래프트 데이터 로드 실패:', error);
							alert('계약서 데이터를 가져오는 데 실패했습니다: ' + error.message);
							isLoaded(true);
						}
					} else {
						let query1 = '10';
						let query2 = contract.type;
						console.log('신규 계약서 작성 - contract 정보:', contract);
						console.log('API 호출 파라미터 - query1:', query1, 'query2:', query2);

						// 로딩 표시
						isLoaded(false);

						try {
							console.log('fetchProcessedData 호출 전');
							const data = await fetchProcessedData(query1, query2);
							console.log('fetchProcessedData 호출 후 - 결과:', data);

							// 백엔드 응답 데이터 더 자세히 기록
							console.log('응답 데이터 구조:', Object.keys(data));
							console.log('clause 데이터 존재:', !!data.clause, '길이:', data.clause?.length);
							console.log('question 데이터 존재:', !!data.question, '길이:', data.question?.length);
							console.log('grouped_question 데이터 존재:', !!data.grouped_question);

							// 데이터 검증
							if (!data || !data.clause || !data.question) {
								console.error('필수 데이터가 없습니다:', data);
								alert('계약서 데이터 형식이 올바르지 않습니다. 다시 시도해 주세요.');
								return;
							}

							contract_id = uuidv4();
							console.log('[FETCH] data', data);

							// 2. 데이터 주입
							setClauseData(data.clause);
							setQuestionData(data.question);
							setInputData(data.input_array || []);

							// 질문 데이터가 있는지 확인하고 처리
							if (data.question && data.question.length > 0) {
								// 빈 binding_question_ko 확인 및 설정
								const processedQuestions = data.question.map(q => {
									if (!q.binding_question_ko) {
										console.log(`질문에 binding_question_ko가 없습니다. ID: ${q.id}, 기본값 설정합니다.`);
										return { ...q, binding_question_ko: '기본 정보' };
									}
									return q;
								});

								// 가공된 질문 데이터로 업데이트
								if (processedQuestions !== data.question) {
									console.log('가공된 질문 데이터로 업데이트합니다.');
									setQuestionData(processedQuestions);
								}

								// grouped_question이 없는 경우 직접 생성
								if (!data.grouped_question) {
									console.log('grouped_question이 없어 직접 생성합니다.');
									const groupedData = _.groupBy(_.orderBy(processedQuestions, ['midx', 'qidx'], ['asc', 'asc']), q => q.binding_question_ko || '기본 정보');
									console.log('생성된 grouped_question의 키:', Object.keys(groupedData));

									// 최소한 하나의 그룹이 있는지 확인
									if (Object.keys(groupedData).length === 0) {
										console.error('생성된 grouped_question이 비어 있습니다. 기본 그룹 생성');
										groupedData['기본 정보'] = processedQuestions;
									}

									setQuestionGroupData(groupedData);
									setQuestionGroupKey(Object.keys(groupedData));
								} else {
									// 기존 그룹화 데이터 사용
									setQuestionGroupData(data.grouped_question);
									const groupKeys = Object.keys(data.grouped_question);
									console.log('기존 grouped_question의 키:', groupKeys);

									if (groupKeys.length === 0) {
										console.error('백엔드에서 받은 grouped_question이 비어 있습니다. 기본 그룹 생성');
										const defaultGroup = { '기본 정보': processedQuestions };
										setQuestionGroupData(defaultGroup);
										setQuestionGroupKey(['기본 정보']);
									} else {
										setQuestionGroupKey(groupKeys);
									}
								}
							} else {
								console.error('질문 데이터가 비어 있습니다. 기본 그룹 생성');
								const emptyGroup = { '기본 정보': [] };
								setQuestionGroupData(emptyGroup);
								setQuestionGroupKey(['기본 정보']);
							}

							setGlossary(data.clauseGuide || []);

							isLoaded(true);
							setContractId(contract_id);
							// 3. 변수 초기화
							clause_template = R.clone(data.clause); // 변하지 않는 Original Clause Data
							question_template = [...data.question]; // 변하지 않는 Original Question Data
							setDocStatus('신규 작성');
							setActivityLog(prev => ({ ...prev, docStatus: '신규 작성' }));
						} catch (error) {
							console.error('데이터 로딩 오류:', error);
							console.error('에러 상세:', error.response?.data || error.message);
							alert('계약서 데이터를 가져오는 데 실패했습니다: ' + error.message);
							isLoaded(true); // 로딩 상태 해제
						}
					}
					setFormSubmitted(member_value.submittedSurvey);
					setActivityLog(prev => ({ ...prev, ...{ id: contract_id, title: contract.category + ' 계약서', docId: contract_id, _userName: member_value.name, userEmail: member_value.email } }));
				} catch (parseError) {
					console.error('사용자 정보 파싱 오류:', parseError);
					// 로그인 페이지로 리디렉션
					window.location.href = '/login';
					return;
				}
			} catch (error) {
				console.error('페이지 데이터 로딩 중 오류 발생:', error);
				alert('페이지 로딩 중 오류가 발생했습니다. 페이지를 새로고침하거나 다시 로그인해주세요.');
			}
		}
		getPageData();
	}, []);

	function postSaveLog() {
		let saveLog = { userName: currentMember.name, userEmail: currentMember.email, category: contract.title, title: `${contract.category} 계약서`, contractId: contractId };
		console.log('saveLog', saveLog);
		// post_saveLog(saveLog);
	}

	// draft log post
	useEffect(() => {
		if (contractId !== '' && docStatus !== '' && currentMember !== '') {
			console.log('entered post');
			let draftLog = { userName: currentMember.name, userEmail: currentMember.email, status: docStatus, category: contract.title, title: `${contract.category} 계약서`, contractId: contractId };
			post_draftLog(draftLog);
			post_activityLog(activityLog);
		}
	}, [docStatus, currentMember]);

	/* useEffect Hook (2) - SCROLL HOOK */
	// lastInput이 업데이트 되면 스크롤 해주고
	// answeredQuestionData도 업데이트 해준다
	// SCROLL HOOK에서 트리거 됨
	const updateAnsweredQuestion = () => {
		const filteredQuestionData = questionData.filter(x => x.value && x.value.length > 0);
		// console.log('filteredQuestionData', filteredQuestionData)
		let newState = [...answeredQuestionData];
		newState = filteredQuestionData;
		setAnsweredQuestionData(newState);
	};

	const afterRenderFunction = useCallback(async () => {
		setTimeout(() => {
			handleScroll(lastInput.key); // lastInput 렌더링이 끝나면 해당 컴포넌트로 화면을 스크롤
		}, 100);
		updateAnsweredQuestion();
		console.log('lastInput UPDATED : ', lastInput);
	}, [lastInput]);

	useEffect(() => {
		afterRenderFunction();
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [afterRenderFunction]);

	// 새로운부분
	useEffect(() => {
		const unloadCallback = event => {
			// console.log('이탈발생')
			let saveLog = { ...activityLog, ...{ endTime: timestamp(), duration: timeDiffSec(activityLog.startTime, timestamp()), durationMin: timeDiffMin(activityLog.startTime, timestamp()) } };
			post_activityLog(saveLog);
			// console.log('saveLog', saveLog)
			event.preventDefault();
			event.returnValue = '';
			return '';
		};

		window.addEventListener('beforeunload', unloadCallback);
		return () => window.removeEventListener('beforeunload', unloadCallback);
		// }
	}, [activityLog]);

	/* useEffect Hook (3) - 로그 확인용 & 데이터 저장용 HOOK */
	useEffect(() => {
		if (loaded === true) {
			// 상태 업데이트 및 로그 기록
			setQuestionProgress();

			// 디버깅: 세션 스토리지에서 사용자 정보 확인
			const memberData = sessionStorage.getItem('member_key');
			console.log('세션에 저장된 사용자 정보:', memberData ? JSON.parse(memberData) : '없음');

			// member_id 가져오기
			const member_id = getMemberIdFromStorage();
			console.log('가져온 member_id:', member_id);

			if (!member_id) {
				console.error('사용자 ID를 가져올 수 없습니다. 로그인 상태를 확인하세요.');
			}

			// 저장할 데이터 구조 구성 - Supabase drafting_data 테이블 스키마에 맞춤
			let toSave = {
				id: contractId,
				contract_title: contract.title,
				type: contract.category,
				status: 'stage1',
				contract_data: {
					questionGroup_array: questionGroupData,
					question_array: questionData,
					clause_template: clause_template,
					clause_array: clauseData,
					input_array: inputData,
					clauseGuide_array: glossary,
					answeredQuestion_array: answeredQuestionData,
				},
				query: contract.type,
				contract_info: contract,
				member_id: member_id, // 명시적으로 member_id 설정
				progress: activityLog.docProgress,
			};

			console.log('if 밖에서. toSave', toSave);
			// 저장 버튼이 눌렸을 때
			if (saveBtnState === true) {
				// 유효한 member_id가 없으면 저장하지 않고 로그인 페이지로 리디렉션
				if (!member_id) {
					console.error('사용자 정보를 찾을 수 없습니다. 로그인이 필요합니다.');
					alert('사용자 정보를 찾을 수 없습니다. 로그인해 주세요.');
					setSaveBtnState(false);

					// 현재 URL을 세션 스토리지에 저장 후 로그인 페이지로 리디렉션
					const currentUrl = window.location.pathname + window.location.search;
					sessionStorage.setItem('redirectAfterLogin', currentUrl);
					window.location.href = '/login';
					return;
				}

				// 토큰 확인 및 재설정
				resetAuthToken();
				console.log('토큰 있음:', localStorage.getItem('auth_token'));

				// 새로운 API 클라이언트를 통해 데이터 저장
				console.log('저장 요청 데이터:', toSave);
				draftingApi
					.saveDraft(toSave)
					.then(response => {
						console.log('드래프트 저장 성공:', response);
						setSaveToastState(true);
						// postSaveLog();
					})
					.catch(error => {
						console.error('드래프트 저장 실패:', error);

						// 오류 상세 정보 표시
						let errorMsg = '데이터 저장에 실패했습니다';

						// 로그인 관련 오류인 경우 로그인 페이지로 리디렉션
						if (error.status === 401 || error.status === 403) {
							errorMsg += ': 로그인이 필요합니다';
							alert(errorMsg);
							setSaveBtnState(false);

							// 현재 URL을 세션 스토리지에 저장 후 로그인 페이지로 리디렉션
							const currentUrl = window.location.pathname + window.location.search;
							sessionStorage.setItem('redirectAfterLogin', currentUrl);
							window.location.href = '/login';
							return;
						} else if (error.message) {
							errorMsg += ': ' + error.message;
						}

						alert(errorMsg);
						setSaveBtnState(false);
					});
			}

			// 내보내기 버튼이 눌렸을 때
			if (exportBtnState === true) {
				exportContent(clauseData, inputData, contract.category);
				setExportBtnState(false);
			}
		}
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [clauseData, contract, questionData, inputData, loaded, questionGroupData, questionGroupKey, saveBtnState, exportBtnState, glossary, answeredQuestionData, contractId, currentMember]);

	/**
	 * Trigger 질문 답변 -> 조항 추가/삭제
	 */
	const syncOutputSection = (idx, newValue, item, index, id) => {
		let clauseItem, clauseTitle;
		setNewClause(item.options[index].trigger);

		if (item.options[index].trigger === 'deleteAll') {
			clauseItem = findItem(clauseData, item.binding_key, 'binding_question'); // 단순 추가, 삭제 trigger는 binding_key와 binding_question을 매치 시킴
			clauseTitle = clauseItem.clause_title_en;
		} else {
			clauseItem = findItem(clauseData, item.options[index].trigger, 'binding_question');
			clauseTitle = clauseItem.clause_title_en;
		}

		// 1. Remove all clauses with selected cidx
		let newState = [...clauseData].map(obj => {
			if (obj.clause_title_en === clauseTitle) {
				console.log('[syncOutputSection] entered deleteClause', obj.binding_question);
				return { ...obj, ...{ is_default: false } }; // 전체 조항은 다 없애고
			}
			return obj;
		});

		// 2. Add new clauses from cidx, but that matches binding_question
		// deleteAll trigger = 안함
		if (item.options[index].trigger !== 'deleteAll') {
			newState = [...newState].map(obj => {
				if (obj.binding_question === item.options[index].trigger) {
					return { ...obj, ...{ is_default: true } }; // 새롭게 선택된 조항 골라줌
				}
				return obj;
			});
		}

		// 3. Lastly, update clause numbering
		let clauseNum = 1;
		for (let i = 0; i < newState.length; i++) {
			if (newState[i].is_clause === true && newState[i].is_default === true) {
				newState[i].cno = clauseNum;
				clauseNum = clauseNum + 1;
			}
		}
		setClauseData(newState); // clauseData.binding_input 부분 업데이트
		syncInputSection(newState, newValue, item, index, id);

		if (item.options[index].trigger !== 'deleteAll') {
			setTimeout(() => {
				handleScroll2(item.options[index].trigger); // lastInput 렌더링이 끝나면 해당 컴포넌트로 화면을 스크롤 해줍니다.
			}, 100);
		}
	};

	/**
	 * Trigger 질문 답변 -> 자식질문 추가/삭제 진행
	 */
	const syncInputSection = (clauseArray, newValue, item, index, id) => {
		let activeClauses = clauseArray.filter(x => x.is_default === true);

		let clause_keys = [];
		for (let i = 0; i < activeClauses.length; i++) {
			clause_keys.push(activeClauses[i].clause_trigger); // push all keys to array
		}
		clause_keys = _.uniq(_.flattenDeep(clause_keys)).sort(); // flat array, remove duplicates, sort ascending
		// console.log('[syncInputSection] currentBindingKeys', clause_keys)
		// 부모 질문 답변이 안 된 경우에는 계약 variable에 따라서 미리 질문이 추가될 수 있기 때문에
		// 부모 질문 답변이 안 된 경우에는 질문 추가 하지 않는다.
		// let parentQuestion = findItem(questionData, obj.binding_parent, 'binding_key')

		setActiveClauseKeys(clause_keys);

		let newState = [...questionData];
		let qIndex = findItemIndex(questionData, id, 'id');
		newState[qIndex].value = newValue; // 먼저 value를 업데이트 해준다. 아래 mapping에서 value가 없는 trigger input은 걸러야하기 때문에.

		newState = newState.map(obj => {
			if (clause_keys.includes(obj.binding_key) && !obj.output_type.includes('trigger')) {
				return { ...obj, is_default: true }; // 전체 key 배열에 binding_key가 있는 질문을 true로 return
				// && !obj.is_default 추가 안하면 계약 variable에 따라 없어지는 질문 생김
			} else if (!clause_keys.includes(obj.binding_key) && !obj.output_type.includes('trigger') && !obj.is_fixed) {
				// console.log('[syncInputSection] entered syncInput TWO')
				return { ...obj, is_default: false }; // 전체 key 배열에 binding_key가 없는 경우 질문을 false로 return 한다.
			}

			return obj; // otherwise return the object as is
		});
		// findItemIndex(questionData, target_id, 'binding_key')
		if (item.question_type.includes('radio') || item.question_type.includes('checkbox')) {
			// radio나 checkbox인 경우, value 업데이트 이전에 checked 상태부터 먼저 업데이트 해준다.
			handleCheckboxState(newState, item, index);
		} else {
			// dropdown의 경우에는 value를 업데이트 해 줘야 재렌더링 되어도 값이 남아있다
			setQuestionData(newState);
			setQuestionGroupData(_.groupBy(_.orderBy(newState, ['midx', 'qidx'], ['asc', 'asc']), _ => _.binding_question_ko));
		}
	};

	/**
	 * 일반질문 답변 -> questionData value 업데이트
	 */
	const handleQuestionData = (id, newValue, item, index) => {
		// console.log('[handleQuestionData] entered handleQuestionData 1, value : ', newValue)
		const newState = [...questionData].map(obj => {
			if (obj.id === id) {
				// if key equals key
				// console.log('[handleQuestionData] entered handleQuestionData 2')
				return { ...obj, value: newValue }; // update content_en property
			}
			return obj; // otherwise return the object as is
		});
		// console.log('questionData Updated')
		if (!item) return; // 새로고침 에러 Fix
		if (item.question_type.includes('radio') || item.question_type.includes('checkbox') || item.question_type.includes('dropdown')) {
			handleCheckboxState(newState, item, index); // 체크박스 또는 라디오는 옵션 checked를 바꿔주고, 이 함수 안에서 set state 해줌
		} else {
			setQuestionData(newState);
			setQuestionGroupData(_.groupBy(_.orderBy(newState, ['midx', 'qidx'], ['asc', 'asc']), _ => _.binding_question_ko));
		}
	};

	/**
	 * 일반질문 답변 -> clauseData.binding_input 렌더링
	 */
	const handleClauseData = (idx, key, newValue) => {
		// console.log('[handleClauseData] FUNCTION TRIGGERED - handleClauseData')
		// console.log('[handleClauseData] inside handleClauseData', idx, key, newValue)
		setNeedSave(true);
		if (!idx) return; // idx 없을 시 에러 안뜨게 return. 새로고침 에러떠서 추가함
		idx.forEach(i => {
			const targetArr = [...clauseData[i].binding_input];
			const newArr = replaceArray(targetArr, key, newValue);
			const newState = [...clauseData].map(obj => {
				if (obj.i === i) {
					return { ...obj, binding_input: newArr }; // (i === cidx) 해당되는 인덱스의 binding_input 객체 업데이트 (* 중요 로직 *)
				}
				return obj; // (i !== cidx) 이면 return the object as is
			});
			//   setClauseData(newState) // clauseData.binding_input 부분 업데이트
			handleHighlight(newState, idx, key); // setState Hook (2) 로 이동해서 로직 진행
		});
		// handleHighlight(idx, key) // setState Hook (2) 로 이동해서 로직 진행
	};

	/**
	 * 일반질문 답변 -> 조항 본문 하이라이트 추가/제거 처리
	 */
	function handleHighlight(newState, cidx, key) {
		// console.log('[handleHighlight] cidx', cidx)
		// let newState = [...clauseData]
		if (lastInput['key'] !== '' && lastInput['key'] !== key) {
			console.log('else if 1 [HANDLE HIGHLIGHT]');
			console.log('[[LAST INPUT]]', lastInput);

			// console.log('handle highlight [case 1]') // lastInput['key']: 이전의 변경 대상이었던 조항의 인덱스 배열. key: 이전 item과 현재 item의 key 값이 다르면 하이라이트를 제거하기 위해 사용 (같으면 하이라이트 유지되어야 함)
			lastInput['idx'].forEach(i => {
				console.log('            진입 : REMOVE HIGHLIGHT');
				// 핵심 로직 1 : handleAddHighlight()와 모든게 동일하고, 반환하는 <span> 스타일만 다름.
				// 핵심 로직 2 : lastInput은 현재 단계의 직전에 사용되었던 key:[...] value: [...] 이고 (setState Hook로 관리되고 있음)
				// const newState = [...clauseData]
				// console.log(`newState[${i}] before : `, newState[i].content_en)
				newState[i].content_en = removeHighlight(newState[i].content_en, lastInput['obj'], lastInput['key']); // removeHighlight => clauseData 에서 바꿔줘야지 조항 데이터가 유지됨

				newState[i] = R.set(R.lensProp('id'), uuidv4(), newState[i]);
				// setClauseData(newState)
			});
			cidx.forEach(i => {
				tracer = getKeyAndValue(clauseData[i].binding_input); // [key: [...], value: [...]]
				newState[i].content_en = replaceMulCharInString(clause_template[i].content_en, tracer, tracerKey); // replaceMulCharInString = clause_template 에서
				newState[i] = R.set(R.lensProp('id'), uuidv4(), newState[i]);
				// setClauseData(newState)
			});
		} else {
			console.log('else if 2 [HANDLE HIGHLIGHT]');
			console.log('[[LAST INPUT]]', lastInput);
			cidx.forEach(i => {
				tracer = getKeyAndValue(clauseData[i].binding_input); // [key: [...], value: [...]]

				// 핵심 로직 1 : clause_template의 content_en은 항상 빈칸("DEFAULT")임. clause_template 배열은 변형하지 X, 원본 데이터로 참고함.
				// 핵심 로직 2 : tracer의 key: [...] value: [...] 가 비어있으면 "DEFAULT" 수정 없이 반환.
				// 핵심 로직 3 : tracer에 저장된 값이 있으면 DEFAULT의 {key}값을 value로 수정한 조항 string을 반환함.

				let newState = [...clauseData];
				// newState[i].content_en = replaceMulCharInString(newState[i].content_en, tracer, tracerKey)
				newState[i].content_en = replaceMulCharInString(clause_template[i].content_en, tracer, tracerKey);

				newState[i] = R.set(R.lensProp('id'), uuidv4(), newState[i]);
				// setClauseData(newState)
			});
		}
		setClauseData(newState);
	}

	/**
	 * 라디오/체크박스 "checked" 처리
	 */
	const handleCheckboxState = (newState, item, index) => {
		console.log('[handleCheckboxState] item!!!!!!', item);
		index = parseInt(index);
		console.log('[handleCheckboxState] index from handleCheckboxState', index);

		newState = newState.map(obj => {
			if (obj.id === item.id) {
				console.log('[handleCheckboxState] 첫 if 들어옴');
				const newOptions = [...obj.options];
				if (item.question_type.includes('checkbox')) {
					console.log('[handleCheckboxState] if checkbox 들어옴');
					if (newOptions[index].checked === 'checked') {
						newOptions[index] = R.set(R.lensProp('checked'), '', newOptions[index]);
					} else {
						newOptions[index] = R.set(R.lensProp('checked'), 'checked', newOptions[index]);
					}
				} else if (item.question_type.includes('radio') || item.question_type.includes('dropdown')) {
					console.log('[handleCheckboxState] else if radio 들어옴');
					for (let i = 0; i < newOptions.length; i++) {
						if (i === index) {
							console.log('[handleCheckboxState] 1', i, index, newOptions.length);
							newOptions[i] = R.set(R.lensProp('checked'), 'checked', newOptions[i]);
						} else {
							console.log('[handleCheckboxState] 2', i, index, newOptions.length);
							newOptions[i] = R.set(R.lensProp('checked'), '', newOptions[i]);
						}
					}
					console.log('[handleCheckboxState] after loop', newOptions);
				}
				return { ...obj, options: newOptions };
			}
			return obj; // otherwise return the object as is
		});
		setQuestionData(newState);
		setQuestionGroupData(_.groupBy(_.orderBy(newState, ['midx', 'qidx'], ['asc', 'asc']), _ => _.binding_question_ko));
	};

	/**
	 * 일반질문 답변 -> inputData 배열 속 value 값 업데이트
	 */
	const handleInputData = (key, newValue) => {
		const newState = [...inputData].map(obj => {
			if (obj.key === key) {
				// if key equals key
				return { ...obj, value: newValue }; // update content_en property
			}
			return obj; // otherwise return the object as is
		});
		setInputData(newState);
	};

	/**
	 * 마지막 답변 질문 트래킹 -> 하이라이트 유지/제거 로직 위함.
	 */
	const updateLastInput = (key, idx) => {
		setLastInput(lastInput => ({
			...lastInput,
			...{ key: key, obj: tracer, idx: idx }, // update lastInput state
		}));
	};

	/**
	 * 일반질문 답변 -> 인풋 Event Handler (메인 event handler임)
	 */
	const onChangeHandler = e => {
		console.log('Entered onChangeHandler');
		let binding_value, index;
		let item = findItem(questionData, e.target.id, 'id'); // returns object
		console.log('onchange item', item);
		tracerKey = item.binding_key;
		cidx = item.binding_cidx;

		if (item.question_type === 'input_currency') {
			console.log('[onChangeHandler] input_currency entered');
			binding_value = returnCurrencyValue(e);
		} else if (item.question_type.includes('dropdown')) {
			console.log("item.options[e.target.getAttribute('name')].value", item.options[e.target.getAttribute('name')].value);
			binding_value = item.options[e.target.getAttribute('name')].value;
		} else {
			binding_value = returnInputValue(e, item);
		}
		// find index for checkbox and radio inputs
		if (e.target.getAttribute('index')) {
			index = e.target.getAttribute('index');
			console.log('[onChangeHandler] index from onChange', index);
		}
		// if trigger run 1
		if (item.output_type.includes('trigger')) {
			syncOutputSection(item.binding_cidx, binding_value, item, index, item.id);
		} else {
			handleQuestionData(e.target.id, binding_value, item, index);
			handleClauseData(item.binding_cidx, item.binding_key, binding_value);
			handleInputData(item.binding_key, binding_value);
			updateLastInput(item.binding_key, item.binding_cidx);
		}

		// 질문 응답 후 진행률 업데이트
		setTimeout(() => {
			setQuestionProgress();
		}, 100);
	};

	function setQuestionProgress() {
		let allQuestions = questionData.filter(x => x.is_default === true);
		let answeredQuestions = questionData.filter(x => x.is_default === true && x.value && x.value.length > 0);
		let progressPercentage = Math.round((answeredQuestions.length / allQuestions.length) * 100);
		let currentProgress = `${answeredQuestions.length}/${allQuestions.length} (${progressPercentage}%)`;

		// 진행률(progress) 상태도 업데이트 - 실제 답변한 질문 비율 기준
		// setProgress(progressPercentage); // 나중에 사용할 주석.

		// 기존 활동 로그 기록 유지
		setActivityLog(prev => ({ ...prev, ...{ endTime: timestamp(), docProgress: currentProgress, duration: timeDiffSec(prev.startTime, timestamp()), durationMin: timeDiffMin(prev.startTime, timestamp()) } }));
	}

	// ("이전질문", "다음질문" 버튼 눌렀을 때 작동) 버튼 event handler
	function onQBtnClickHandler(e) {
		let idArray = getArrayOfKeys(questionData.filter(x => x.is_default === true));

		if (e.target.id === 'previous' && itemIndex !== 0) {
			console.log('[onQBtnClickHandler] entered 1');
			//   console.log(itemIndex - 1)
			setLastItemIndex(itemIndex);
			setItemIndex(itemIndex - 1);
			let progressNum = (itemIndex - 1) / (questionGroupKey.length - 1);
			console.log('[onQBtnClickHandler] progress : ', Math.round(progressNum * 100));
			setProgress(Math.round(progressNum * 100));
		} else if (e.target.id === 'next' && itemIndex !== questionGroupKey.length - 1) {
			console.log('[onQBtnClickHandler] entered 2');
			//   console.log(itemIndex + 1)
			setLastItemIndex(itemIndex);
			setItemIndex(itemIndex + 1);
			let progressNum = (itemIndex + 1) / (questionGroupKey.length - 1);
			console.log('[onQBtnClickHandler] progress : ', Math.round(progressNum * 100));
			setProgress(Math.round(progressNum * 100));
		} else if (e.target.id === 'next' && itemIndex === questionGroupKey.length - 1) {
			setQuestionPanel(false);
		}
	}

	/**
	 * 일반질문 답변 -> 체크박스 '기타' 옵션의 value = 'checked' 처리
	 */
	const etcClick = e => {
		console.log('e', e.target.value);
		let checked = document.querySelectorAll(`[name=${e.target.name}]:checked`);
		console.log('eee', checked);
		if (checked.length > 0) {
			console.log('etc checked');
		} else {
			console.log('etc notChedked');
		}
		if (e.target.getAttribute('checked')) {
			index = e.target.getAttribute('checked');
			console.log('[etcClickHandler] index from onChange', index);
		}
	};

	// 체크박스 '기타' 옵션 선택 시 조항 output 처리
	const etcChange = (e, i) => {
		let binding_value;
		let index = i;
		console.log('e', e.target.value);
		console.log('name', e.target.name);
		let name = e.target.name.substring(1);
		let qIndex = findItemIndex(questionData, name, 'binding_key'); // returns object

		// console.log('item!!', questionData[qIndex].options)
		let newState = [...questionData];
		let newOptions = [...questionData[qIndex].options];
		console.log('newOptions', newOptions);
		newOptions.at(-1).value = e.target.value;

		newState[qIndex].options = newOptions;

		let item = questionData[qIndex];

		tracerKey = item.binding_key;
		cidx = item.binding_cidx;

		let checked = Array.from(document.querySelectorAll(`[name=${name}]:checked`));
		let selectedValue = [];
		checked.forEach(function (e) {
			selectedValue.push(`${e.value}`);
		});
		selectedValue.pop();
		console.log('selectedValue', selectedValue);
		if (selectedValue.length > 0) {
			binding_value = selectedValue.join(', ') + ', ' + e.target.value;
		} else {
			binding_value = e.target.value;
		}

		newState[qIndex].value = binding_value;

		setQuestionData(newState);
		handleClauseData(item.binding_cidx, item.binding_key, binding_value);
		handleInputData(item.binding_key, binding_value);
		updateLastInput(item.binding_key, item.binding_cidx);
	};

	// 기타 ("조항 빈칸" 누르면 해당되는 질문으로 이동) Lookupå
	const clauseClickHandler = e => {
		let split_id, target_id;
		if (e.target.className === 'draft' || e.target.className === 'drafted' || e.target.className === 'variable') {
			console.log('[clauseClickHandler] clicked draft');
			console.log('[clauseClickHandler] target : ', e.target.id);
			split_id = e.target.id.split('span_');
			console.log('[clauseClickHandler] split_id', split_id);
			target_id = split_id[1];
		}
		if (target_id) {
			console.log('[clauseClickHandler] target_id', target_id);
			const target = document.getElementsByName(target_id);
			console.log('[clauseClickHandler] target', target);
			// 누르면 이동하는 기능
			let questionIndex = findItemIndex(questionData, target_id, 'binding_key'); // question_template
			let question = questionData[questionIndex]; // question_template
			let title = question.binding_question_ko;
			let newIndex = questionGroupKey.indexOf(title);
			setLastItemIndex(itemIndex);
			setItemIndex(newIndex);

			if (target.length > 1) {
				target[1].focus();
				target[1].scrollIntoView({
					behavior: 'smooth',
					block: 'center',
					inline: 'center',
				});
			}
		}
	};
	let qNo = 0;

	// SidePanel의 '수정하기' 클릭시 event handler
	const onEditClickHandler = e => {
		// setLastItemIndex(itemIndex)
		console.log('clicked');
		let currentIndex = parseInt(e.target.id);
		setItemIndex(currentIndex);
		let progressNum = currentIndex / (questionGroupKey.length - 1);
		console.log('itemIndex after edit click', itemIndex);
		setProgress(Math.round(progressNum * 100));
	};

	// 질문의 '해설보기' 클릭시 event handler
	function toggleQuestionTip(e) {
		console.log('e.target.id', e.target.id);
		console.log('e.target.name', e.target.name);

		let newState = [...questionData];
		let qIndex = findItemIndex(questionData, e.target.id, 'id');
		console.log('qIndex', qIndex);
		// console.log('toggleState', !newState[qIndex].bool_question_tip)
		newState[qIndex].bool_question_tip = !newState[qIndex].bool_question_tip;
		newState[qIndex] = R.set(R.lensProp('id'), uuidv4(), newState[qIndex]);

		setQuestionData(newState);
		setQuestionGroupData(_.groupBy(_.orderBy(newState, ['midx', 'qidx'], ['asc', 'asc']), _ => _.binding_question_ko));
	}

	//   h-[calc(100vh-9rem)]
	//   grid grid-cols-[240px_1fr_240px]
	return (
		<>
			{/* <SidePanel /> */}
			<div className="flex flex-col h-screen text-gray-600 body-font relative">
				{/* 1. HEADER 상단 패널 전체 */}
				<Head>
					<title>{`타입리걸 | ${contract.category} 계약서`}</title>
					<meta name="description" content={`${contract.category} 계약서 - 타입리걸`} />
					<meta property="og:title" content={`${contract.category} 계약서 작성하기`} />
					<link rel="icon" href="/favicon.ico" />
				</Head>
				<ToastSave saveToastState={saveToastState} setSaveToastState={setSaveToastState} />

				{/* 헤더 컴포넌트 */}
				<DraftHeader
					currentMember={currentMember}
					formSubmitted={formSubmitted}
					setIsOpen={setIsOpen}
					isOpen={isOpen}
					setFormSubmitted={setFormSubmitted}
					setExportBtnState={setExportBtnState}
					contract={contract}
					contractId={contractId}
					questionData={questionData}
					clauseData={clauseData}
					inputData={inputData}
					setSaveBtnState={setSaveBtnState}
				/>

				{loaded === true ? (
					<>
						{/* 2. 메인페이지 전체 */}
						<SidePanel submittedData={answeredQuestionData} onEditClickHandler={onEditClickHandler} showSidebar={showSidebar} setShowSidebar={setShowSidebar} />
						<div className="grid grid-cols-[260px_1fr_1.2fr] h-[100%] w-screen overflow-hidden">
							{/* 2.1. 왼쪽 패널 전체 */}
							<DraftSidebar activeClauseKeys={activeClauseKeys} questionData={questionData} questionGroupKey={questionGroupKey} progress={progress} showSidebar={showSidebar} setShowSidebar={setShowSidebar} />

							{/* 2.2. 중앙 패널 전체 */}
							<DraftContent
								questionPanel={questionPanel}
								questionGroupData={questionGroupData}
								questionGroupKey={questionGroupKey}
								itemIndex={itemIndex}
								etcClick={etcClick}
								etcChange={etcChange}
								onChangeHandler={onChangeHandler}
								toggleQuestionTip={toggleQuestionTip}
								onQBtnClickHandler={onQBtnClickHandler}
								setQuestionPanel={setQuestionPanel}
								questionData={questionData}
							/>

							{/* 2.3. 우측 패널 전체 */}
							<DraftPreview clauseData={clauseData} newClause={newClause} contract={contract} onClauseClick={clauseClickHandler} />
						</div>
					</>
				) : (
					<>
						<Spinner />
					</>
				)}

				{/* 3. FOOTER 하단 패널 전체 */}
				<DraftFooter />
			</div>
		</>
	);
}

export async function getStaticPaths() {
	const response = await fetch('https://conan.ai/_functions/getAllTemplateInfo');
	const res = await response.json();
	const data = res.items;

	const paths = data.map(item => ({
		params: { type: item.type.toString() },
	}));
	return { paths, fallback: false };
}

export async function getStaticProps({ params }) {
	// const { type } = query
	const response = await fetch(`https://conan.ai/_functions/getTemplateInfo/${params.type}`);
	const res = await response.json();
	const data = res.items;

	return { props: { contract: data } };
}
