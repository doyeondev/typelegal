import React from 'react';
import Link from 'next/link';

/**
 * 계약서 작성 페이지 푸터 컴포넌트
 */
const DraftFooter = () => {
	return (
		<div className="h-[60px] w-full flex p-5 items-center border text-xs font-medium justify-between">
			<div>
				<p></p>
			</div>
			<div className="flex">
				<div className="flex divide-x items-center divide-gray-400 h-fit pr-1">
					<Link href="/policy/terms" target="_blank" className="flex pr-3 text-center text-gray-900 dark:text-white">
						이용약관
					</Link>
					<Link href="/policy/privacy" target="_blank" className="flex pl-3 text-gray-900 dark:text-white">
						개인정보처리방침
					</Link>
				</div>
			</div>
		</div>
	);
};

export default DraftFooter;
