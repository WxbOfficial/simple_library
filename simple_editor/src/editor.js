import * as rangeApi from './base_api/range.js';
import * as nodeApi from './base_api/node.js';
import * as componentApi from './component/component.js';
import EditorEvent from './event/event.js';

import { resetListLabel } from './component/template/block/list/list.js';

import './editor.css';


export default function Editor(dom, contentObj){
	// 初始化 dom

	this.editorDom = dom;
	this.editorDom.style['white-space'] = 'pre-wrap';
	this.editorDom.setAttribute('editor', true);

	this.lastRange = {}

	// 事件
	// 初始化事件
	this.event = new EditorEvent(this);

	// 组件
	// 默认的块类型数据
	this.defualtBlockObj = { type: 'paragraph' };
}

Editor.prototype.init = function(){
	let paragraph = this.objToDom(this.defualtBlockObj);
	this.nodeApi.appendChild(this.editorDom, paragraph);
	this.rangeApi.setNewCollapsedRange(paragraph, 0);
	this.setEditable(true);
	return this;
}

Editor.prototype.destroy = function(){

	this.event.destroy();
	this.event = null;
}

Editor.prototype.setEditable = function(editable){
	this.editorDom.contentEditable = this.editable = editable;
	return this;
}

Editor.prototype.recordRange = function(range){
	let {
			collapsed,
			startContainer,
			startOffset,
			endContainer,
			endOffset
		} = range;
	this.lastRange.collapsed = collapsed;
	this.lastRange.startContainer = startContainer;
	this.lastRange.startOffset = startOffset;
	this.lastRange.endContainer = endContainer;
	this.lastRange.endOffset = endOffset;

	return this;
}

Editor.prototype.rangeApi = Editor.rangeApi = rangeApi;
Editor.prototype.nodeApi = Editor.nodeApi = nodeApi;
Editor.prototype.nodeLabel = Editor.nodeLabel = nodeApi.nodeLabel;

// 组件数据转化
// 传入数据, 渲染编辑器
Editor.prototype.render = function(obj){
	this.nodeApi.emptyAllChild(this.editorDom);
	obj.blocks.forEach((blockObj)=>{
		let blockDom = this.objToDom(blockObj);
		if( blockDom ){
			this.nodeApi.appendChild(this.editorDom, blockDom);
		}else{
			console.error('blockObj:', blockObj);
			throw new Error('组件 dom 读取解析失败');
		}
	});
	return this;
}

Editor.prototype.empty = function(){
	this.nodeApi.emptyAllChild(this.editorDom);
}
// 返回编辑器内的数据
Editor.prototype.toObj = function(){
	let obj = {
		blocks: []
	}
	this.editorDom.childNodes.forEach((blockDom)=>{
		let blockObj = this.domToObj(blockDom);
		if( blockObj ){
			obj.blocks.push( blockObj );
		}else{
			console.error('blockDom', blockDom);
			throw new Error('block 转化失败');
		}
	});
	return obj;
}
// 传入组件数据, 生成对应的组件 dom
Editor.prototype.objToDom = function(obj){

	return componentApi.getComponentDom(this, obj);
}
// 传入组件 dom, 生成对应的组件数据
Editor.prototype.domToObj = function(dom){

	return componentApi.getComponentObj(this, dom);
}

// 加载 json 文件
Editor.prototype.loadJson = function(jsonUrl, callback){
	let xmlhttp = new XMLHttpRequest(),
			editor = this;
	xmlhttp.onreadystatechange = function () {
		// console.log("jsonUrl:", jsonUrl);
		// console.log("this:", this);
		// console.log("this.readyState:", this.readyState);
		// console.log("this.status:", this.status);
		if (this.readyState == 4 && this.status == 200) {
			// console.log("this.responseText:", this.responseText);
			try{
				let obj = JSON.parse(this.responseText);
				editor.render(obj);
				if( typeof callback === 'function' ){
					callback(obj);
				}
			}catch(e){
				editor.init();
				console.error("文件解析有问题", e);
			}
		}
	};
	xmlhttp.open("GET", jsonUrl, true);
	xmlhttp.send();
	return this;
}
// 导出 json 文件
Editor.prototype.exportObjJsonFormatting = function(filename){
	let eleLink = document.createElement('a');
	eleLink.download = filename;
	eleLink.style.display = 'none';
	// 字符内容转变成blob地址
	let blob = new Blob([JSON.stringify(this.toObj(), null, 4)]);
	eleLink.href = URL.createObjectURL(blob);
	// 触发点击
	// document.body.appendChild(eleLink);
	this.nodeApi.appendChild(document.body, eleLink);
	eleLink.click();
	// 然后移除
	this.nodeApi.removeNode(eleLink);
	return this;
}

