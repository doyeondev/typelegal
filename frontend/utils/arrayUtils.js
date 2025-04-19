import _ from 'lodash';

// multiple object일 경우
export function replaceArray(myArray, objKey, newValue) {
	// Find index of specific object using findIndex method.
	const index = myArray.findIndex(o => o.key == objKey);
	// Update object's name property.
	if (index > -1) {
		myArray[index].value = newValue;
	}
	return myArray[index];
}

export function findItemsFromArray(arr, vals, key) {
	const items = [];
	// const mapped_array = arr.map(function(x) { return x[key]; })

	for (let i = 0; i < arr.length; i++) {
		for (let j = 0; j < vals.length; j++) {
			if (Array.isArray(vals[j]) === true) {
				console.log('val이 Array인 경우');
				// 배열의 순서와 관계없이 내용이 같은지 확인
				// 양쪽 배열을 정렬하여 비교 (원본 배열은 수정하지 않음)
				const arrKeySorted = [...arr[i][key]].sort();
				const valsSorted = [...vals[j]].sort();

				if (_.isEqual(arrKeySorted, valsSorted)) {
					items[items.length] = arr[i];
				}
			} else if (arr[i][key] == vals[j]) {
				console.log('val이 Array 아닌 경우');
				items[items.length] = arr[i];
			}
		}
	}
	return items;
}

// arr[] <-> val (returns unique "item" from index)
export function findItem(arr, val, key) {
	let index = arr.findIndex(e => e[key] == val);

	if (index > -1) {
		return arr[index];
	}
}

export function findItemIndex(arr, val, key) {
	let index = arr.findIndex(e => e[key] == val);

	if (index > -1) {
		return index;
	}
}

// arr[] <-> vals (returns all items[])
export function findAllItem(arr, val, key) {
	const items = [];
	const mapped_array = arr.map(function (x) {
		return x[key];
	});

	mapped_array.forEach((e, i) => {
		if (e == val) {
			items[items.length] = arr[i]; // items.push(arr[i]);
		}
	});
	return items;
}

// arr[] <-> vals[] (returns all indexes[])
export function findAllIndex(arr, val, key) {
	const indexes = [];
	const mapped_array = arr.map(function (x) {
		return x[key];
	});

	mapped_array.forEach((e, i) => {
		if (e == val) {
			indexes[indexes.length] = i; // indexes.push(i);
		}
	});
	return indexes;
}

// arr[] <-> vals[] (returns all "index" of matching value)
export function findIndexesFromArray(arr, vals, key) {
	const indexes = [];
	// const mapped_array = arr.map(function(x) { return x[key]; })

	for (let i = 0; i < arr.length; i++) {
		for (let j = 0; j < vals.length; j++) {
			if (Array.isArray(vals[j]) === true) {
				console.log('val이 Array인 경우');
				// 배열의 순서와 관계없이 내용이 같은지 확인
				// 양쪽 배열을 정렬하여 비교 (원본 배열은 수정하지 않음)
				const arrKeySorted = [...arr[i][key]].sort();
				const valsSorted = [...vals[j]].sort();

				if (_.isEqual(arrKeySorted, valsSorted)) {
					indexes[indexes.length] = i;
				}
			} else if (arr[i][key] == vals[j]) {
				console.log('val이 Array 아닌 경우');
				indexes[indexes.length] = i;
			}
		}
	}
	return indexes;
}

// multiple object일 경우
export function replaceValue(myArray, objKey, newValue) {
	// Find index of specific object using findIndex method.
	const index = myArray.findIndex(o => o.key == objKey);
	// Update object's name property.
	if (index > -1) {
		myArray[index].value = newValue;
		if ('highlight' in myArray[index]) {
			myArray[index].highlight = true;
			// console.log("myArray[index]", myArray[index]);
		}
	}
}

export function replaceValue2(myArray, objKey, newValue) {
	// Find index of specific object using findIndex method.
	const index = myArray.findIndex(o => o.binding_key == objKey);
	// Update object's name property.
	if (index > -1) {
		myArray[index].value = newValue;
	}
}

export function getKeyAndValue(arr) {
	let sortedArr = {
		keys: _.map(arr, 'key'),
		values: _.map(arr, 'value'),
		placeholder: _.map(arr, 'placeholder'),
	};
	return sortedArr;
}

export function getArrayOfKeys(arr) {
	let sortedArr = _.map(arr, 'id');
	return sortedArr;
}

Array.prototype.unique = function () {
	return Array.from(new Set(this));
};
