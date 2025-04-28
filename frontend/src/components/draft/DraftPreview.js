import React from 'react';
import { v4 as uuidv4 } from 'uuid';
import CCard from '/components/ui/CCard';

/**
 * 계약서 작성 페이지 오른쪽 영역 컴포넌트 (계약서 미리보기)
 * @param {Object} props - 컴포넌트 속성
 * @param {Array} props.clauseData - 계약서 조항 데이터 배열
 * @param {string} props.newClause - 새로 추가된 조항 ID
 * @param {Object} props.contract - 계약서 정보
 * @param {Function} props.onClauseClick - 조항 클릭 핸들러
 */
const DraftPreview = ({ clauseData, newClause, contract, onClauseClick }) => {
	return (
		<div id="right" className="grid col-span-1 w-full px-6 shadow-2xl">
			{/* 계약서 미리보기 영역 */}
			<div id="right2" className="h-[calc(100vh-120px)] select-none overflow-y-scroll bg-white px-6 w-full scrollbar-hide">
				{/* 계약 제목 */}
				<div className="text-center px-8 pt-10 pb-4 w-full">
					<p className="text-gray-900 text-xl mb-5 font-bold title-font">{contract.category} 계약서</p>
				</div>

				{/* 계약 조항 (제목 + 본문) */}
				{clauseData.map((elem, index) => {
					return <CCard dataList={elem} index={index} onClauseClick={onClauseClick} key={uuidv4()} newClause={newClause} />;
				})}
			</div>
		</div>
	);
};

export default DraftPreview;
