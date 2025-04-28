import { v4 as uuidv4 } from 'uuid';
import ListElem from './Listbox';
import React, { useState } from 'react';

export default function QuestionItem({ questionGroupData, onChange, etcClick, etcChange, toggleQuestionTip }) {
	let qNo = 0;
	let type;
	console.log('questionGroupData', questionGroupData);
	//   let questionTypeOne = ['input', 'date', 'dropdown']
	//   let questionTypeTwo = ['checkbox', 'radio']
	// key={uuidv4()}
	// key={`${dataItem.id}_`}
	return questionGroupData.map((dataItem, index) => {
		type = dataItem.question_type;
		if (dataItem.is_default === true && type !== 'input' && type !== 'input_currency') {
			// if (dataItem.is_default === true && !dataItem.question_type.includes('input')) {
			if (!dataItem.output_type.includes('stage2')) {
				qNo = qNo + 1;
			}
			if (type.includes('input') || type.includes('date') || type.includes('dropdown')) {
				return <InputTypeOne dataList={dataItem} onChange={onChange} idx={qNo} toggleQuestionTip={toggleQuestionTip} key={`${dataItem.id}_`} />;
			} else if (type.includes('checkbox') || type.includes('radio')) {
				return <InputTypeTwo dataList={dataItem} onChange={onChange} etcClick={etcClick} etcChange={etcChange} idx={qNo} toggleQuestionTip={toggleQuestionTip} key={`${dataItem.id}_`} />;
			}
		}
	});
}

function InputTypeOne({ dataList, onChange, idx, toggleQuestionTip }) {
	let questionType = dataList.question_type;
	let outputType = dataList.output_type;
	//   console.log('questionType', questionType)

	let newValueForMoney = '';
	if (dataList.value && dataList.value.includes('원정')) {
		console.log('includes 원정', dataList.value);
		newValueForMoney = dataList.value.replace(/\D/g, '');
		newValueForMoney = newValueForMoney.toString().replace(/(\d)(?=(\d\d\d)+(?!\d))/g, '$1,');
	}

	return (
		<div className={`relative w-full ${!outputType.includes('stage1') && 'pl-4'}`}>
			<div className="flex items-center space-x-2">
				<label className={`leading-normal tracking-wide text-sm ${outputType.includes('stage1') ? 'text-gray-700' : 'text-gray-500'}`}>
					{!outputType.includes('stage2') && `${idx}. `}
					{dataList.question_title_ko}
				</label>
				{dataList.question_tip && (
					<div className="text-xs font-base cursor-pointer text-blue-500" onClick={toggleQuestionTip} id={dataList.id} name={`${dataList.binding_key}`}>
						{!dataList.bool_question_tip ? '해설보기' : '해설닫기'}
					</div>
				)}
			</div>
			{dataList.question_guide && <p className="text-xs mt-1 text-justify text-slate-400"> {dataList.question_guide} </p>}
			{/* {dataList.question_guide && <div className="pl-0 text-justify font-medium text-sm text-gray-400" dangerouslySetInnerHTML={{ __html: dataList.question_guide }}></div>} */}

			{/* <div> dangerouslySetInnerHTML={{ __html: dataList.question_guide }} <div/>*/}
			{questionType.includes('input') || questionType.includes('date') ? (
				<input
					type={dataList.question_type}
					// id={dataList.binding_key}
					// name={dataList.id}
					name={dataList.binding_key}
					id={dataList.id}
					// value={dataList.value}
					value={newValueForMoney !== '' ? newValueForMoney : dataList.value}
					placeholder={dataList.placeholder}
					onChange={onChange}
					className={`w-full mt-2 placeholder:text-slate-400 placeholder:text-sm bg-white rounded border border-gray-300 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 text-sm outline-none text-gray-700 py-1 px-3 leading-8 transition-colors duration-200 ease-in-out ${
						// dataList.output_type.includes('date') ? '' : 'picker'
						questionType.includes('date') && 'picker '
					}`}
				/>
			) : (
				<ListElem dataList={dataList} onChange={onChange} />
			)}
			{dataList.bool_question_tip && <QuestionTip questionTipTxt={dataList.question_tip} />}
		</div>
	);
}

