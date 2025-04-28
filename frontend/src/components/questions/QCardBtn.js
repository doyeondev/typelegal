import React from 'react';

export default function QCardBtn({ qData, onQBtnClickHandler }) {
	return (
		<div className="flex justify-items-center justify-center pt-10">
			<div className="px-8">
				<button
					id="previous"
					type="button"
					onClick={onQBtnClickHandler}
					className="place-content-center cursor-pointer flex gap-x-3 text-white bg-blue-500 hover:bg-blue-800 w-[120px] py-3 focus:ring-4 focus:ring-blue-300 font-medium rounded-lg text-sm dark:bg-blue-600 dark:hover:bg-blue-700 focus:outline-none dark:focus:ring-blue-800"
				>
					<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" className="pointer-events-none w-5 h-5 rtl:-scale-x-100">
						<path strokeLinecap="round" strokeLinejoin="round" d="M6.75 15.75L3 12m0 0l3.75-3.75M3 12h18" />
					</svg>
					이전
				</button>
			</div>
			<div className="px-8">
				<button
					id="next"
					type="button"
					onClick={onQBtnClickHandler}
					className="place-content-center cursor-pointer flex gap-x-3 text-white bg-blue-500 hover:bg-blue-800 w-[120px] py-3 focus:ring-4 focus:ring-blue-300 font-medium rounded-lg text-sm dark:bg-blue-600 dark:hover:bg-blue-700 focus:outline-none dark:focus:ring-blue-800"
				>
					다음
					<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" className="pointer-events-none w-5 h-5 rtl:-scale-x-100">
						<path strokeLinecap="round" strokeLinejoin="round" d="M17.25 8.25L21 12m0 0l-3.75 3.75M21 12H3" />
					</svg>
				</button>
			</div>
		</div>
	);
}
