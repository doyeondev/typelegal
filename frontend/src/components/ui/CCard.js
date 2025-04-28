import React from 'react';

export default function CCard({ dataList, index, onClauseClick, newClause }) {
	if (dataList.is_default === true) {
		return (
			<>
				{/* 1. 제목 */}
				{/* <div className={`px-2 ${dataList.binding_question === newClause && 'animate-bounce-short'}`} id={dataList.binding_question}> */}
				<div className="px-2" id={dataList.binding_question}>
					<div className="flex text-justify w-full mb-2 gap-4 items-center">
						{/* {title.length > 0 && <p>{index}. </p>} */}
						<p className="text-gray-900 text-base font-medium">
							<b>{dataList.cno ? `제${dataList.cno}조 ${dataList.clause_title_en}` : ''}</b>
						</p>
					</div>
					{/* 2. 본문 */}
					<div className="text-justify">
						<div style={{ color: 'black' }} className="mb-8 space-y-0.5" dangerouslySetInnerHTML={{ __html: dataList.content_en }} onClick={onClauseClick}></div>
					</div>
				</div>
			</>
		);
	}
}
