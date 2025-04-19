import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import SaveButton from './SaveButton';

/**
 * 계약서 작성 페이지 헤더 컴포넌트
 * @param {Object} props - 컴포넌트 속성
 * @param {Object} props.currentMember - 현재 로그인 사용자 정보
 * @param {boolean} props.formSubmitted - 설문 제출 여부
 * @param {Function} props.setIsOpen - 설문 모달 열기/닫기 함수
 * @param {boolean} props.isOpen - 설문 모달 열림 여부
 * @param {Function} props.setFormSubmitted - 설문 제출 여부 설정 함수
 * @param {Function} props.setExportBtnState - 내보내기 버튼 상태 설정 함수
 * @param {Object} props.contract - 계약서 정보
 * @param {string} props.contractId - 계약서 ID
 * @param {Array} props.questionData - 질문 데이터 배열
 * @param {Array} props.clauseData - 계약 조항 데이터 배열
 * @param {Array} props.inputData - 입력 데이터 배열
 * @param {Function} props.setSaveBtnState - 저장 버튼 상태 설정 함수
 */
const DraftHeader = ({ currentMember, formSubmitted, setIsOpen, isOpen, setFormSubmitted, setExportBtnState, contract, contractId, questionData, clauseData, inputData, setSaveBtnState }) => {
	return (
		<div className="h-[60px] w-full flex p-5 items-center border-b-2 justify-between">
			{/* 홈 링크 */}
			<Link href="/" className="flex items-center">
				<Image alt="타입리걸" src="/icon/typelegal.png" width={0} height={0} sizes="100vw" className="w-[150px] h-auto" />
			</Link>

			{/* 메뉴 바 */}
			<div className="flex w-fit">
				<div className="flex items-center mr-4 space-x-1">
					<button
						onClick={() => {
							if (sessionStorage.getItem('item_key')) {
								sessionStorage.removeItem('item_key');
							}
							window.location.reload();
						}}
						className="items-center cursor-pointer flex px-2 py-1 text-sm text-gray-700 capitalize transition-colors duration-200 bg-white rounded-md gap-x-2 hover:bg-gray-100 dark:bg-gray-900 dark:text-gray-200 dark:border-gray-700 dark:hover:bg-gray-800"
					>
						<Image alt="내용 초기화" src="/icon/refresh.svg" width={0} height={0} sizes="100vw" className="w-4 h-4" />
						내용 초기화
					</button>

					<button
						id="btnPrevious"
						name="paginationBtn"
						onClick={currentMember.submittedSurvey === false && formSubmitted === false ? () => setIsOpen(true) : () => setExportBtnState(true)}
						className="items-center cursor-pointer flex px-2 py-1 text-sm text-gray-700 capitalize transition-colors duration-200 bg-white rounded-md gap-x-2 hover:bg-gray-100 dark:bg-gray-900 dark:text-gray-200 dark:border-gray-700 dark:hover:bg-gray-800"
					>
						<Image alt="다운로드" src="/icon/download.svg" width={0} height={0} sizes="100vw" className="w-6 h-6" />
						문서 다운로드
					</button>
					<SaveButton questionData={questionData} clauseData={clauseData} inputData={inputData} contractId={contractId} setSaveBtnState={setSaveBtnState} />
				</div>

				{currentMember && (
					<nav className="flex items-center">
						<Link href="/dashboard" className="hover:text-gray-900">
							<div className="btn-blue w-24 py-1 rounded-md text-sm shadow drop-shadow-lg">마이페이지</div>
						</Link>
					</nav>
				)}
			</div>
		</div>
	);
};

export default DraftHeader;
