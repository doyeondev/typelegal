import React from 'react';
import Image from 'next/image';

/**
 * 계약서 저장 버튼 컴포넌트
 * @param {Object} props - 컴포넌트 속성
 * @param {Array} props.questionData - 질문 데이터 배열
 * @param {Array} props.clauseData - 계약 조항 데이터 배열
 * @param {Array} props.inputData - 입력 데이터 배열
 * @param {string} props.contractId - 계약서 ID
 * @param {Function} props.setSaveBtnState - 저장 버튼 상태 설정 함수
 */
const SaveButton = ({ questionData, clauseData, inputData, contractId, setSaveBtnState }) => {
	return (
		<button
			onClick={() => setSaveBtnState(true)}
			className="items-center cursor-pointer flex px-2 py-1 text-sm text-gray-700 capitalize transition-colors duration-200 bg-white rounded-md gap-x-2 hover:bg-gray-100 dark:bg-gray-900 dark:text-gray-200 dark:border-gray-700 dark:hover:bg-gray-800"
		>
			<Image alt="문서저장" src="/icon/save.svg" width={0} height={0} sizes="100vw" className="w-6 h-6" />
			저장하기
		</button>
	);
};

export default SaveButton;
