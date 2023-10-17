
export function isEmpty(value){
	return value === null || value === void 0;
}

export function isObject(value){
	if( typeof value === 'object' && value !== null ){
		return true;
	}
	return false;
}

export function isNumber(value){
	return typeof value === 'number';
}

export function isInstance(value, template){
	return value instanceof template;
}

export function isDom(value){
	return isInstance(value, HTMLElement) && value.nodeType === 1;
}