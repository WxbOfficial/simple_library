

export default function enter(node, offset){
	console.log('%c执行 enter', 'color: #000000; background-color: #ffffff');
	console.log('node:', node, '\noffset:', offset);

	let
		{ rangeApi, nodeApi } = this,
		container = nodeApi.getContainer(node),
		splitedNode = nodeApi.splitFromNodeOffsetStillTop(node, offset, container);

	console.log('splitedNode:', splitedNode);
	if( splitedNode ){
		nodeApi.insertAfter( splitedNode, container );
		if( splitedNode.childNodes.length ){
			rangeApi.setRangeOfNodeStart(splitedNode);
		}else{
			rangeApi.setCollapsedRange(splitedNode, 0);
		}
	}else{
		let newContainer = container.cloneNode(false);
		nodeApi.insertAfter( newContainer, container );
		rangeApi.setCollapsedRange(newContainer, 0);
	}
}