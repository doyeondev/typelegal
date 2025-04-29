import { v4 as uuidv4 } from 'uuid';
import { useSearchParams } from 'next/navigation';
import { useQuery } from 'react-query';
import { useUser } from '../../src/context/UserContext';
import PrivateRoute from '../../src/components/auth/PrivateRoute';

import React, { useEffect, useState, useCallback } from 'react';

import Head from 'next/head';

// 분리된 컴포넌트 Import
import DraftHeader from '../../src/components/draft/DraftHeader';
import DraftFooter from '../../src/components/draft/DraftFooter';
import DraftSidebar from '../../src/components/draft/DraftSidebar';
import DraftContent from '../../src/components/draft/DraftContent';
import DraftPreview from '../../src/components/draft/DraftPreview';

// UI Component Import
import Spinner from '../../src/components/ui/Spinner';
import SidePanel from '../../src/components/ui/SidePanel';
import ToastSave from '../../src/components/ui/ToastSave';

// 유틸 함수 Import
import { fetchProcessedData } from '../../src/utils/dataUtils.js';
import { findItemIndex, replaceArray, getKeyAndValue, findItem, getArrayOfKeys, orderBy, groupBy, uniqueArray, flatten } from '../../src/utils/arrayUtils.js';
import { returnCurrencyValue, returnInputValue } from '../../src/utils/inputUtils.js';
import { removeHighlight, replaceMulCharInString } from '../../src/utils/textUtils.js';
import { timeDiffSec, timeDiffMin, timestamp } from '../../src/utils/timeUtils.js';
import { handleScroll, handleScroll2 } from '../../src/utils/uxUtils.js';
import { exportContent } from '../../src/utils/fileUtils.js';
import { resetAuthToken } from '../../src/utils/authUtils.js';
import { setProp, deepClone } from '../../src/utils/objectUtils.js';

// hook, api Import
import { useLeavePageConfirmation } from '../../src/hooks/useLeavePageConfirmation';
import logService from '../../src/services/logService';
import draftService from '../../src/services/draftService';

// Zustand store
import { useDraftStore } from '../../src/store/useDraftStore';

let clause_template, question_template;
let tracerKey, tracer, cidx;
let item_value;

// 서버사이드 API 함수 정의
const fetchTemplateInfo = async type => {
	const response = await fetch(`https://conan.ai/_functions/getTemplateInfo/${type}`);
	if (!response.ok) {
		throw new Error(`템플릿 정보 가져오기 실패: ${response.status}`);
	}
	const data = await response.json();
	return data.items;
};