// 事件操作

Editor.prototype.helpEventType = {
	getFirstContainer: 'getFirstContainer',
	getLastContainer: 'getLastContainer',
	getMergeContainer: 'getMergeContainer',
	getMergedNodes: 'getMergedNodes',
	mergedDeleteNode: 'mergedDeleteNode',
}

Editor.prototype.executeHelpEvent = function(block, eventType, params){
	if( this.nodeApi.isNotBlock(block) ){
		console.error('block:', block);
		throw new Error('executeHelpEvent 传参错误, 不是 block');
	}
	let event = componentApi.getComponentHelpEvent(block.className, eventType);
	if( event ){
		return event.apply(this, params);
	}else{
		throw new Error(`${eventKey} 组件 ${eventType} 辅助事件未完善`);
	}
}

Editor.prototype.eventType = {
	deleteForward: 'deleteForward',
	deleteForwardOnStart: 'deleteForwardOnStart',
	// deleteBackward: 'deleteBackward',
	deleteFragment: 'deleteFragment',
	enter: 'enter',
	enterFragment: 'enterFragment'
}

Editor.prototype.executeEditorEvent = function(block, eventType, params){
	if( this.nodeApi.isNotBlock(block) ){
		console.error('block:', block);
		throw new Error('executeEditorEvent 传参错误, 不是 block');
	}
	let event = componentApi.getComponentEvent(block.className, eventType);
	if( event ){
		event.apply(this, params);
	}else{
		throw new Error(`${eventKey} 组件 ${eventType} 事件未完善`);
	}
}

Editor.prototype.deleteForward = function(){
	console.clear();
	console.log('deleteForward');
	let 
		{ rangeApi, nodeApi } = this,
		range = rangeApi.getRange();
	if( !range ){
		throw new Error('range 不存在, deleteForward 执行失败');
		return ;
	}
	let	{ collapsed, startContainer, startOffset, endContainer, endOffset } = range;

	if( collapsed ){
		let executeNode = nodeApi.getBlock(startContainer);
		this.executeEditorEvent(executeNode, this.eventType.deleteForward, [startContainer, startOffset]);
	}else{
		let 
			startBlockNode = nodeApi.getBlock(startContainer),
			endBlockNode = nodeApi.getBlock(endContainer);

		if( startBlockNode === endBlockNode ){
			console.log('在同一个 block 中');
			this.executeEditorEvent(startBlockNode, this.eventType.deleteFragment, [startContainer, startOffset, endContainer, endOffset]);
		}else{
			console.log('在不同的 block 中');
			while(startBlockNode.nextSibling !== endBlockNode){
				this.nodeApi.removeNode(startBlockNode.nextSibling);
			}
			this.executeEditorEvent(startBlockNode, this.eventType.deleteFragment, [startContainer, startOffset, void 0, void 0]);
			this.executeEditorEvent(endBlockNode, this.eventType.deleteFragment, [void 0, void 0, endContainer, endOffset]);
			this.mergeTwoBlocks(startBlockNode, endBlockNode);
		}
	}
}

// 在不同的 block 中, deleteForward deleteBackward 之后合并两个 block
Editor.prototype.mergeTwoBlocks = function(preBlock, block){
	console.log('%cEditor mergeTwoBlocks', 'color: #000000; background-color: #ffffff');
	console.log('preBlock:', preBlock, '\nblock:', block);
	let
		{ rangeApi, nodeApi } = this,
		mergeContainer = this.executeHelpEvent(preBlock, this.helpEventType.getMergeContainer, [preBlock]),
		mergedNodes = this.executeHelpEvent(block, this.helpEventType.getMergedNodes, [block]),
		mergedDeleteNode = this.executeHelpEvent(block, this.helpEventType.mergedDeleteNode, [block]);

	if( mergeContainer ){
		console.log('前一个 block 存在能够合并的容器:', mergeContainer);
		if( mergedNodes ){
			console.log('当前 block 存在用于合并的节点:', mergedNodes);
			let preEnd = mergeContainer.childNodes[mergeContainer.childNodes.length - 1],
					nextStart = mergedNodes[0];
			if( preEnd ){
				console.log('前一个 block 存在最后一个节点:', preEnd);
				if( nextStart ){
					console.log('当前 block 存在第一个节点:', nextStart);
					nodeApi.appendChildren(mergeContainer, mergedNodes);
					nodeApi.mergeTwoNodes(preEnd, nextStart);
					if( mergedDeleteNode ){
						nodeApi.removeNode(mergedDeleteNode);
					}
				}else{
					console.log('当前 block 不存在第一个节点, 为空');
					if( mergedDeleteNode ){
						nodeApi.removeNode(mergedDeleteNode);
					}
				}
			}else{
				console.log('前一个 block 不存在最后一个节点, 为空');
				if(nextStart){
					console.log('当前 block 存在第一个节点:', nextStart);
					nodeApi.appendChildren(mergeContainer, mergedNodes);
					if( mergedDeleteNode ){
						nodeApi.removeNode(mergedDeleteNode);
					}
				}else{
					console.log('当前 block 不存在第一个节点, 为空');
					if( mergedDeleteNode ){
						nodeApi.removeNode(mergedDeleteNode);
					}
				}
			}
		}else{
			console.log('当前 block 不存在用于合并的节点');
		}
	}else{
		console.log('前一个 block 不存在能够合并的容器');
	}
}

