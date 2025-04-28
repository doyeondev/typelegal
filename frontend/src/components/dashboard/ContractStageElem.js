// 계약 상태를 표시하는 컴포넌트 (작성중, 작성완료, 검토중 등)
function ContractStageElem({ stage }) {
	let color = {
		stage1: ['작성중', `bg-[#9898A9]`, `bg-[#F7F7FC]`],
		stage2: ['작성완료', `bg-[#80CBFF]`, `bg-[#F3FAFF]`],
		stage3: ['검토중', `bg-[#FFCE00]`, `bg-[#FCF7E5]`],
		stage4: ['서명완료', `bg-[#FE8C8C]`, `bg-[#FFF2F3]`],
		stage5: ['서명완료', `bg-[#1DDC77]`, `bg-[#E5F8F1]`],
		'': ['작성중', `bg-[#9898A9]`, `bg-[#F7F7FC]`],
	};
	let colors = color[stage];
	let bgColor = colors[2];
	let textColor = colors[1];
	let textVal = colors[0];

	return (
		<>
			<div className={`inline-flex items-center px-3 py-1 rounded-full gap-x-2 ${bgColor} dark:bg-gray-800 `}>
				<span className={`h-1.5 w-1.5 rounded-full ${textColor}`}></span>
				<h2 className={`text-sm font-normal text-gray-600`}>{textVal}</h2>
			</div>
		</>
	);
}

export default ContractStageElem;
