import CanvasBase from './canvas_base.js';
import * as Shapes from './shapes/shapes.js';
import { MouseDown, MouseMove, MouseUp, Wheel } from './events.js';

// 图像绘制及事件

export default class CanvasDraw extends CanvasBase{
	constructor(dom){
		super();

		this.drawShapeType = void 0;
		this.editingShape = null;
		this.editingPoint = null;

		this.startX = 0;
		this.startY = 0;
		this.isMoving = false

		this.mouseDown = MouseDown.bind(this);
		this.mouseMove = MouseMove.bind(this);
		this.mouseUp = MouseUp.bind(this);
		this.wheel = Wheel.bind(this);
	}

	mountDom(canvasDom){
		this.canvasDom = canvasDom; 
		this.ctx = canvasDom.getContext('2d');

		canvasDom.addEventListener('mousedown', this.mouseDown);
		canvasDom.addEventListener('mousemove', this.mouseMove);
		canvasDom.addEventListener('mouseup', this.mouseUp);
		canvasDom.addEventListener('wheel', this.wheel);

		return this;
	}
	destroy(){
		canvasDom.removeEventListener('mousedown', this.mouseDown);
		canvasDom.removeEventListener('mousemove', this.mouseMove);
		canvasDom.removeEventListener('mouseup', this.mouseUp);
		canvasDom.removeEventListener('wheel', this.wheel);
	}

	addShape(shapeData){
		this.shapesData.push(shapeData);
		this.draw();
		return this;
	}

	addImage(url, x, y, w, h){
		let imageShape = new Shapes.ImageShape();
		imageShape.load(url)
			.then(()=>{
				imageShape.setRect(x, y, w, h);
				this.addShape(imageShape);
			})
	}

	addFillImage(url){
		this.addImage(url, this.dX, this.dY, this.width, this.height);
	}

	addContainImage(url){
		let imageShape = new Shapes.ImageShape();
		imageShape.load(url)
			.then((image)=>{
				let
					canvasRatio = this.width / this.height,
					imageRatio = 	image.naturalWidth / image.naturalHeight,

					w, h;

				if( canvasRatio > imageRatio ){
					w = this.height * imageRatio;
					h = this.height;
				}else{
					w = this.width;
					h = this.width / imageRatio;
				}
				
				imageShape.setRect(this.dX, this.dY, w, h);
				this.addShape(imageShape);
			});
	}

	clear(){
		this.ctx.clearRect(0, 0, this.canvasDom.width, this.canvasDom.height);

		return this;
	}

	drawShapes(){
		this.shapesData.forEach((shapeData)=>{
			shapeData.draw(this);
		});
		return this;
	}

	draw(){
		this.clear();
		this.drawShapes();
	}
}