/**
 * 드래프트 페이지 이벤트 핸들러 커스텀 훅
 * 계약서 드래프트 페이지의 각종 이벤트 처리 함수를 제공합니다.
 */

import { useState, useCallback } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { findItem, findItemIndex, uniqueArray, flatten, getKeyAndValue, getArrayOfKeys, replaceArray, orderBy, groupBy } from '../utils/arrayUtils.js';
import { returnCurrencyValue, returnInputValue } from '../utils/inputUtils.js';
import { removeHighlight, replaceMulCharInString } from '../utils/textUtils.js';
import { handleScroll, handleScroll2 } from '../utils/uxUtils.js';
import { setProp } from '../utils/objectUtils.js';

/**
 * 드래프트 페이지 이벤트 핸들러 훅
 * @param {Object} params - 훅 파라미터
 * @param {Array} params.questionData - 질문 데이터 배열
 * @param {Array} params.clauseData - 조항 데이터 배열
 * @param {Array} params.inputData - 입력 데이터 배열
 * @param {Object} params.clause_template - 조항 템플릿
 * @param {Function} params.setQuestionData - 질문 데이터 상태 설정 함수
 * @param {Function} params.setClauseData - 조항 데이터 상태 설정 함수
 * @param {Function} params.setInputData - 입력 데이터 상태 설정 함수
 * @param {Function} params.setQuestionGroupData - 질문 그룹 데이터 상태 설정 함수
 * @param {Function} params.setAnsweredQuestionData - 답변된 질문 데이터 상태 설정 함수
 * @param {Function} params.setQuestionGroupKey - 질문 그룹 키 상태 설정 함수
 * @param {Function} params.setActiveClauseKeys - 활성화된 조항 키 상태 설정 함수
 * @param {Function} params.setNewClause - 새 조항 상태 설정 함수
 * @param {Function} params.setLastInput - 마지막 입력 상태 설정 함수
 * @param {Function} params.setItemIndex - 현재 항목 인덱스 상태 설정 함수
 * @param {Function} params.setLastItemIndex - 마지막 항목 인덱스 상태 설정 함수
 * @param {Function} params.setProgress - 진행 상태 설정 함수
 * @param {Function} params.setQuestionPanel - 질문 패널 표시 여부 상태 설정 함수
 * @param {Function} params.setNeedSave - 저장 필요 여부 상태 설정 함수
 * @param {Function} params.updateActivityLog - 활동 로그 업데이트 함수
 * @param {Object} params.activityLog - 활동 로그 객체
 * @param {Array} params.questionGroupKey - 질문 그룹 키 배열
 * @param {number} params.itemIndex - 현재 항목 인덱스
 * @param {Object} params.lastInput - 마지막 입력 객체
 * @returns {Object} 이벤트 핸들러 함수들
 */
