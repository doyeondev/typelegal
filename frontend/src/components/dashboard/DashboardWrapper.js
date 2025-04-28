import { v4 as uuidv4 } from 'uuid';
import { DashboardHeader, DashboardBody, DashboardFooter } from './DashboardTable';

// 대시보드 래퍼 컴포넌트 (최근 활동 섹션 전체)
function DashboardWrapper({ dataList, currentIndex, maxIndex, onClickHandler, deleteItemHandler }) {
	return (
		<>
			<section className="w-full">
				<div className="flex flex-col h-[410px] justify-between px-4">
					<div>
						<div className="flex items-center gap-x-3">
							<h2 className="text-xl font-semibold text-gray-800 dark:text-white">최근 활동</h2>
							{/* <span className="px-3 py-1 text-xs text-blue-600 bg-blue-100 rounded-full dark:bg-gray-800 dark:text-blue-400">총 100개 문서</span> */}
						</div>
						<div className="flex flex-col mt-4">
							<table className="table-fixed w-[100%] h-full divide-y divide-gray-200 dark:divide-gray-700">
								<DashboardHeader />
								{dataList.map((elem, index) => {
									return <DashboardBody dataItem={elem} key={uuidv4()} deleteItemHandler={deleteItemHandler} />;
								})}
							</table>
						</div>
					</div>
					<DashboardFooter onClickHandler={onClickHandler} currentIndex={currentIndex} maxIndex={maxIndex} />
				</div>
			</section>
		</>
	);
}

export default DashboardWrapper;
