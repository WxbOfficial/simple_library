export default function deleteForward(node, offset){
	console.log('%c执行 deleteForward', 'color: #000000; background-color: #ffffff');
	console.log('node:', node, '\noffset:', offset);

	let { rangeApi, nodeApi } = this,
			block = nodeApi.getBlock(node);

	if( node.nodeType === Node.TEXT_NODE ){
		console.log('为 TEXT_NODE');

		let singleNode = nodeApi.getSingleNodeInContainer(node),
				preNode = nodeApi.getPreNodeInContainer(singleNode),
				nextNode = nodeApi.getNextNodeInContainer(singleNode);

		if(offset === 0){
			console.log('偏移量为0的特殊位置');
			if( preNode ){
				console.log('preNode 存在, 当前节点应该为 block 样式, 再次执行 deleteForward');
				let [newNode, newOffset] = rangeApi.getRangeOfNodeEnd(preNode);
				deleteForward.call(this, newNode, newOffset);
			}else{
				console.log('preNode 存在, 是 container 内的第一个节点');
				this.executeEditorEvent(block, this.eventType.deleteForwardOnStart, [node, offset]);
			}
		}else if( offset === 1 ){
			console.log('偏移量为1的特殊位置');
			if( node.length === 1 ){
				console.log('删空 text');
				deleteLeafNodeInContainer.call(this, node);
			}else{
				console.log('删除一个字符');
				if( preNode ){
					console.log('跳到前一个节点末端');
					rangeApi.setRangeOfNodeEnd(preNode);
				}else{
					console.log('是 conatiner 内部的第一个叶子节点, 坐标定位到 text 头部');
					rangeApi.setCollapsedRange(node, 0);
				}
				node.deleteData(0, 1);
			}
		}else{
			console.log('正常删除一个字符');
			rangeApi.setCollapsedRange(node, offset - 1);
			node.deleteData(offset - 1, 1);
		}
	}else if( node.nodeType === Node.ELEMENT_NODE ){
		console.log('为 ELEMENT_NODE');
		let element ;
		if( offset === 0 ){
			if( node.childNodes[0] ){
				element = nodeApi.getPreLeafNodeInContainer(node.childNodes[0])
			}
		}else{
			element = node.childNodes[ offset - 1 ];
		}

		if( element ){
			console.log('element 存在');
			if( element.nodeType === Node.TEXT_NODE ){
				console.log('element 是 text');
				rangeApi.setCollapsedRange(element, element.length - 1);
				element.deleteData(element.length - 1, 1);
			}else if( element.nodeType === Node.ELEMENT_NODE ){
				console.log('element 是 元素');
				deleteLeafNodeInContainer.call(this, element);
			}
		}else{
			console.log('element 不存在, 是 container 内的第一个节点');
			this.executeEditorEvent(block, this.eventType.deleteForwardOnStart, [node, offset]);
		}

	}else{
		throw new Error('deleteForward node 类型未知');
	}
}

export function deleteLeafNodeInContainer(node){
	console.log('%cdeleteLeafNodeInContainer 删除元素', 'color: #000000; background-color: #ffffff');
	console.log('node:', node);
	let 
			{ rangeApi, nodeApi } = this,
			singleNode = nodeApi.getSingleNodeInContainer(node),
			parentNode = singleNode.parentNode,
			preNode = nodeApi.getPreNodeInContainer(singleNode),
			nextNode = nodeApi.getNextNodeInContainer(singleNode);

	if( preNode ){//	前面有节点
		console.log('前面有节点');
		let previousSibling = singleNode.previousSibling,
				nextSibling = singleNode.nextSibling;
		rangeApi.setRangeOfNodeEnd(preNode);
		nodeApi.removeNode(singleNode);//	删除独立节点
		if( previousSibling && nextSibling ){
			nodeApi.mergeTwoNodes(previousSibling, nextSibling);
		}
	}else{//	前面没有节点
		console.log('前面没有节点');
		if( nextNode ){//	后面有节点
			console.log('后面有节点');
			rangeApi.setRangeOfNodeStart(nextNode);
			nodeApi.removeNode(singleNode);//删除text关联节点
		}else{//	后面没有节点
			console.log('后面没有节点');
			if( nodeApi.isContainer(parentNode) ){
				rangeApi.setCollapsedRange(parentNode, 0);
				nodeApi.removeNode(singleNode);
			}else{
				throw new Error('特殊情况,按照常理,前后都没有的话, parentNode 应该是 container,不会打印此信息');
			}
		}
	}
}
