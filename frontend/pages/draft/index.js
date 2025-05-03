import Link from 'next/link';
import Head from 'next/head';
import Layout from '../../src/components/Layout';
import Spinner from '../../src/components/ui/Spinner';
import React, { useEffect, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import PrivateRoute from '../../src/components/auth/PrivateRoute';

import useSWR from 'swr';

// const fetcher = () => fetch('https://conan.ai/_functions/getAllTemplateInfo').then(response => response.json())

const Template = () => {
	const fetcher = url => fetch(url).then(res => res.json());
	const { data, error, isLoading } = useSWR('https://conan.ai/_functions/getAllTemplateInfo', fetcher);
	console.log('data', data);
	// console.log("useSWR('template', fetcher)", useSWR('template', fetcher))
	useEffect(() => {
		async function getPageData() {
			localStorage.theme = 'light';
			//   location.assign('/')
			if (sessionStorage.getItem('item_key')) sessionStorage.removeItem('item_key'); // remove contract key session
		}
		getPageData();
	}, []);

	return (
		<Layout>
			<Head>
				<title>타입리걸 | 계약서 리스트</title>
				<meta name="description" content="타입리걸의 계약서 리스트를 확인해보세요" />
				<meta property="og:title" content="계약서 작성 시작하기" />
				<link rel="icon" href="/favicon.ico" />
			</Head>
			<div className="flex flex-col w-screen pt-[60px] h-[calc(100vh-68px)]">{data ? <ContractList data={data} /> : <Spinner />}</div>
		</Layout>
	);
};

const ContractList = ({ data }) => {
	return (
		<div className="grid h-[100%] pt-12 pb-24">
			<div className="grid place-content-center items-center">
				<h1 className="font-bold text-2xl text-center mb-8">디자인 프리랜서 계약서 작성하기</h1>
				<ul className="space-y-4">
					{data.items.map(contract => (
						<div className="w-[320px] grid py-1" key={contract._id}>
							<li key={contract.type}>
								<Link href={`/draft/${contract.type}`}>
									<button className="w-full btn-purple-headless text-base py-1.5 gap-x-4">
										{contract.category} 계약서
										<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" className="pointer-events-none w-8 h-8 rtl:-scale-x-100">
											<path strokeLinecap="round" strokeLinejoin="round" d="M17.25 8.25L21 12m0 0l-3.75 3.75M21 12H3" />
										</svg>
									</button>
									{/* <p className="font-semibold text-center text-white">{contract.title}</p> */}
								</Link>
							</li>
						</div>
					))}
				</ul>
			</div>
		</div>
	);
};

export default function TemplateWrapper() {
	return (
		<PrivateRoute>
			<Template />
		</PrivateRoute>
	);
}