Editor.prototype.deleteBackward = function(){
	console.clear();
	let 
		{ rangeApi, nodeApi } = this,
		range = rangeApi.getRange();
	if( !range ){
		throw new Error('range 不存在, deleteBackward 执行失败');
		return ;
	}
	let	{ collapsed, startContainer, startOffset, endContainer, endOffset } = range;
}

Editor.prototype.enter = function(){
	console.clear();
	let 
		{ rangeApi, nodeApi } = this,
		range = rangeApi.getRange();
	if( !range ){
		throw new Error('range 不存在, enter 执行失败');
		return ;
	}
	let	{ collapsed, startContainer, startOffset, endContainer, endOffset } = range;
	if( collapsed ){
		let executeNode = nodeApi.getBlock(startContainer);
		// console.log('executeNode:', executeNode);
		this.executeEditorEvent(executeNode, this.eventType.enter, [startContainer, startOffset]);
	}else{
		let 
			startBlockNode = nodeApi.getBlock(startContainer),
			endBlockNode = nodeApi.getBlock(endContainer);

		if( startBlockNode === endBlockNode ){
			console.log('在同一个 block 中');
			let executeNode = nodeApi.getBlock(startContainer);
			this.executeEditorEvent(executeNode, this.eventType.enterFragment, [startContainer, startOffset, endContainer, endOffset]);

		}else{
			console.log('在不同的 block 中');
			while(startBlockNode.nextSibling !== endBlockNode){
				this.nodeApi.removeNode(startBlockNode.nextSibling);
			}
			this.executeEditorEvent(startBlockNode, this.eventType.enterFragment, [startContainer, startOffset, void 0, void 0]);
			this.executeEditorEvent(endBlockNode, this.eventType.enterFragment, [void 0, void 0, endContainer, endOffset]);
		}
	}
}

