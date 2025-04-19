import React, { useEffect, useState } from 'react';
import { v4 as uuidv4 } from 'uuid';
import _ from 'lodash';
import Image from 'next/image';

export default function SidePanel({ submittedData, onEditClickHandler, showSidebar, setShowSidebar }) {
	console.log('submittedData', submittedData);

	let questionData, questionGroupData;
	if (Array.isArray(submittedData)) {
		questionData = submittedData.filter(x => !x.output_type.includes('trigger'));
		questionGroupData = _.groupBy(_.orderBy(questionData, ['midx', 'qidx'], ['asc', 'asc']), _ => _.question_category);
	}

	return (
		<>
			<Sidebar questionGroupData={questionGroupData} onEditClickHandler={onEditClickHandler} showSidebar={showSidebar} setShowSidebar={setShowSidebar} questionData={questionData} />
		</>
	);
}
const Sidebar = ({ questionGroupData, onEditClickHandler, showSidebar, setShowSidebar, questionData }) => {
	//   const [showSidebar, setShowSidebar] = useState(false)
	// console.log('questionData', questionData)
	return (
		<>
			{!showSidebar && (
				<div onClick={() => setShowSidebar(!showSidebar)} className="w-5 h-16 fixed right-0 top-1/3 z-30 flex items-center cursor-pointer bg-gray-100/50 border border-gray-400 rounded-l-sm delay-200">
					<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-5 h-5">
						<path fillRule="evenodd" d="M12.79 5.23a.75.75 0 01-.02 1.06L8.832 10l3.938 3.71a.75.75 0 11-1.04 1.08l-4.5-4.25a.75.75 0 010-1.08l4.5-4.25a.75.75 0 011.06.02z" clipRule="evenodd" />
					</svg>
				</div>
			)}

			<div className={`top-0 right-0 w-[calc((100vw-240px)*(0.5))] grid grid-cols-[20px_1fr] -pl-20 text-white fixed h-full z-40 ease-in-out duration-200 ${showSidebar ? 'translate-x-0 ' : 'translate-x-full'}`}>
				<div className="disabled bg-transparent h-screen">
					<div onClick={() => setShowSidebar(!showSidebar)} className="w-5 h-16 fixed top-1/3 z-30 flex items-center cursor-pointer bg-gray-100 rounded-l-sm">
						<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="#000000" className="w-5 h-5">
							<path fillRule="evenodd" d="M7.21 14.77a.75.75 0 01.02-1.06L11.168 10 7.23 6.29a.75.75 0 111.04-1.08l4.5 4.25a.75.75 0 010 1.08l-4.5 4.25a.75.75 0 01-1.06-.02z" clipRule="evenodd" />
						</svg>
					</div>
				</div>

				{/* panel start */}
				<div className="px-8 py-4 flex flex-col overflow-scroll bg-gray-100">
					<Heading showSidebar={showSidebar} setShowSidebar={setShowSidebar} />
					{questionData && questionData.length === 0 && (
						<div className="p-4 mb-24 h-full flex place-content-center items-center">
							<p className="text-gray-400">아직 답변한 질문이 없어요</p>
						</div>
					)}
					{questionData && questionData.length !== 0 && (
						<div className="space-y-8 mt-8 pb-16">
							{Object.keys(questionGroupData).map(key => {
								// 질문 컨테이너
								return (
									<div className="px-3 flex justify-center" key={uuidv4()}>
										<div className="w-full flex flex-col border border-zinc-400 hover:bg-gray-100/50 rounded-lg bg-white p-6 shadow-lg dark:bg-neutral-700">
											<div className="flex items-center mb-4 justify-between">
												<p className="text-black text-lg font-bold">{key}</p>
												<button
													type="button"
													className="cursor-pointer flex px-2 py-0.5 text-sm text-gray-700 shadow-[0_1px_9px_-4px_#3b71ca] capitalize transition-colors duration-200 bg-white rounded-md hover:bg-gray-100 dark:bg-gray-900 dark:text-gray-200 dark:border-gray-700 dark:hover:bg-gray-800"
													data-te-ripple-init
													data-te-ripple-color="light"
													id={questionGroupData[key][0].midx}
													onClick={function (event) {
														onEditClickHandler(event);
														setShowSidebar(!showSidebar);
													}}
												>
													수정하기
												</button>
											</div>
											<div className="flex flex-col space-y-2 mt-3" key={uuidv4()}>
												{questionGroupData[key].map(elem => {
													return (
														<>
															<div className="flex justify-between" key={uuidv4()}>
																<div className="w-full grid grid-cols-[192px_1fr] items-center justify-betweens">
																	<div className="h-full text-base font-medium leading-tight text-neutral-500 dark:text-neutral-200">{elem.question_title_tag}</div>
																	<div className="mr-1 text-base font-normal text-neutral-900 dark:text-neutral-50">{elem.value}</div>
																</div>
															</div>
														</>
													);
												})}
											</div>
										</div>
									</div>
								);
							})}
						</div>
					)}
				</div>
			</div>
		</>
	);
};

const Heading = ({ showSidebar, setShowSidebar }) => {
	return (
		<div className="ml-2 p-4 mt-8 flex items-center">
			<div className="flex-grow">
				<p className="leading-relaxed text-xl text-justify font-bold">내 답변 한 눈에 확인하기 ✅ </p>
			</div>
			<div onClick={() => setShowSidebar(!showSidebar)} className="flex flex-row-reverse cursor-pointer w-7 h-7  items-center justify-center rounded-full bg-white-100 text-black flex-shrink-0">
				<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-7 h-7">
					<path
						fillRule="evenodd"
						d="M12 2.25c-5.385 0-9.75 4.365-9.75 9.75s4.365 9.75 9.75 9.75 9.75-4.365 9.75-9.75S17.385 2.25 12 2.25zm-1.72 6.97a.75.75 0 10-1.06 1.06L10.94 12l-1.72 1.72a.75.75 0 101.06 1.06L12 13.06l1.72 1.72a.75.75 0 101.06-1.06L13.06 12l1.72-1.72a.75.75 0 10-1.06-1.06L12 10.94l-1.72-1.72z"
						clipRule="evenodd"
					/>
				</svg>
			</div>
		</div>
	);
};
