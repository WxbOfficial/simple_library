
export default function handleOnPaste(e){
	e.preventDefault();
	console.log('handleOnPaste:', e);
	console.log('犯懒了, 目前只支持 text');

	// let clipboardData = e.clipboardData,
	// 		index = 0,
	// 		length = clipboardData.items.length,
	// 		string = '';

	// for(let item of clipboardData.items){
	// 	console.log('item:', item);
	// 	if( item.type === 'text/plain' ){
	// 		item.getAsString((str)=>{
	// 			console.log('str:', str);
	// 		});
	// 	}
	// 	for (const type of item.types) {
	// 		console.log('type:', type);

	// 	}
	// }
	
	let string = (e.clipboardData || window.clipboardData).getData('text');
	this.insertText(string);
}
