import { useEffect, useState } from 'react';
import Layout from '../../src/components/Layout';
import Head from 'next/head';
import { terms_array } from '../../src/utils/data';
import PublicRoute from '../../src/components/auth/PublicRoute';

import _ from 'lodash';
// import Link from 'next/link'

// import styles from "../styles/Home.module.scss";
// let currentIndex = 0

export default function TermsWrapper() {
	return (
		<PublicRoute restricted={false}>
			<Terms />
		</PublicRoute>
	);
}

function Terms() {
	// const [policyData, setPolicyData] = useState([])
	const [loaded, isLoaded] = useState(false);
	const [currentMember, setCurrentMember] = useState('');

	useEffect(() => {
		async function getPageData() {
			localStorage.theme = 'light';

			if (sessionStorage.getItem('member_key')) {
				let member_value = JSON.parse(sessionStorage.getItem('member_key'));
				setCurrentMember(member_value);
				console.log(member_value);
			}
			isLoaded(true);
		}
		getPageData();
	}, []);

	// useEffect(() => {
	//   if (loaded === true) {
	//     if (policyData) {
	//       console.log('[MAIN HOOK] setPolicyData rendered', policyData)
	//     } else {
	//       console.log('no data')
	//     }
	//   }
	// }, [policyData, loaded])

	// grid-cols-[240px_1fr_1.2fr]
	return (
		<>
			<Layout>
				<Head>
					<title>타입리걸 | 이용약관</title>
					<meta name="description" content="계약서 작성의 시작, 타입리걸" />
					<link rel="icon" href="/favicon.ico" />
				</Head>
				<div className="h-auto pt-[60px]">
					{/* <div className="grid place-items-center bg-black h-[240px]">
            <div className="h-full w-full px-64 bg-white">s</div>
          </div> */}
					<div className="grid grid-cols-[1fr_844px_1fr] bg-gray-200 h-[240px]">
						<div />
						<div className="grid place-content-center h-full w-full py-8 text-4xl font-bold">
							<p>타입리걸 서비스 이용약관</p>
						</div>
						<div />
					</div>
					<div className="grid grid-cols-[1fr_844px_1fr] mx-auto">
						<div />
						<div className="py-16">
							{/* <div className="text-center font-bold text-2xl py-16">서비스 이용약관</div> */}
							{terms_array.map((elem, index) => {
								return <PolicyCard dataList={elem} index={index} key={elem._id} />;
							})}
						</div>
						<div />
					</div>
				</div>
			</Layout>
		</>
	);
}

const Spinner = () => {
	return (
		<>
			<div className="grid place-content-center items-center">
				<div role="status">
					<svg aria-hidden="true" class="w-8 h-8 mr-2 text-gray-200 animate-spin dark:text-gray-600 fill-blue-600" viewBox="0 0 100 101" fill="none" xmlns="http://www.w3.org/2000/svg">
						<path
							d="M100 50.5908C100 78.2051 77.6142 100.591 50 100.591C22.3858 100.591 0 78.2051 0 50.5908C0 22.9766 22.3858 0.59082 50 0.59082C77.6142 0.59082 100 22.9766 100 50.5908ZM9.08144 50.5908C9.08144 73.1895 27.4013 91.5094 50 91.5094C72.5987 91.5094 90.9186 73.1895 90.9186 50.5908C90.9186 27.9921 72.5987 9.67226 50 9.67226C27.4013 9.67226 9.08144 27.9921 9.08144 50.5908Z"
							fill="currentColor"
						/>
						<path
							d="M93.9676 39.0409C96.393 38.4038 97.8624 35.9116 97.0079 33.5539C95.2932 28.8227 92.871 24.3692 89.8167 20.348C85.8452 15.1192 80.8826 10.7238 75.2124 7.41289C69.5422 4.10194 63.2754 1.94025 56.7698 1.05124C51.7666 0.367541 46.6976 0.446843 41.7345 1.27873C39.2613 1.69328 37.813 4.19778 38.4501 6.62326C39.0873 9.04874 41.5694 10.4717 44.0505 10.1071C47.8511 9.54855 51.7191 9.52689 55.5402 10.0491C60.8642 10.7766 65.9928 12.5457 70.6331 15.2552C75.2735 17.9648 79.3347 21.5619 82.5849 25.841C84.9175 28.9121 86.7997 32.2913 88.1811 35.8758C89.083 38.2158 91.5421 39.6781 93.9676 39.0409Z"
							fill="currentFill"
						/>
					</svg>
				</div>
			</div>
		</>
	);
};

function PolicyCard({ dataList, index }) {
	// console.log('dataList', { dataList })

	return (
		<>
			<div>
				{/* 1. 제목 */}
				{dataList.is_clause && (
					<div className="flex text-justify w-full mb-2">
						<p className="text-gray-900 text-lg font-medium">
							<b>{dataList.heading}</b>
						</p>
					</div>
				)}

				{/* 2. 본문 */}
				<div className="text-justify mb-8">
					<div className="space-y-0.5 text-base" dangerouslySetInnerHTML={{ __html: dataList.content }}></div>
				</div>
			</div>
		</>
	);
}
