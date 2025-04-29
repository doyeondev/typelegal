export function replaceMulCharInString(_string, input, _tracerKey) {
	for (let i = 0; i < input.keys.length; i++) {
		if (input.values[i] !== '' && input.keys[i] === _tracerKey) {
			_string = _string.replace(`<span id="span_${input.keys[i]}" class="draft">[${input.placeholder[i]}]</span>`, `<span id="span_${input.keys[i]}" class="variable">${input.values[i]}</span>`); // !!! 되던것 수정해봄
		} else if (input.values[i] !== '' && input.keys[i] !== _tracerKey) {
			_string = _string.replace(`<span id="span_${input.keys[i]}" class="draft">[${input.placeholder[i]}]</span>`, `<span id="span_${input.keys[i]}" class="drafted">${input.values[i]}</span>`); // !!! 되던것 수정해봄
		}
	}
	return _string;
}

export function removeHighlight(_string, input, _tracerKey) {
	for (let i = 0; i < input.keys.length; i++) {
		if (input.values[i] !== '') {
			_string = _string.replace(`<span id="span_${input.keys[i]}" class="variable">${input.values[i]}</span>`, `<span id="span_${input.keys[i]}" class="drafted">${input.values[i]}</span>`); // !!! 되던것 수정해봄
		}
	}
	return _string;
}

export function splice(str, addString, idx) {
	return str.slice(0, idx) + addString + str.slice(idx);
}

export function copyToClipboard(clickableText, target, targetDesc) {
	clickableText.onClick(() => {
		wixWindowFrontend.copyToClipboard(target.text).then(() => {
			clickableText.text = '(복사 성공!)';
			setTimeout(function () {
				clickableText.text = `(클릭 시 ${targetDesc} 복사)`;
			}, 500);
		});
	});
}