Editor.prototype.insertText = function(text, hasDeleteForward){
	if( !hasDeleteForward ){
		console.clear();
	}
	console.log('insertText:', text);
	let 
		{ rangeApi, nodeApi } = this,
		range = rangeApi.getRange();
	if( !range ){
		throw new Error('range 不存在, insertText 执行失败');
		return ;
	}
	let	{ collapsed, startContainer, startOffset, endContainer, endOffset } = range;

	if( collapsed ){
		console.log('startContainer:', startContainer, '\nstartOffset:', startOffset);
		let container = nodeApi.getContainer(startContainer);
		if( !nodeApi.allowLine(container) ){
			console.log('不允许换行');
			text = text.replace(/\n/g, ' ');
		}
		if( startContainer.nodeType === Node.TEXT_NODE ){
			console.log('在 text 内插入字符');
			startContainer.insertData(startOffset, text);
			rangeApi.setCollapsedRange(startContainer, startOffset + text.length);
		}else if( startContainer.nodeType === Node.ELEMENT_NODE ){
			if( startContainer.childNodes.length === 0 && startOffset === 0 ){
				if( nodeApi.isContainer(startContainer) ){
					console.log('在一个空的 container 内');
					let textNode = nodeApi.createTextNode(text);
					nodeApi.appendChild(startContainer, textNode);
					rangeApi.setCollapsedRange(textNode, text.length);
				}else{
					throw new Error('不知道的特殊情况, 按道理应该是 container 容器才是');
				}
			}else if( startContainer.nodeType === Node.ELEMENT_NODE ){
				console.log('在元素内插入字符');
				if( startOffset === 0 ){
					console.log('startOffset 为 0');
					let 
						element = startContainer.childNodes[0],
						leafNode = nodeApi.getStartLeafNode(element),
						preLeafNode = nodeApi.getPreLeafNodeInContainer(element),
						textNode = nodeApi.createTextNode(text);

					console.log('element:', element, '\nleafNode:', leafNode, '\npreLeafNode:', preLeafNode);

					if( preLeafNode && preLeafNode.nodeType === Node.TEXT_NODE ){
						console.log('preLeafNode 是 text');
						preLeafNode.insertData(preLeafNode.length, text);
						rangeApi.setCollapsedRange(preLeafNode, preLeafNode.length);
					}else if( leafNode.nodeType === Node.TEXT_NODE ){
						console.log('preLeafNode 是 node, , leafNode 是 text');
						leafNode.insertData(0, text);
						rangeApi.setCollapsedRange(leafNode, text.length);
					}else{
						console.log('leafNode 是 node, preLeafNode 也是 node (或者不存在)');
						let beforeNode = element,
								parentNode = beforeNode.parentNode;
						while( nodeApi.isNotContainer(parentNode) && !beforeNode.previousSibling ){
							beforeNode = parentNode;
							parentNode = beforeNode.parentNode;
						}
						nodeApi.insertBefore(textNode, beforeNode);
						rangeApi.setCollapsedRange(textNode, text.length);
					}
				}else{
					console.log('startOffset 不为 0');
					let
						element = startContainer.childNodes[startOffset - 1],
						leafNode = nodeApi.getEndLeafNode(element),
						nextLeafNode = nodeApi.getNextLeafNodeInContainer(element),
						textNode = nodeApi.createTextNode(text);

					console.log('element:', element, '\nleafNode:', leafNode, '\nnextLeafNode:', nextLeafNode);
					if( leafNode.nodeType === Node.TEXT_NODE ){
						console.log('leafNode 是 text');
						leafNode.insertData(leafNode.length, text);
						rangeApi.setCollapsedRange(leafNode, leafNode.length);
					}else if( nextLeafNode && nextLeafNode.nodeType === Node.TEXT_NODE ){
						console.log('leafNode 是 node, nextLeafNode 是 text');
						nextLeafNode.insertData(0, text);
						rangeApi.setCollapsedRange(nextLeafNode, text.length);
					}else{
						console.log('leafNode 是 node, nextLeafNode 也是 node (或者不存在)');

						let afterNode = element,
								parentNode = afterNode.parentNode;
						while( nodeApi.isNotContainer(parentNode) && !afterNode.nextSibling ){
							afterNode = parentNode;
							parentNode = afterNode.parentNode;
						}
						nodeApi.insertAfter(textNode, afterNode);
						rangeApi.setCollapsedRange(textNode, text.length);
					}
				}
			}
		}
	}else{
		this.deleteForward();
		this.insertText(text, true);
	}

}

Editor.prototype.insertElement = function(element, hasDeleteForward){
	if( !hasDeleteForward ){
		// console.clear();
	}
	console.log('insertElement:', element);
	let 
		{ rangeApi, nodeApi } = this,
		range = rangeApi.getRange();
	if( !this.editorDom.contains(range.startContainer) ){
		range = this.lastRange;
	}
	if( !range ){
		throw new Error('range 不存在, insertElement 执行失败');
		return ;
	}
	let	{ collapsed, startContainer, startOffset, endContainer, endOffset } = range;

	if( collapsed ){
		console.log('startContainer:', startContainer, '\nstartOffset:', startOffset);
		if( startContainer.nodeType === Node.TEXT_NODE ){
			console.log('在 text 内插入元素');
			if( startOffset === startContainer.length ){
				console.log('在 text 末端');
				let afterNode = startContainer,
						parentNode = afterNode.parentNode;
				while( nodeApi.isNotContainer(parentNode) && !afterNode.nextSibling ){
					afterNode = parentNode;
					parentNode = afterNode.parentNode;
				}
				let index = nodeApi.getNodeIndexOf(afterNode);
				if( NodeList.prototype.isPrototypeOf(element)
						|| Array.prototype.isPrototypeOf(element) ){
					for( let i = element.length - 1; i >= 0; i-- ){
						nodeApi.insertAfter(element[i], afterNode);
					}
					rangeApi.setCollapsedRange(parentNode, index + element.length + 1);
				}else{
					nodeApi.insertAfter(element, afterNode);
					rangeApi.setNewCollapsedRange(parentNode, index + 2);
				}
			}else{
				console.error('犯懒了, 暂不支持此操作');
			}
		}else if( startContainer.nodeType === Node.ELEMENT_NODE ){
			console.error('犯懒了, 暂不支持此操作');
		}
	}else{
		console.error('犯懒了, 暂不支持此操作');
	}
}

Editor.prototype.format = function(command){

}

Editor.prototype.resetListLabel = resetListLabel;