function InputTypeTwo({ dataList, onChange, idx, toggleQuestionTip, etcClick, etcChange }) {
	const [optionValue, setOptionValue] = useState('');
	// console.log('dataList InputTypeTwo', dataList)
	let questionType = dataList.question_type;
	let outputType = dataList.output_type;
	return (
		<div className={`relative w-full flex flex-col ${!outputType.includes('stage1') && 'pl-4'}`}>
			<div className="flex items-center space-x-2">
				<label className={`leading-normal tracking-wide text-sm ${outputType.includes('stage1') ? 'text-gray-700' : 'text-gray-500'}`}>
					{!outputType.includes('stage2') && `${idx}. `}
					{dataList.question_title_ko}
				</label>
				{dataList.question_tip && (
					<div className="text-xs font-base cursor-pointer text-blue-500" onClick={toggleQuestionTip} id={dataList.id} name={dataList.binding_key}>
						{!dataList.bool_question_tip ? '해설보기' : '해설닫기'}
					</div>
				)}
			</div>
			{/* <div className={`flex items-center ${questionType.includes('checkbox') ? 'space-x-4' : 'items-center space-x-5'}`} > */}

			<div key={idx} className={`flex mt-2 ${questionType.includes('right') && 'items-center gap-x-7 gap-y-2.5 flex-wrap'} ${questionType.includes('down') && 'flex-col space-y-2'}`}>
				{dataList.options.map((option, index) => {
					return (
						<>
							<label className="cursor-pointer text-sm font-normal items-center text-gray-600 dark:text-gray-300" key={uuidv4()}>
								<input
									// id={dataList.binding_key}
									// name={dataList.id}
									name={dataList.binding_key}
									id={dataList.id}
									_id={dataList.id}
									onChange={onChange}
									onClick={option.type && option.type.includes('etc') ? etcClick : function (event) {}} // 기타 항목 추가할 때만 사용
									type={questionType.includes('checkbox') ? 'checkbox' : 'radio'}
									// type="checkbox"
									//   value={option.label === 'etc' ? optionValue : option.value}
									value={option.value}
									index={index}
									checked={option.checked}
									className={`mb-0.5 cursor-pointer text-[#584FEB] bg-gray-100 border-gray-300 focus:ring-purple-400 dark:focus:ring-[#584FEB] dark:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600 ${
										!questionType.includes('checkbox') ? 'w-3.5 h-3.5 ' : 'w-4 h-4 rounded'
										// !dataList.output_type.includes('date') && 'picker'
									}`}
								/>
								&nbsp;&nbsp;{option.label}
							</label>
							{option.type && option.type.includes('etc') && option.checked === 'checked' && (
								<div>
									<input
										className="w-full h-full py-1 placeholder:text-slate-400 placeholder:text-sm bg-white rounded border border-gray-300 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 text-sm outline-none text-gray-700 px-3 leading-8 transition-colors duration-200 ease-in-out false"
										type="input"
										name={`_${dataList.binding_key}`}
										// onChange={event => setOptionValue(event.target.value)}
										// onChange={etcChange}
										onChange={function (event) {
											//   setOptionValue(event.target.value)
											etcChange(event, index);
										}}
										value={option.value}
									></input>
								</div>
							)}
						</>
					);
				})}
			</div>
			{dataList.bool_question_tip && <QuestionTip questionTipTxt={dataList.question_tip} />}
		</div>
	);
}

const QuestionTip = ({ questionTipTxt }) => {
	return (
		<>
			<div className="bg-blue-100/40 round rounded-sm p-4 mt-2.5 text-justify font-medium text-sm text-gray-400" dangerouslySetInnerHTML={{ __html: questionTipTxt }}></div>
		</>
	);
};
