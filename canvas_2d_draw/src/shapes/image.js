

export class ImageShape{
	constructor(){
		this.image = new Image();
	}

	setRect(x, y, w, h){
		this.x = x;
		this.y = y;
		this.width = w;
		this.height = h;

		return this;
	}

	fillCanvas(canvasDraw){
		
	}

	containCanvas(canvasDraw){
		
	}

	load(url){
		return new Promise((resolve, reject)=>{

			this.image.src = url;

			this.image.onload = ()=>{
				resolve(this.image)
			};
			this.image.onerror = (e)=>{
				reject(e)
			};
		})
	}

	draw(canvasDraw){
		const
			{ ctx, dX, dY, scalelRatio } = canvasDraw,
			[ showX, showY ] = canvasDraw.getShowCoord(this.x, this.y);

		ctx.drawImage(this.image,
			showX, showY,
			this.width * scalelRatio,
			this.height * scalelRatio
		);

	}
}