export const useDraftHandler = ({
	questionData,
	clauseData,
	inputData,
	clause_template,
	setQuestionData,
	setClauseData,
	setInputData,
	setQuestionGroupData,
	setAnsweredQuestionData,
	setQuestionGroupKey,
	setActiveClauseKeys,
	setNewClause,
	setLastInput,
	setItemIndex,
	setLastItemIndex,
	setProgress,
	setQuestionPanel,
	setNeedSave,
	updateActivityLog,
	activityLog,
	questionGroupKey,
	itemIndex,
	lastInput,
}) => {
	// 내부 상태 변수들
	let tracerKey, tracer, cidx;

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
				// 존재 여부 확인
				if (!newState[i] || !newState[i].content_en) {
					console.error(`[handleHighlight] newState[${i}] 또는 content_en이 존재하지 않습니다.`);
					return;
				}

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
				// 존재 여부 확인
				if (!clauseData[i] || !clauseData[i].binding_input) {
					console.error(`[handleHighlight] clauseData[${i}] 또는 binding_input이 존재하지 않습니다.`);
					return;
				}

				tracer = getKeyAndValue(clauseData[i].binding_input); // [key: [...], value: [...]]
				// clause_template이 undefined 체크 추가
				if (clause_template && clause_template[i]) {
					newState[i].content_en = replaceMulCharInString(clause_template[i].content_en, tracer, tracerKey); // replaceMulCharInString = clause_template 에서
				} else {
					console.error(`clause_template[${i}] is undefined`);
				}
				newState[i] = setProp('id', uuidv4(), newState[i]);
				// setClauseData(newState)
			});
		} else {
			console.log('else if 2 [HANDLE HIGHLIGHT]');
			console.log('[[LAST INPUT]]', lastInput);
			cidx.forEach(i => {
				// 존재 여부 확인
				if (!clauseData[i] || !clauseData[i].binding_input) {
					console.error(`[handleHighlight] clauseData[${i}] 또는 binding_input이 존재하지 않습니다.`);
					return;
				}

				tracer = getKeyAndValue(clauseData[i].binding_input); // [key: [...], value: [...]]

				// 핵심 로직 1 : clause_template의 content_en은 항상 빈칸("DEFAULT")임. clause_template 배열은 변형하지 X, 원본 데이터로 참고함.
				// 핵심 로직 2 : tracer의 key: [...] value: [...] 가 비어있으면 "DEFAULT" 수정 없이 반환.
				// 핵심 로직 3 : tracer에 저장된 값이 있으면 DEFAULT의 {key}값을 value로 수정한 조항 string을 반환함.

				// clause_template이 undefined 체크 추가
				if (clause_template && clause_template[i]) {
					newState[i].content_en = replaceMulCharInString(clause_template[i].content_en, tracer, tracerKey);
				} else {
					console.error(`clause_template[${i}] is undefined`);
				}

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
	 * 일반질문 답변 -> 조항 데이터 처리
	 */
	const handleClauseData = (idx, key, newValue) => {
		// REFACTORING: 불필요한 console.log 제거
		if (!idx) return; // idx 없을 시 에러 안뜨게 return. 새로고침 에러떠서 추가함

		// REFACTORING: 중복 로직 개선 - forEach 안에서 newState를 매번 생성하지 않고 한 번만 생성
		const newState = [...clauseData];

		idx.forEach(i => {
			// clauseData[i]가 존재하는지 확인
			if (!clauseData[i] || !clauseData[i].binding_input) {
				console.error(`[handleClauseData] clauseData[${i}] 또는 binding_input이 존재하지 않습니다.`);
				return;
			}

			// binding_input이 배열인지 확인
			const targetArr = Array.isArray(clauseData[i].binding_input) ? [...clauseData[i].binding_input] : [];

			const newArr = replaceArray(targetArr, key, newValue);
			newState[i].binding_input = newArr;
		});

		handleHighlight(newState, idx, key);
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
			// 저장 필요함을 표시
			if (setNeedSave) setNeedSave(true);

			handleQuestionData(e.target.id, binding_value, item, index);
			handleClauseData(item.binding_cidx, item.binding_key, binding_value);
			handleInputData(item.binding_key, binding_value);
			updateLastInput(item.binding_key, item.binding_cidx);
		}

		// 질문 응답 후 진행률 업데이트
		setTimeout(setQuestionProgress, 100);
	};

	/**
	 * 질문 진행 상태 업데이트
	 */
	const setQuestionProgress = () => {
		let allQuestions = questionData.filter(x => x.is_default === true);
		let answeredQuestions = questionData.filter(x => x.is_default === true && x.value && x.value.length > 0);
		let progressPercentage = Math.round((answeredQuestions.length / allQuestions.length) * 100);
		let currentProgress = `${answeredQuestions.length}/${allQuestions.length} (${progressPercentage}%)`;

		// 활동 로그 기록 유지
		if (updateActivityLog) {
			updateActivityLog({
				endTime: timestamp(),
				docProgress: currentProgress,
				duration: timeDiffSec(activityLog.startTime, timestamp()),
				durationMin: timeDiffMin(activityLog.startTime, timestamp()),
			});
		}
	};

	/**
	 * ("이전질문", "다음질문" 버튼 눌렀을 때 작동) 버튼 event handler
	 */
	const onQBtnClickHandler = e => {
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
	};

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

	/**
	 * 체크박스 '기타' 옵션 선택 시 조항 output 처리
	 */
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

	/**
	 * 기타 ("조항 빈칸" 누르면 해당되는 질문으로 이동) Lookup
	 */
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

	/**
	 * SidePanel의 '수정하기' 클릭시 event handler
	 */
	const onEditClickHandler = e => {
		// setLastItemIndex(itemIndex)
		console.log('clicked');
		let currentIndex = parseInt(e.target.id);
		setItemIndex(currentIndex);
		let progressNum = currentIndex / (questionGroupKey.length - 1);
		console.log('itemIndex after edit click', itemIndex);
		setProgress(Math.round(progressNum * 100));
	};

	/**
	 * 질문의 '해설보기' 클릭시 event handler
	 */
	const toggleQuestionTip = e => {
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
	};

	// 모든 핸들러 함수 반환
	return {
		onChangeHandler,
		onQBtnClickHandler,
		etcClick,
		etcChange,
		clauseClickHandler,
		onEditClickHandler,
		toggleQuestionTip,
		// 내부 로직용 핸들러도 필요시 노출
		handleQuestionData,
		handleClauseData,
		handleInputData,
		syncOutputSection,
		syncInputSection,
		updateLastInput,
		handleHighlight,
		handleCheckboxState,
	};
};

// 가비지 컬렉션을 방지하기 위해 한 번 더 Export
export default useDraftHandler;
