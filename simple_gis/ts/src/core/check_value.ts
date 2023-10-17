
export function isEmpty(value: any): boolean{
	return value === null || value === void 0;
}

export function isObject(value: any): boolean{
	if( typeof value === 'object' && value !== null ){
		return true;
	}
	return false;
}

export function isNumber(value: any): boolean{
	return typeof value === 'number';
}

export function isInstance(value: any, template: any): boolean{
	return value instanceof template;
}

export function isDom(value: any){
	return isInstance(value, HTMLElement) && value.nodeType === 1;
}