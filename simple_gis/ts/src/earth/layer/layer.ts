import {
	Texture
} from '../../../libs/three.module';
import Tile from '../tile/tile';
import Provider from './provider/provider';
import developerError from '../../core/developer_error';

export default class Layer{
	
	private providers: Array<Provider> = [];

	private waitMap: Map<string, Tile> = new Map();
	private waitMapIterator: any = this.waitMap.values();
	private loadedMap: Map<string, Tile> = new Map();
	private loadErrorMap: Map<string, Tile> = new Map();

	private isRun: boolean = false;

	private loadingTile: Tile | null = null;
	private loadingProviderIndex: number;

	public addProvider(provider: Provider): Layer{
		this.providers.push(provider);
		return this;
	}

	public setProvider(provider: Provider): Layer{
		if( this.providers.length === 0 ){
			this.providers.push(provider);
		}else{
			this.providers = [provider];
		}
		return this;
	}

	public getProvidersLength(): number{
		return this.providers.length;
	}

	public cancelLoadTileMap(tile){
		if( this.waitMap.has(tile.order) ){
			this.waitMap.delete(tile.order);
		}
		if( this.loadingTile === tile ){
			console.warn('取消正在加载的瓦片:', tile);
			this.requestTileMap();
		}
	}

	public loadTileMap(tile: Tile): Layer{
		if( this.providers.length > 0 ){
			if( !this.isLoading( tile ) && !this.isLoaded( tile ) ){
				this.waitMap.set(tile.order, tile);
			}

			if( !this.isRun ){
				this.requestTileMap();
				this.isRun = true;
			}
		}else{
			developerError('没有添加地图图层');
		}
		return this;
	}

	private requestTileMap(): Layer{

		this.loadingTile = this.waitMapIterator.next().value;
		if( this.loadingTile ){
			this.waitMap.delete(this.loadingTile.order);
			this.loadingProviderIndex = 0;

			this.requestTileImage();
		}
		return this;
	}

	private requestTileImage(): Layer{
		let 
			provider = this.providers[this.loadingProviderIndex],
			tile = this.loadingTile;

		if( tile.hasProviderImage(provider) ){
			this.requestNextTileImage();
		}else{
			let
				url = provider.getUrl(tile.column, tile.row, tile.level),
				img = new Image();

			img.crossOrigin = "anonymous";
			img.src = url;

			img.onload = () => {
				tile.saveImage(provider, img);
				if( this.loadingTile === tile ){
					this.requestNextTileImage();
				}
			}
			img.onerror = () => {
				console.error(`'图片加载失败,瓦片序列 ${tile.column} ${tile.row} ${tile.level}`);
				// 加载下一张图片
				if( this.loadingTile === tile ){
					this.requestTileMap();
				}
			}
		}
		return this;
	}

	private requestNextTileImage(): Layer{
		if( this.loadingProviderIndex === this.providers.length - 1 ){// 瓦片图片加载完
			this.tileLoaded( this.loadingTile );
			if( this.waitMap.size === 0 ){// 全部图片加载完成
				// console.log('全部图片加载完成');
				this.loadingTile = null;
				this.isRun = false;
			}else{// 加载下一张图片
				this.requestTileMap();
			}
		}else{
			this.loadingProviderIndex ++;
			this.requestTileImage();
		}
		return this;
	}

	private isLoading(tile: Tile): boolean{
		return this.loadingTile === tile;
	}

	private isLoaded(tile: Tile): boolean{
		return this.loadedMap.has(tile.order);
	}

	private isLoadError(tile: Tile): boolean{
		return this.loadErrorMap.has(tile.order);
	}

	private tileLoaded(tile: Tile){
		this.loadedMap.set(tile.order, tile);
		tile.render();
	}

	private tileLoadError(tile: Tile){
		this.loadErrorMap.set(tile.order, tile);
		tile.render();
	}
}



