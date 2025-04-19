import React from 'react';
import QuestionItem from '../../components/questions/QuestionItems';
import QuestionInput from '../../components/questions/QuestionInput';
import QCardBtn from '../../components/questions/QCardBtn';
import { v4 as uuidv4 } from 'uuid';

/**
 * 계약서 작성 페이지 중앙 영역 컴포넌트 (질문 섹션)
 * @param {Object} props - 컴포넌트 속성
 * @param {boolean} props.questionPanel - 질문 패널 표시 여부
 * @param {Object} props.questionGroupData - 질문 그룹 데이터
 * @param {Array} props.questionGroupKey - 질문 그룹 키 배열
 * @param {number} props.itemIndex - 현재 선택된 질문 그룹 인덱스
 * @param {Function} props.etcClick - 기타 항목 클릭 핸들러
 * @param {Function} props.etcChange - 기타 항목 변경 핸들러
 * @param {Function} props.onChangeHandler - 입력 변경 핸들러
 * @param {Function} props.toggleQuestionTip - 질문 도움말 토글 핸들러
 * @param {Function} props.onQBtnClickHandler - 질문 이동 버튼 핸들러
 * @param {Function} props.setQuestionPanel - 질문 패널 표시 여부 설정 함수
 * @param {Array} props.questionData - 질문 데이터 배열
 */
const DraftContent = ({ questionPanel, questionGroupData, questionGroupKey, itemIndex, etcClick, etcChange, onChangeHandler, toggleQuestionTip, onQBtnClickHandler, setQuestionPanel, questionData }) => {
	return (
		<div id="left" className={`flex flex-col bg-white overflow-y-scroll pt-10 px-8 relative z-10 border-r-2 scrollbar-hide ${questionPanel === true ? 'pt-10 pb-4' : 'pt-8 pb-8'}`}>
			{questionPanel === true ? (
				<>
					{Object.keys(questionGroupData).map(key => {
						if (key === questionGroupKey[itemIndex]) {
							// 질문 컨테이너
							return (
								<div className="flex flex-col overflow-y-scroll h-full pb-8 scrollbar-hide" key={key}>
									<div className="flex place-items-center px-5 w-full">
										<p className="text-black text-2xl font-bold">{key}</p>
									</div>
									<div className="mb-2 pt-8 pb-5 px-5 space-y-10">
										<QuestionItem questionGroupData={questionGroupData[key]} etcClick={etcClick} etcChange={etcChange} onChange={onChangeHandler} toggleQuestionTip={toggleQuestionTip} />
									</div>
								</div>
							);
						}
						return null;
					})}
					<QCardBtn onQBtnClickHandler={onQBtnClickHandler} />
				</>
			) : (
				<>
					<button
						onClick={() => setQuestionPanel(true)}
						className="w-[140px] place-content-center cursor-pointer flex items-center py-2 ml-4 text-xs text-gray-700 capitalize transition-colors duration-200 bg-white border rounded-md gap-x-2 hover:bg-gray-100 dark:bg-gray-900 dark:text-gray-200 dark:border-gray-700 dark:hover:bg-gray-800"
					>
						<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor" className="pointer-events-none w-4 h-4 rtl:-scale-x-100">
							<path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
						</svg>
						질문으로 돌아가기
					</button>
					<div className="flex flex-col overflow-y-scroll h-full mt-4 scrollbar-hide">
						<div className="mb-2 mt-4 px-4 space-y-6">
							<p className="text-base font-semibold">항목 기입을 완료하면 계약서 작성 끝! ✨</p>
							<QuestionInput questionGroupData={questionData} etcClick={etcClick} etcChange={etcChange} onChange={onChangeHandler} toggleQuestionTip={toggleQuestionTip} />
						</div>
					</div>
				</>
			)}
		</div>
	);
};

export default DraftContent;
