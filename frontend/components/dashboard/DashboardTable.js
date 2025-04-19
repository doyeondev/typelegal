import { useState } from 'react';
import { v4 as uuidv4 } from 'uuid';
import Link from 'next/link';
import DeleteModal from '../modals/DeleteModal';
import ContractStageElem from './ContractStageElem';

// 대시보드 테이블 헤더 컴포넌트
export const DashboardHeader = () => {
	return (
		<>
			<thead className="bg-white dark:bg-gray-800">
				<tr>
					<th scope="col" className="w-[15%] pl-6 pr-4 py-3.5 text-sm font-normal text-left rtl:text-right text-gray-500 dark:text-gray-400">
						상태
					</th>
					<th scope="col" className="w-[21%] px-4 py-3.5 text-sm font-normal text-left rtl:text-right text-gray-500 dark:text-gray-400">
						문서 이름
					</th>
					<th scope="col" className="w-[20%] px-6 py-3.5 text-sm font-normal text-left rtl:text-right text-gray-500 dark:text-gray-400">
						<span>계약 분류</span>
					</th>
					<th scope="col" className="w-[15%] px-4 py-3.5 text-sm font-normal text-left rtl:text-right text-gray-500 dark:text-gray-400">
						진행률
					</th>
					<th scope="col" className="w-[15%] px-4 py-3.5 text-sm font-normal text-left rtl:text-right text-gray-500 dark:text-gray-400">
						생성일
					</th>
					<th scope="col" className="w-[14%] relative px-4 py-3.5 text-gray-500 dark:text-gray-400">
						<span className="sr-only">Edit</span>
					</th>
				</tr>
			</thead>
		</>
	);
};

// 대시보드 테이블 내용 컴포넌트
export const DashboardBody = ({ dataItem, deleteItemHandler }) => {
	const [isOpen, setIsOpen] = useState(false);

	const handleSession = e => {
		console.log('entered handleSession');
		sessionStorage.setItem('item_key', e.target.id);
		let item_value = sessionStorage.getItem('item_key');
		console.log('item_value', item_value);
	};

	// progress가 없는 경우 기본값 0으로 설정
	const progress = dataItem.progress ? dataItem.progress : '0%';

	return (
		<>
			{/* even:bg-slate-50 */}
			<tbody className="bg-white divide-y divide-gray-200 dark:divide-gray-700 dark:bg-gray-900">
				<tr className="hover:bg-slate-50">
					<td className="w-[15%] px-2 py-2.5 text-sm font-medium text-gray-700">
						<ContractStageElem stage={dataItem.status} />
					</td>
					<td className="truncate w-[21%] px-4 py-2.5 text-sm text-gray-500 dark:text-gray-300">{dataItem.contract_title}</td>
					<td className="truncate w-[20%] px-6 py-2.5 text-sm text-gray-500 dark:text-gray-300">{dataItem.type}</td>
					<td className="truncate w-[15%] px-4 py-2.5 text-sm text-gray-500 dark:text-gray-300">{progress}</td>
					<td className="truncate w-[15%] px-4 py-2.5 text-sm text-gray-500 dark:text-gray-300">{new Date(dataItem.updated_at).toLocaleDateString()}</td>
					<td className="truncate w-[14%] px-4 py-2.5 text-sm">
						<div className="flex items-center gap-x-6">
							<div id={dataItem.id} onClick={e => setIsOpen(true)} className="cursor-pointer text-gray-500 transition-colors duration-200 dark:hover:text-red-500 dark:text-gray-300 hover:text-red-500 focus:outline-none">
								<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" className="pointer-events-none w-5 h-5">
									<path
										strokeLinecap="round"
										strokeLinejoin="round"
										d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0"
									/>
								</svg>
							</div>
							<DeleteModal isOpen={isOpen} setIsOpen={setIsOpen} deleteItemHandler={deleteItemHandler} id={dataItem.id} />

							<Link
								href={dataItem.query ? `/draft/${dataItem.query}/?_id=${dataItem.id}` : `/write/?_id=${dataItem.id}`}
								id={dataItem.id}
								onClick={handleSession}
								className="cursor-pointer text-gray-500 transition-colors duration-200 dark:hover:text-yellow-500 dark:text-gray-300 hover:text-yellow-500 focus:outline-none"
							>
								<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" className="pointer-events-none w-5 h-5">
									<path
										strokeLinecap="round"
										strokeLinejoin="round"
										d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0115.75 21H5.25A2.25 2.25 0 013 18.75V8.25A2.25 2.25 0 015.25 6H10"
									/>
								</svg>
							</Link>
						</div>
					</td>
				</tr>
			</tbody>
		</>
	);
};

// 페이지네이션 푸터 컴포넌트
export const FooterPagination = ({ currentIndex, maxIndex, onClickHandler }) => {
	const pagination = [];
	for (let i = 0; i <= maxIndex; i++) {
		if (i === currentIndex) {
			pagination.push(
				<Link href="#" id={i} name="paginationNum" onClick={onClickHandler} className="px-2 py-1 text-sm text-blue-500 rounded-md dark:bg-gray-800 bg-blue-100/60" key={uuidv4()}>
					{i + 1}
				</Link>
			);
		} else {
			pagination.push(
				<Link href="#" id={i} name="paginationNum" onClick={onClickHandler} className="px-2 py-1 text-sm text-gray-500 rounded-md dark:hover:bg-gray-800 dark:text-gray-300 hover:bg-gray-100" key={uuidv4()}>
					{i + 1}
				</Link>
			);
		}
	}
	return <>{pagination}</>;
};

// 대시보드 푸터 컴포넌트
export const DashboardFooter = ({ onClickHandler, currentIndex, maxIndex }) => {
	return (
		<>
			<div className="flex items-center justify-between mt-6">
				<button
					id="btnPrevious"
					name="paginationBtn"
					onClick={onClickHandler}
					className="w-[130px] place-content-center cursor-pointer flex py-2 text-sm text-gray-700 capitalize transition-colors duration-200 bg-white border rounded-md gap-x-2 hover:bg-gray-100 dark:bg-gray-900 dark:text-gray-200 dark:border-gray-700 dark:hover:bg-gray-800"
				>
					<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" className="pointer-events-none w-5 h-5 rtl:-scale-x-100">
						<path strokeLinecap="round" strokeLinejoin="round" d="M6.75 15.75L3 12m0 0l3.75-3.75M3 12h18" />
					</svg>
					이전
				</button>
				<div className="items-center lg:flex gap-x-3">
					<FooterPagination currentIndex={currentIndex} maxIndex={maxIndex} onClickHandler={onClickHandler} />
				</div>

				<button
					id="btnNext"
					name="paginationBtn"
					onClick={onClickHandler}
					className="w-[130px] place-content-center cursor-pointer flex py-2 text-sm text-gray-700 capitalize transition-colors duration-200 bg-white border rounded-md gap-x-2 hover:bg-gray-100 dark:bg-gray-900 dark:text-gray-200 dark:border-gray-700 dark:hover:bg-gray-800"
				>
					다음
					<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" className="pointer-events-none w-5 h-5 rtl:-scale-x-100">
						<path strokeLinecap="round" strokeLinejoin="round" d="M17.25 8.25L21 12m0 0l-3.75 3.75M21 12H3" />
					</svg>
				</button>
			</div>
		</>
	);
};
