

export default class Loader{
	constructor(manager){
		this.manager = manager;

		this.loadingTile = null;
		this.loadingProviderIndex ;
		
		this.waitLoadingTile = new Map();
		this.nowTiles = null;

		this.nowBaseTiles = new Map();
		this.logicBaseTiles = new Map();
		this.waitLaodBaseTiles = [];

		this.nowCameraTiles = new Map();
		this.logicCameraTiles = new Map();
		this.waitLaodCameraTiles = [];

		this.loadedErrorTile = new Map();
	}

	setLoadBaseTile(tiles){
		this.logicBaseTiles.clear();
		this.waitLaodBaseTiles = [];
		tiles.forEach((tile)=>{
			if( !this.nowBaseTiles.has(tile) && !this.waitLoadingTile.has(tile) ){
				this.waitLaodBaseTiles.push(tile);
			}
			this.logicBaseTiles.set(tile, true)
		})
		this.startLoad();
	}

	setLogicCameraTiles(tiles){

		this.logicCameraTiles.clear();
		this.waitLaodCameraTiles = [];
		tiles.forEach((tile)=>{
			if( !this.nowCameraTiles.has(tile) && !this.waitLoadingTile.has(tile)){
				this.waitLaodCameraTiles.push(tile);
			}
			this.logicCameraTiles.set(tile, true)
		})
		this.startLoad();
	}

	startLoad(){
		// console.log('startLoad');
		if( this.manager.providers.length > 0 ){
			if( this.loadingTile === null ){
				this.loadNextTile();
			}
		}else{
			developerError('没有添加地图图层');
		}
	}

	getNextLoadTile(){
		if( this.waitLaodCameraTiles.length > 0 ){
			this.nowTiles = this.nowCameraTiles;
			return this.waitLaodCameraTiles.pop();
		}else {
			if( this.waitLaodBaseTiles.length > 0 ){
				this.nowTiles = this.nowBaseTiles;
				return this.waitLaodBaseTiles.pop();
			}
		}
		return null;
	}

	loadNextTile(){
		this.loadingTile = this.getNextLoadTile();

		if( this.loadingTile ){
			// console.log('开始加载瓦片:', this.loadingTile.order);
			this.loadingProviderIndex = 0;
			this.requestNextImage();
		}else{// 全部瓦片加载完成
			// console.log('全部瓦片加载完成');
			this.nowCameraTiles.forEach((value, tile)=>{
				if(!this.logicCameraTiles.has(tile)){
					tile.hide();
					this.nowCameraTiles.delete(tile);
				}
			})

		}
	}

	requestNextImage(){
		// console.log('requestNextImage');
		let 
			provider = this.manager.providers[this.loadingProviderIndex],
			tile = this.loadingTile,
			url = provider.getUrl(tile.column, tile.row, tile.level);


		if( tile.hasProviderImage(provider) ){// 已经加载过这张图片了
			// console.log('已经加载过这张图片了');
			if( this.loadingProviderIndex === this.manager.providers.length - 1 ){// 瓦片全部图片加载完
				// console.log('瓦片全部图片加载完');

				this.loadingTile.show();
				this.waitLoadingTile.delete(this.loadingTile);
				this.nowTiles.set(this.loadingTile, true);

				this.loadingTile = null;

				this.loadNextTile();
			}else{// 加载下一张图片
				// console.log('加载下一张图片');

				this.loadingProviderIndex ++;
				this.requestNextImage();
			}
		}else{// 加载图片
			// console.log('加载图片');
			// this.layerLoader.loadImage(url);
			let img = new Image();
			img.crossOrigin = "anonymous";
			img.src = url;

			img.onload = () => {
				this.loadingTile.saveImage(provider, img);
				this.requestNextImage();
			}
			img.onerror = () => {
				this.requestNextImage();

			}
		}

	}

}