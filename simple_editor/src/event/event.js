import handleOnKeydown from './native/keydown.js';
import { handleCompositionStart, handleCompositionEnd } from './native/composition.js';
import handleOnPaste from './native/paste.js';
// import handleOnCopy from './native/copy.js';

export default class EditorEvent{
	constructor(editor){
		this.editor = editor;

		this.keydown = handleOnKeydown.bind(editor);
		editor.editorDom.addEventListener('keydown', this.keydown);

		this.compositionStartRange = {};
		this.compositionstart = handleCompositionStart.bind(editor);
		editor.editorDom.addEventListener('compositionstart', this.compositionstart);

		this.compositionend = handleCompositionEnd.bind(editor);
		editor.editorDom.addEventListener('compositionend', this.compositionend);

		this.paste = handleOnPaste.bind(editor);
		editor.editorDom.addEventListener('paste', this.paste);

		// 拖拽相关暂不实现, 直接禁止, 目前就先和上面一样用 addEventListener 吧, 说不准哪天就想实现了
		this.dragstart = function(e){
			e.preventDefault();
		}
		editor.editorDom.addEventListener('dragstart', this.dragstart);
		this.drop = function(e){
			e.preventDefault();
		}
		editor.editorDom.addEventListener('drop', this.drop);

		// this.mousedownEvent = []
		// this.mousedown = (function(e){
		// 	console.log('this:', this.editor);
		// 	console.log('e:', e.target);
		// 	// this.mousedownEvent.forEach(()=>{

		// 	// })
		// }).bind(this);
		// editor.editorDom.addEventListener('mousedown', this.mousedown);
	}
	destroy(){
		this.editor.editorDom.removeEventListener('keydown', this.keydown);
		this.keydown = null;

		this.compositionStartRange = null;
		this.editor.editorDom.removeEventListener('compositionstart', this.compositionstart);
		this.compositionstart = null;
		this.editor.editorDom.removeEventListener('compositionend', this.compositionend);
		this.compositionend = null;

		this.editor.editorDom.removeEventListener('paste', this.paste);
		this.paste = null;
		
		this.editor.editorDom.removeEventListener('dragstart', this.dragstart);
		this.dragstart = null;
		this.editor.editorDom.removeEventListener('drop', this.drop);
		this.drop = null;

		// this.mousedownEvent = null;
		// this.editor.editorDom.removeEventListener('mousedown', this.mousedown);
		// this.mousedown = null;

		this.editor = null;
	}
}