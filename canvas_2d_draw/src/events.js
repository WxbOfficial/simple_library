import * as Shapes from './shapes/shapes.js';

export function MouseDown(e){
	let
		showX = e.offsetX * this.pixelRatio,
		showY = e.offsetY * this.pixelRatio,

		[dataX, dataY] = this.getDataCoord(showX, showY);


	this.editingShape = new Shapes.RectShape(dataX, dataY);
	this.addShape( this.editingShape );

	// this.startX = showX;
	// this.startY = showY;
	// this.isMoving = true;

	this.draw();
}

export function MouseMove(e){
	let
		showX = e.offsetX * this.pixelRatio,
		showY = e.offsetY * this.pixelRatio,
		
		[dataX, dataY] = this.getDataCoord(showX, showY);

	if( this.editingShape ){
		let
			showX = e.offsetX * this.pixelRatio,
			showY = e.offsetY * this.pixelRatio,
			
			[dataX, dataY] = this.getDataCoord(showX, showY);

		this.editingShape.move(dataX, dataY);

		this.draw();
	}

	// if( this.isMoving ){

	// 	this.dX += showX - this.startX;
	// 	this.dY += showY - this.startY;

	// 	this.startX = showX;
	// 	this.startY = showY;

	// 	this.draw();
	// }
}

export function MouseUp(e){

	this.editingShape = null;

	this.isMoving = false;
}

export function Wheel(e){
	e.preventDefault();

	let
		x = e.offsetX * this.pixelRatio,
		y = e.offsetY * this.pixelRatio;

	this.scale(x, y, e.deltaY > 0 ? this.scalelRange : 1 / this.scalelRange);
}