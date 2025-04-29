import { num2han } from './numberUtils.js';

export function returnCurrencyValue(e) {
	let val = e.target.value;
	const isNumber = v => /^\d{1,100}$/.test(v); // or use [0-5]
	if (isNumber(val.replace(/[, ]+/g, ''))) {
		// val = val.replace(/[, ]+/g, '')
		val = parseInt((val + '').replace(/[^0-9]/g, ''), 10) + '';
		let textVal = num2han(val);
		console.log('num2han', num2han(val));
		console.log('no comma val', val);
		return `${val.toString().replace(/(\d)(?=(\d\d\d)+(?!\d))/g, '$1,')} (${textVal})`;
	} else {
		return e.target.value;
	}
}

export function returnCheckboxValue(e) {
	let val = e.target.value;
	const isNumber = v => /^\d{1,100}$/.test(v); // or use [0-5]
	if (isNumber(val.replace(/[, ]+/g, ''))) {
		// val = val.replace(/[, ]+/g, '')
		val = parseInt((val + '').replace(/[^0-9]/g, ''), 10) + '';
		let textVal = num2han(val);
		console.log('num2han', num2han(val));
		console.log('no comma val', val);
		return `${val.toString().replace(/(\d)(?=(\d\d\d)+(?!\d))/g, '$1,')} (${textVal})`;
	}
}

export function returnInputValue(e, item) {
	if (e.target.type === 'text') {
		return e.target.value;
	} else if (e.target.toString().includes('SelectElement')) {
		let selectedIdx = e.target.selectedIndex;
		if (selectedIdx === undefined || !e.target.options || selectedIdx < 0 || !e.target.options[selectedIdx]) {
			return undefined;
		}
		let selectedValue = e.target.options[selectedIdx].value;
		return selectedValue;
	} else if (e.target.type === 'date') {
		const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
		return e.target.value;
	} else if (e.target.type === 'radio') {
		return e.target.value;
	} else if (e.target.type === 'checkboxList') {
		// console.log('entered checkbox');
		let checked = Array.from(document.querySelectorAll(`[name=${e.target.name}]:checked`));
		let selectedValue = [];
		checked.forEach(function (e) {
			selectedValue.push(`- ${e.value}`);
		});
		return selectedValue.join('<br>');
	} else if (e.target.type === 'checkbox') {
		// console.log('entered checkboxString');
		let checked = Array.from(document.querySelectorAll(`[name=${e.target.name}]:checked`));
		let selectedValue = [];
		checked.forEach(function (e) {
			selectedValue.push(`${e.value}`);
		});
		return selectedValue.join(', ');
	}
}
