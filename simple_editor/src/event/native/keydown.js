
export default function handleOnKeydown(e){
	// console.log('handleOnKeydown e:', e);
	if( e.ctrlKey || e.metaKey ){
		if( e.keyCode === 67 ){
			// c 执行 copy
			return ;
		}else if( e.keyCode === 86 ){
			//	v 执行  paste
			return ;
		}else if( e.keyCode === 83 ){
			//	s 执行 save
			return ;
		}
	}
	let preventDefault = true;
	switch( e.keyCode ){
		case 8://	backspace
			this.deleteForward();
			break;
		case 46://	Delete
			this.deleteBackward();
			break;
		case 13://	enter
			this.enter();
			break;
		case 37://	ArrowLeft
		case 38://	ArrowUp
		case 39://	ArrowRight
		case 40://	ArrowDown
			preventDefault = false;
			break;
		default:
			if( e.key.length === 1 && e.keyCode !== 229 ){// 输入普通字符串
				this.insertText(e.key);
			}
			break;
	}
	if( preventDefault ){
		e.preventDefault();
	}
}