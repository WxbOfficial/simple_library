

export class RectShape{
	constructor(dataX, dataY){
		this.type = 'rect';

		this.x = dataX;
		this.y = dataY;

		this.w = 0;
		this.h = 0;
	}

	move(dataX, dataY){

		this.w = dataX - this.x;
		this.h = dataY - this.y;
	}

	draw(canvasDraw){
		let
			{ ctx, dX, dY, scalelRatio } = canvasDraw,
			[ showX, showY ] = canvasDraw.getShowCoord(this.x, this.y);

		ctx.beginPath();
		
		// 设置描边的颜色
		// 测试文字

		// ctx.fillStyle = "Black";
		// ctx.font="36px Georgia";
		// ctx.fillText('测试标题数据', showX, (showY - 6) );

		ctx.strokeStyle = "red";
		ctx.lineWidth = 4;

		ctx.rect(
			showX, showY,
			this.w * scalelRatio,
			this.h * scalelRatio
		);

		ctx.stroke();
	}
}