import { getEmptyLiDom, resetListLabel } from '../list.js';
import { isLabel, isLiContent } from './delete_forward_on_start.js'

export default function enter(node, offset){
	console.log('%c执行 enter', 'color: #000000; background-color: #ffffff');
	console.log('node:', node, '\noffset:', offset);

	let { rangeApi, nodeApi } = this,
			container = nodeApi.getContainer(node),
			li = container.parentNode,
			liContent = li.childNodes[1],
			index = nodeApi.getNodeIndexOf(li),

			block = nodeApi.getBlock(container),
			newLi = getEmptyLiDom.call(this, block.getAttribute('label')),
			newLiContent = newLi.childNodes[1];

	// console.log('index:', index);
	// console.log('li.parentNode.childNodes.length:', li.parentNode.childNodes.length);
	// console.log('index === li.parentNode.childNodes.length - 1:', index === li.parentNode.childNodes.length - 1);

	if( index === li.parentNode.childNodes.length - 1 && liContent.childNodes.length === 0 ){
		console.log('是 list 中的最后一个 li, 且 content 为空');

		let	defaultBlock = this.objToDom(this.defualtBlockObj);

		nodeApi.removeNode(li);
		nodeApi.insertAfter(defaultBlock, block);
		rangeApi.setCollapsedRange(defaultBlock, 0);

	}else if( isLabel(container) ){
		console.log('在 label 中, 无操作');
	}else if( isLiContent(container) ){
		console.log('在 liContent 中');
		if( rangeApi.isStartInContainer(node, offset) ){
			console.log('在 liContent 头部');

			nodeApi.insertBefore( newLi, li );
		}else if( rangeApi.isEndInContainer(node, offset) ){
			console.log('在 liContent 末端');

			nodeApi.insertAfter(newLi, li);
			rangeApi.setCollapsedRange(newLiContent, 0);
		}else{
			console.log('需要拆分 liContent:', liContent);

			let splitedNode = nodeApi.splitFromNodeOffsetStillTop(node, offset, liContent);

			nodeApi.appendChildren( newLiContent, splitedNode.childNodes );
			nodeApi.insertAfter(newLi, li);
			rangeApi.setRangeOfNodeStart(newLiContent);
		}
	}
	resetListLabel(block);
}