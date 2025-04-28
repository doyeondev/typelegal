import React from 'react';

// stage-2에서 is_default === false인게 답변 안되면 체크 안되는거
export default function ProgressList({ activeClauseKeys, questionData }) {
	//   console.log('activeClauseKeys', activeClauseKeys)
	let questionGroupData = _.groupBy(_.orderBy(questionData, ['midx', 'qidx'], ['asc', 'asc']), _ => _.binding_question_ko);
	//   console.log('questionData', questionData)
	return Object.keys(questionGroupData).map(key => {
		// trigger가 아니고, value가 있는 질문이며, 계약서에 존재하는 binding_key를 가진 질문
		// let questionsLeft = questionGroupData[key].filter(x => !x.output_type.includes('trigger') && !x.value)
		let questionsLeft = questionGroupData[key].filter(x => x.is_fixed || (!x.is_fixed && x.is_default)); // 계약서에 없는 질문은 답 안해도 됨 = 계약서에 없는 질문은 남은 질문 아님.
		questionsLeft = questionsLeft.filter(x => !x.value); // value 있는건 답변 된거니깐 value 없는 질문만 남김
		// questionsLeft.filter(x => !activeClauseKeys.includes(x.binding_key))
		// questionsLeft = questionsLeft.filter(x => activeClauseKeys.includes(x.binding_key)) // 계약서에 존재하는 binding_key를 가진 질문으로 다시 필터 (질문이 표시되지 않아도, 존재하므로 걸러줘야함)
		// status = questionGroupData[key].filter(x => x.is_default) // 계약서에 존재하는 binding_key를 가진 질문으로 다시 필터 (질문이 표시되지 않아도, 존재하므로 걸러줘야함)

		// console.log('questionsLeft', questionsLeft.length, questionsLeft)
		if (questionsLeft.length === 0) {
			//   console.log('all answered', status)
			//   console.log('key', questionGroupData[key])
			//   console.log('title', questionGroupData[key][0].question_category)
			let title = questionGroupData[key][0].question_category;
			//   answeredQuestionCategory.push({ key: questionGroupData[key][0].midx, value: questionGroupData[key][0].question_category })
			return (
				<>
					{/* <ProgressItem progressList={progressList[i]} /> */}
					<div className="space-y-2 text-sm font-semibold">
						<div className="flex space-x-4 items-center">
							<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="#21C55D" className="w-6 h-6">
								<path
									fill-rule="evenodd"
									d="M2.25 12c0-5.385 4.365-9.75 9.75-9.75s9.75 4.365 9.75 9.75-4.365 9.75-9.75 9.75S2.25 17.385 2.25 12zm13.36-1.814a.75.75 0 10-1.22-.872l-3.236 4.53L9.53 12.22a.75.75 0 00-1.06 1.06l2.25 2.25a.75.75 0 001.14-.094l3.75-5.25z"
									clip-rule="evenodd"
								/>
							</svg>
							<p>{title}</p>
						</div>
					</div>
				</>
			);
		}
	});
}
