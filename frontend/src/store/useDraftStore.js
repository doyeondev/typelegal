/**
 * Draft 페이지 상태 관리를 위한 Zustand 스토어
 * 계약서 작성 관련 데이터만 관리하고 UI 상태는 컴포넌트에서 useState로 계속 관리
 */
import { create } from 'zustand';

/**
 * @typedef {Object} DraftState
 * @property {string} contractId - 계약서 ID
 * @property {string} docStatus - 문서 상태 (신규 작성/문서 수정)
 * @property {Array} questionData - 질문 데이터 배열
 * @property {Array} clauseData - 조항 데이터 배열
 * @property {Array} inputData - 입력 데이터 배열
 * @property {Array} questionGroupData - 질문 그룹 데이터 배열
 * @property {Array} answeredQuestionData - 답변된 질문 데이터 배열
 * @property {Array} questionGroupKey - 질문 그룹 키 배열
 * @property {Array} activeClauseKeys - 활성화된 조항 키 배열
 * @property {Array} glossary - 용어집 데이터 배열
 * @property {Object} activityLog - 활동 로그 객체
 */

const useDraftStore = create(set => ({
	// 초기 상태 값
	contractId: '',
	docStatus: '',
	questionData: [],
	clauseData: [],
	inputData: [],
	questionGroupData: {},
	answeredQuestionData: [],
	questionGroupKey: [],
	activeClauseKeys: [],
	glossary: [],
	activityLog: {
		id: '',
		title: '',
		_userName: '',
		userEmail: '',
		startTime: '',
		endTime: '',
		docProgress: '',
		docStatus: '',
		docId: '',
		duration: 0,
		durationMin: 0,
	},

	// 기본 setter 함수들
	setContractId: contractId => set({ contractId }),
	setDocStatus: docStatus => set({ docStatus }),
	setQuestionData: questionData => set({ questionData }),
	setClauseData: clauseData => set({ clauseData }),
	setInputData: inputData => set({ inputData }),
	setQuestionGroupData: questionGroupData => set({ questionGroupData }),
	setAnsweredQuestionData: answeredQuestionData => set({ answeredQuestionData }),
	setQuestionGroupKey: questionGroupKey => set({ questionGroupKey }),
	setActiveClauseKeys: activeClauseKeys => set({ activeClauseKeys }),
	setGlossary: glossary => set({ glossary }),

	// 활동 로그 업데이트 함수
	setActivityLog: activityLog => set({ activityLog }),

	// 활동 로그 부분 업데이트 함수
	updateActivityLog: partialLog =>
		set(state => ({
			activityLog: { ...state.activityLog, ...partialLog },
		})),

	// 다중 상태 업데이트 함수
	updateDraftState: updates => set(state => ({ ...state, ...updates })),

	// 계약서 데이터 초기화 함수
	initializeContractData: data => {
		if (!data) return;

		set({
			clauseData: data.clause_array || data.clause || [],
			questionData: data.question_array || data.question || [],
			inputData: data.input_array || [],
			glossary: data.clauseGuide_array || data.clauseGuide || [],
			answeredQuestionData: data.answeredQuestion_array || [],
		});
	},
}));

export { useDraftStore };