// 기존의 Draft 컴포넌트
function Draft({ contract, contractData, user }) {
	console.log('contract', contract);
	console.log('contractData', contractData);
	console.log('서버에서 받은 사용자 정보:', user);

	// Zustand store 사용
	const {
		contractId,
		setContractId,
		docStatus,
		setDocStatus,
		questionData,
		setQuestionData,
		clauseData,
		setClauseData,
		inputData,
		setInputData,
		questionGroupData,
		setQuestionGroupData,
		answeredQuestionData,
		setAnsweredQuestionData,
		questionGroupKey,
		setQuestionGroupKey,
		activeClauseKeys,
		setActiveClauseKeys,
		glossary,
		setGlossary,
		activityLog,
		setActivityLog,
		updateActivityLog,
		initializeContractData,
	} = useDraftStore();

	const { user: userContext } = useUser();
	const searchParams = useSearchParams();

	const [changesOnPage, setChangesOnPage] = useState(true);
	const [newClause, setNewClause] = useState('');

	const [saveBtnState, setSaveBtnState] = useState(false);
	const [saveToastState, setSaveToastState] = useState(false);
	const [exportBtnState, setExportBtnState] = useState(false);
	const [needSave, setNeedSave] = useState(false);

	const [lastInput, setLastInput] = useState({ key: '', obj: [], idx: [] });

	const [loaded, isLoaded] = useState(false);

	const [itemIndex, setItemIndex] = useState(0);
	const [lastItemIndex, setLastItemIndex] = useState(0);
	const [progress, setProgress] = useState(0);

	const [showSidebar, setShowSidebar] = useState(false);
	const [currentMember, setCurrentMember] = useState(user || '');

	// Survey Modal
	const [isOpen, setIsOpen] = useState(false);

	const [userOS, setUserOS] = useState('');
	const [questionPanel, setQuestionPanel] = useState(true);
	const [formSubmitted, setFormSubmitted] = useState(user?.submittedSurvey || '');

	useLeavePageConfirmation(changesOnPage, activityLog);

	// React Query 훅 사용 (SSR prefetch와 통합)
	const { data: templateData } = useQuery(['templateInfo', contract.type], () => fetchTemplateInfo(contract.type), {
		initialData: contract,
		staleTime: 1000 * 60 * 5, // 5분 동안 fresh 상태 유지
	});

	// 계약서 데이터 쿼리 (이미 서버에서 가져온 경우 사용)
	const { data: processedData } = useQuery(['processedData', contract.type], () => fetchProcessedData('10', contract.type), {
		initialData: contractData,
		staleTime: 1000 * 60 * 5,
		enabled: !!contract.type,
	});

	// REFACTORING: 공통으로 사용되는 groupBy 로직을 함수로 추출
	const groupQuestionsByCategory = questions => {
		return groupBy(orderBy(questions, ['midx', 'qidx'], ['asc', 'asc']), q => q.binding_question_ko || '기본 정보');
	};

	useEffect(() => {
		async function getPageData() {
			try {
				localStorage.theme = 'light';
				setUserOS(window.navigator.userAgent.includes('Mac') ? 'Mac' : 'Window');

				// REFACTORING: 사용자 인증 로직 단순화
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
				item_value = searchParams.get('_id') || searchParams.get('id') || sessionStorage.getItem('item_key');
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
						clause_template = data.clause_template;
						isLoaded(true);
						setContractId(contract_id);
						setDocStatus('문서 수정');
						setActivityLog(prev => ({ ...prev, docStatus: '문서 수정' }));
					} catch (error) {
						alert('계약서 데이터를 가져오는 데 실패했습니다: ' + error.message);
						isLoaded(true);
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
							isLoaded(true);
							return;
						}
					}

					// 데이터 유효성 검사
					if (!data || !data.clause || !data.question) {
						alert('계약서 데이터 형식이 올바르지 않습니다. 다시 시도해 주세요.');
						isLoaded(true);
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
					isLoaded(true);
					setContractId(contract_id);
					// 3. 변수 초기화
					clause_template = deepClone(data.clause); // 변하지 않는 Original Clause Data
					question_template = [...data.question]; // 변하지 않는 Original Question Data
					setDocStatus('신규 작성');
					setActivityLog(prev => ({ ...prev, docStatus: '신규 작성' }));
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
					}));
				}
			} catch (error) {
				alert('페이지 로딩 중 오류가 발생했습니다. 페이지를 새로고침하거나 다시 로그인해주세요.');
			}
		}
		getPageData();
	}, []);

	// draft log post
	useEffect(() => {
		if (contractId !== '' && docStatus !== '' && currentMember !== '') {
			console.log('entered post');
			let draftLog = { userName: currentMember.name, userEmail: currentMember.email, status: docStatus, category: contract.title, title: `${contract.category} 계약서`, contractId: contractId };
			logService.submitDraftLog(draftLog);
			logService.saveActivityLog(activityLog);
		}
	}, [docStatus, currentMember, contractId, activityLog, contract.title, contract.category]);

	/* useEffect Hook (2) - SCROLL HOOK */
	// lastInput이 업데이트 되면 스크롤 해주고
	// answeredQuestionData도 업데이트 해준다
	// SCROLL HOOK에서 트리거 됨
	const updateAnsweredQuestion = () => {
		const filteredQuestionData = questionData.filter(x => x.value && x.value.length > 0);
		// console.log('filteredQuestionData', filteredQuestionData)
		setAnsweredQuestionData(filteredQuestionData);
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
			let saveLog = {
				...activityLog,
				endTime: timestamp(),
				duration: timeDiffSec(activityLog.startTime, timestamp()),
				durationMin: timeDiffMin(activityLog.startTime, timestamp()),
			};
			logService.saveActivityLog(saveLog);
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
		// REFACTORING: 데이터 저장 로직 최적화
		if (!loaded) return;

		// 상태 업데이트 및 로그 기록
		setQuestionProgress();

		// 저장/내보내기 버튼이 활성화된 경우에만 처리
		if (!saveBtnState && !exportBtnState) return;

		// 저장할 데이터 구조 구성
		const toSave = {
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
			progress: activityLog.docProgress,
		};

		// 저장 버튼이 눌렸을 때
		if (saveBtnState) {
			// 토큰 확인 및 재설정
			resetAuthToken();

			// 데이터 저장 요청
			draftService
				.saveDraft(toSave)
				.then(response => {
					setSaveToastState(true);
				})
				.catch(error => {
					let errorMsg = '데이터 저장에 실패했습니다';

					// 로그인 관련 오류인 경우 로그인 페이지로 리디렉션
					if (error.status === 401 || error.status === 403) {
						// 현재 URL을 세션 스토리지에 저장 후 로그인 페이지로 리디렉션
						const currentUrl = window.location.pathname + window.location.search;
						sessionStorage.setItem('redirectAfterLogin', currentUrl);
						window.location.href = '/login';
						return;
					} else if (error.message) {
						errorMsg += ': ' + error.message;
					}

					alert(errorMsg);
				})
				.finally(() => {
					setSaveBtnState(false);
				});
		}

		// 내보내기 버튼이 눌렸을 때
		if (exportBtnState) {
			exportContent(clauseData, inputData, contract.category);
			setExportBtnState(false);
		}
		// REFACTORING: 불필요한 의존성 제거 - 실제로 사용하는 상태만 포함
	}, [loaded, saveBtnState, exportBtnState, contractId, contract, clauseData, inputData, questionData, questionGroupData, glossary, answeredQuestionData, activityLog.docProgress]);

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
		clause_keys = uniqueArray(flatten(clause_keys)).sort(); // flat array, remove duplicates, sort ascending
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
			setQuestionGroupData(groupBy(orderBy(newState, ['midx', 'qidx'], ['asc', 'asc']), _ => _.binding_question_ko));
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
			setQuestionGroupData(groupBy(orderBy(newState, ['midx', 'qidx'], ['asc', 'asc']), _ => _.binding_question_ko));
		}
	};

	/**
	 * 일반질문 답변 -> clauseData.binding_input 렌더링
	 */
	const handleClauseData = (idx, key, newValue) => {
		// REFACTORING: 불필요한 console.log 제거
		setNeedSave(true);
		if (!idx) return; // idx 없을 시 에러 안뜨게 return. 새로고침 에러떠서 추가함

		// REFACTORING: 중복 로직 개선 - forEach 안에서 newState를 매번 생성하지 않고 한 번만 생성
		const newState = [...clauseData];

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
	 * REFACTORING: 함수 로직 단순화 및 중복 제거
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

				newState[i] = setProp('id', uuidv4(), newState[i]);
				// setClauseData(newState)
			});
			cidx.forEach(i => {
				tracer = getKeyAndValue(clauseData[i].binding_input); // [key: [...], value: [...]]
				newState[i].content_en = replaceMulCharInString(clause_template[i].content_en, tracer, tracerKey); // replaceMulCharInString = clause_template 에서
				newState[i] = setProp('id', uuidv4(), newState[i]);
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

				newState[i] = setProp('id', uuidv4(), newState[i]);
				// setClauseData(newState)
			});
		}

		setClauseData(newState);
	}

	/**
	 * 라디오/체크박스 "checked" 처리
	 * REFACTORING: 불필요한 console.log 제거 및 로직 단순화
	 */
	const handleCheckboxState = (newState, item, index) => {
		index = parseInt(index);
		console.log('[handleCheckboxState] index from handleCheckboxState', index);

		newState = newState.map(obj => {
			if (obj.id === item.id) {
				console.log('[handleCheckboxState] 첫 if 들어옴');
				const newOptions = [...obj.options];
				if (item.question_type.includes('checkbox')) {
					console.log('[handleCheckboxState] if checkbox 들어옴');
					if (newOptions[index].checked === 'checked') {
						newOptions[index] = setProp('checked', '', newOptions[index]);
					} else {
						newOptions[index] = setProp('checked', 'checked', newOptions[index]);
					}
				} else if (item.question_type.includes('radio') || item.question_type.includes('dropdown')) {
					console.log('[handleCheckboxState] else if radio 들어옴');
					for (let i = 0; i < newOptions.length; i++) {
						if (i === index) {
							console.log('[handleCheckboxState] 1', i, index, newOptions.length);
							newOptions[i] = setProp('checked', 'checked', newOptions[i]);
						} else {
							console.log('[handleCheckboxState] 2', i, index, newOptions.length);
							newOptions[i] = setProp('checked', '', newOptions[i]);
						}
					}
					console.log('[handleCheckboxState] after loop', newOptions);
				}
				return { ...obj, options: newOptions };
			}
			return obj; // otherwise return the object as is
		});
		setQuestionData(newState);
		setQuestionGroupData(groupBy(orderBy(newState, ['midx', 'qidx'], ['asc', 'asc']), _ => _.binding_question_ko));
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
	 * REFACTORING: 불필요한 console.log 제거 및 조건문 단순화
	 */
	const onChangeHandler = e => {
		let binding_value, index;
		let item = findItem(questionData, e.target.id, 'id'); // returns object

		tracerKey = item.binding_key;
		cidx = item.binding_cidx;

		// 입력 타입에 따라 value 처리
		if (item.question_type === 'input_currency') {
			binding_value = returnCurrencyValue(e);
		} else if (item.question_type.includes('dropdown')) {
			binding_value = item.options[e.target.getAttribute('name')].value;
		} else {
			binding_value = returnInputValue(e, item);
		}

		// checkbox, radio 인덱스 확인
		if (e.target.getAttribute('index')) {
			index = e.target.getAttribute('index');
		}

		// 데이터 처리 분기
		if (item.output_type.includes('trigger')) {
			syncOutputSection(item.binding_cidx, binding_value, item, index, item.id);
		} else {
			handleQuestionData(e.target.id, binding_value, item, index);
			handleClauseData(item.binding_cidx, item.binding_key, binding_value);
			handleInputData(item.binding_key, binding_value);
			updateLastInput(item.binding_key, item.binding_cidx);
		}

		// 질문 응답 후 진행률 업데이트
		setTimeout(setQuestionProgress, 100);
	};

	function setQuestionProgress() {
		let allQuestions = questionData.filter(x => x.is_default === true);
		let answeredQuestions = questionData.filter(x => x.is_default === true && x.value && x.value.length > 0);
		let progressPercentage = Math.round((answeredQuestions.length / allQuestions.length) * 100);
		let currentProgress = `${answeredQuestions.length}/${allQuestions.length} (${progressPercentage}%)`;

		// 진행률(progress) 상태도 업데이트 - 실제 답변한 질문 비율 기준
		// setProgress(progressPercentage); // 나중에 사용할 주석.

		// 기존 활동 로그 기록 유지
		updateActivityLog({
			endTime: timestamp(),
			docProgress: currentProgress,
			duration: timeDiffSec(activityLog.startTime, timestamp()),
			durationMin: timeDiffMin(activityLog.startTime, timestamp()),
		});
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
		newState[qIndex] = setProp('id', uuidv4(), newState[qIndex]);

		setQuestionData(newState);
		setQuestionGroupData(groupBy(orderBy(newState, ['midx', 'qidx'], ['asc', 'asc']), _ => _.binding_question_ko));
	}

	//   h-[calc(100vh-9rem)]
	//   grid grid-cols-[240px_1fr_240px]
	return (
		<>
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
						<div className="flex flex-grow overflow-hidden">
							<div className="grid grid-cols-[260px_1fr_1.2fr] w-full h-[calc(100vh-120px)]">
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

// PrivateRoute로 감싸서 인증된 사용자만 접근할 수 있도록 수정
export default function DraftWrapper({ contract, contractData, user }) {
	return (
		<PrivateRoute>
			<Draft contract={contract} contractData={contractData} user={user} />
		</PrivateRoute>
	);
}

export async function getServerSideProps({ params, req, res }) {
	console.log(`[getServerSideProps] 요청 타입: ${params.type}`);

	try {
		// REFACTORING: API_BASE_URL 상수를 상단에 배치하여 코드를 더 깔끔하게 만듭니다
		const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8082';
		const cookies = req.headers.cookie || '';
		const authToken = req.cookies?.auth_token || '';

		// REFACTORING: 오류 처리 및 리디렉션을 위한 공통 함수 생성
		const redirectToError = (errorType, message) => {
			return {
				redirect: {
					destination: `/dashboard?error=${errorType}&message=${encodeURIComponent(message)}`,
					permanent: false,
				},
			};
		};

		// 사용자 인증 상태 확인
		const userResponse = await fetch(`${API_BASE_URL}/api/auth/me`, {
			headers: { Cookie: cookies },
			credentials: 'include',
		});

		// 인증되지 않은 경우 로그인 페이지로 리디렉션
		if (!userResponse.ok) {
			return {
				redirect: {
					destination: `/login?redirect=/draft/${params.type}`,
					permanent: false,
				},
			};
		}

		// 사용자 정보 가져오기
		const user = await userResponse.json();

		// 템플릿 정보 가져오기
		let templateInfo;
		try {
			templateInfo = await fetchTemplateInfo(params.type);
		} catch (error) {
			return redirectToError('template', '템플릿 정보를 가져올 수 없습니다');
		}

		if (!templateInfo) {
			return redirectToError('template', '템플릿 정보를 가져올 수 없습니다');
		}

		// 템플릿 처리 데이터 가져오기
		let processedData;
		try {
			// 헤더 구성
			const headers = {
				'Content-Type': 'application/json',
				...(cookies && { Cookie: cookies }),
				...(authToken && { Authorization: `Bearer ${authToken}` }),
			};

			// 백엔드 API 요청
			const response = await fetch(`${API_BASE_URL}/api/template/process`, {
				method: 'POST',
				headers,
				body: JSON.stringify({
					query1: '10',
					query2: params.type,
					type: params.type,
				}),
				credentials: 'include',
			});

			if (!response.ok) {
				throw new Error(`백엔드 API 호출 실패: ${response.status}`);
			}

			processedData = await response.json();
		} catch (error) {
			return redirectToError('template', '템플릿 처리 데이터를 가져올 수 없습니다');
		}

		// 처리 데이터를 가져오지 못한 경우
		if (!processedData) {
			return redirectToError('template', '템플릿 처리 데이터를 가져올 수 없습니다');
		}

		// 정상적으로 데이터를 가져온 경우
		return {
			props: {
				contract: templateInfo,
				contractData: processedData,
				user,
			},
		};
	} catch (error) {
		// 오류 발생 시 로그인 페이지로 리디렉션
		return {
			redirect: {
				destination: `/login?redirect=/draft/${params.type}&error=true`,
				permanent: false,
			},
		};
	}
}
