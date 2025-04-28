import React from 'react';
import ProgressBar from '/components/ui/ProgressBar';
import ProgressList from '/components/ui/ProgressList';

/**
 * 계약서 작성 페이지 사이드바 컴포넌트
 * @param {Object} props - 컴포넌트 속성
 * @param {Array} props.activeClauseKeys - 활성화된 계약 조항 키 배열
 * @param {Array} props.questionData - 질문 데이터 배열
 * @param {Array} props.questionGroupKey - 질문 그룹 키 배열
 * @param {number} props.progress - 현재 진행 상태 퍼센트
 * @param {boolean} props.showSidebar - 사이드바 표시 여부
 * @param {Function} props.setShowSidebar - 사이드바 표시 여부 설정 함수
 */
const DraftSidebar = ({ activeClauseKeys, questionData, questionGroupKey, progress, showSidebar, setShowSidebar }) => {
	return (
		<div className="px-5 pt-10 pb-4 flex flex-col justify-between border-r-2">
			{/* 측면 상판 */}
			<div className="space-y-4">
				<div className="flex justify-between items-center">
					<p className="text-base font-bold">답변을 완료했어요!</p>
					<button onClick={() => setShowSidebar(!showSidebar)} className="text-xs font-semibold cursor-pointer px-2 py-1 border border-gray-400 round rounded-md">
						수정하기
					</button>
				</div>
				<div className="w-8 h-1 bg-gray-300"></div>
				<ProgressBar currProgress={progress} />
				<ProgressList activeClauseKeys={activeClauseKeys} questionData={questionData} questionGroupKey={questionGroupKey} />
			</div>

			{/* 측면 하판 */}
			<div className="grid space-y-5">
				<div className="font-bold">문제가 발생했나요?</div>
				<div className="w-8 h-1 bg-gray-300"></div>
				<div className="text-sm font-medium text-gray-500 space-y-0.5">
					<div>문의가능: M-F, 09:00-19:00</div>
					<div>이메일: team@typelegal.io</div>
				</div>
			</div>
		</div>
	);
};

export default DraftSidebar;
