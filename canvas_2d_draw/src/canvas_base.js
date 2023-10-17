// 画板画布数据操作

export default class CanvasBase{

	constructor(){
		this.canvasDom = null; 
		this.ctx = null;

		// 画布矩形
		this.dX = 0;
		this.dY = 0;
		this.scalelRatio = 1;			// 缩放比例

		this.scalelRange = 0.95;

		this.width = 0;
		this.height = 0;

		this.pixelRatio = 2;			// 可以看做精度，画布 = this.pixelRatio * 画板

		this.shapesData = [];
	}

	setSize(w, h){
		w = Math.floor(w);
		h = Math.floor(h);

		this.canvasDom.style.width = `${w}px`;
		this.canvasDom.style.height = `${h}px`;

		this.width = this.canvasDom.width = w * this.pixelRatio;
		this.height = this.canvasDom.height = h * this.pixelRatio;

		this.draw();

		return this;
	}

	fill(){
		this.dX = this.dY = 0;
		this.scalelRatio = 1;

		let parentNodeRect = this.canvasDom.parentNode.getBoundingClientRect();
		this.setSize(parentNodeRect.width, parentNodeRect.height);

		return this;
	}

	scale(pixelX, pixelY, scale){
		this.dX += ( pixelX - this.dX ) * ( 1 - scale );
		this.dY += ( pixelY - this.dY ) * ( 1 - scale );
		this.scalelRatio *= scale;

		this.draw();
	}
	
	getShowCoord(dataX, dataY){
		return [
			dataX * this.scalelRatio + this.dX,
			dataY * this.scalelRatio + this.dY,
		]
	}

	getDataCoord(showX, showY){
		return [
			(showX - this.dX) / this.scalelRatio,
			(showY - this.dY) / this.scalelRatio,
		]
	}
}