import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import PropTypes from 'prop-types';

/**
 * 계약서 선택 컴포넌트
 *
 * 계약서 템플릿을 카드 형태로 보여주고, 사용 가능한 템플릿은 클릭 가능하도록 구현
 * ready 속성이 true인 템플릿은 링크 활성화, false인 템플릿은 Coming Soon 표시
 *
 * @param {Object} props - 컴포넌트 props
 * @param {Array} props.dummies - 계약서 템플릿 데이터 배열
 * @param {Array} props.dashboardData - 사용자의 계약서 데이터 배열 (기본값: [])
 */
function SelectContract({ dummies, dashboardData = [] }) {
	console.log('SelectContract 렌더링:', { dummies, dashboardData });

	/**
	 * 계약서 제목 렌더링 함수
	 * @param {Object} dummy - 계약서 데이터
	 * @returns {JSX.Element} - 렌더링할 제목 JSX
	 */
	const renderTitle = dummy => {
		if (!dummy.title2) {
			return <p className="absolute top-0 mt-12 bottom-1/2 left-0 right-0 m-auto text-center font-extrabold">{dummy.title}</p>;
		}

		return (
			<p className="absolute top-0 mt-9 bottom-1/2 left-0 right-0 m-auto text-center font-extrabold">
				<span>{dummy.title}</span>
				<br />
				{dummy.title2}
			</p>
		);
	};

	/**
	 * 활성화된 계약서 템플릿 렌더링 함수
	 * @param {Object} dummy - 계약서 데이터
	 * @returns {JSX.Element} - 활성화된 템플릿 JSX
	 */
	const renderReadyTemplate = dummy => (
		<>
			<Link className="z-100" href={dummy.url}>
				<Image alt={`${dummy.title} ${dummy.title2 || ''}`} src="/image/template.png" width={0} height={0} sizes="100vw" className="w-full h-full" />
			</Link>

			{renderTitle(dummy)}

			<Link className="z-100" href={dummy.url}>
				<Image alt="타입리걸" src="/icon/typelegal.png" width={0} height={0} sizes="100vw" className="absolute inset-x-0 bottom-0 w-[80px] mb-3 mx-auto" />
				<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="#000000" className="opacity-0 w-10 h-10 center-icon z-0">
					<path
						fillRule="evenodd"
						d="M12 2.25c-5.385 0-9.75 4.365-9.75 9.75s4.365 9.75 9.75 9.75 9.75-4.365 9.75-9.75S17.385 2.25 12 2.25zM12.75 9a.75.75 0 00-1.5 0v2.25H9a.75.75 0 000 1.5h2.25V15a.75.75 0 001.5 0v-2.25H15a.75.75 0 000-1.5h-2.25V9z"
						clipRule="evenodd"
					/>
				</svg>

				<div className="z-1 absolute w-full h-full bg-black opacity-0 hover:opacity-70 flex items-center cursor-pointer center-icon">
					<div className="bg-transparent mx-auto">
						<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="#ffffff" className="w-10 h-10">
							<path strokeLinecap="round" strokeLinejoin="round" d="M12 9v6m3-3H9m12 0a9 9 0 11-18 0 9 9 0 0118 0z" />
						</svg>
					</div>
				</div>
			</Link>
		</>
	);

	/**
	 * 비활성화된 계약서 템플릿 렌더링 함수
	 * @param {Object} dummy - 계약서 데이터
	 * @returns {JSX.Element} - 비활성화된 템플릿 JSX
	 */
	const renderComingSoonTemplate = dummy => (
		<>
			<Image alt={`${dummy.title} ${dummy.title2 || ''}`} src="/image/template.png" width={0} height={0} sizes="100vw" className="w-full h-full" />

			{renderTitle(dummy)}

			<div className="absolute w-full h-full bg-black center-icon opacity-40 flex items-center">
				<div className="bg-transparent mx-auto">
					<p className="text-white">Coming Soon</p>
				</div>
			</div>
		</>
	);

	return (
		<section className="px-4">
			<div className="flex items-center gap-4">
				{/* <Image alt="계약서 작성하기" src="/icon/pen.svg" width={0} height={0} sizes="100vw" className="w-8 h-8" /> */}
				{dashboardData.length > 0 && <p className="text-xl font-semibold text-black">계약서 작성하기</p>}
			</div>
			<div className="text-gray-600 body-font ">
				<div className="flex gap-12 mt-4 mb-4">
					{dummies.map((dummy, index) => {
						return (
							<div className="w-fit" key={`contract-template-${index}`}>
								<div className={`relative h-[150px] border round rounded-sm`}>{dummy.ready ? renderReadyTemplate(dummy) : renderComingSoonTemplate(dummy)}</div>

								{/* <div className="mt-4">
									<h2 className="text-gray-900 title-font text-sm font-semibold">
										{dummy.title} {dummy.title2}
									</h2>
								</div> */}
							</div>
						);
					})}
				</div>
			</div>
		</section>
	);
}

// PropTypes 정의
SelectContract.propTypes = {
	// 계약서 템플릿 정보 배열
	dummies: PropTypes.arrayOf(
		PropTypes.shape({
			image: PropTypes.string.isRequired,
			title: PropTypes.string.isRequired,
			title2: PropTypes.string,
			price: PropTypes.string,
			color: PropTypes.string,
			ready: PropTypes.bool.isRequired,
			url: PropTypes.string.isRequired,
		})
	).isRequired,
	// 사용자의 계약서 데이터 배열
	dashboardData: PropTypes.array,
};

// React.memo로 감싸서 불필요한 리렌더링 방지
export default React.memo(SelectContract);
