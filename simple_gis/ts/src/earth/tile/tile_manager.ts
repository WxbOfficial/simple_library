import Tile from './tile';
import tileManagerOptions from '../types/tile_manager_options';

export default class TileManager{
	public rootTiles: Array<Tile>;
	private baseTiles: Array<Tile> = [];

	private showedTiles: Map<string, Tile> = new Map();

	constructor(options: tileManagerOptions){
		this.rootTiles = options.terrain.getRootTiles(options.layer);
	}

	public traverse(callback: Function){
		this.rootTiles.forEach((tile)=>{
			tile.traverse(callback);
		});
	}

	public setBaseTiles(minLevel){
		for( let i = this.baseTiles.length - 1; i >=0; i-- ){
			this.hideTile( this.baseTiles[i] );
			this.baseTiles.pop();
		}

		this.traverse((tile: Tile)=>{
			if( tile.level <= minLevel ){
				if( tile.level === minLevel ){
					// this.showTile(tile);
					tile.show();
					this.baseTiles.push(tile);
				}
				return true;
			}
			return false;
		});
	}

	private isShow(tile: Tile): boolean{
		return this.showedTiles.has(tile.order);
	}

	public clear(){
		this.showedTiles.forEach((tile, key, map)=>{
			tile.hide();
		});
		this.showedTiles.clear();
	}

	public showTile(tile: Tile){
		if( !this.isShow(tile) ){
			tile.show();
			this.showedTiles.set(tile.order, tile);
		}
	}

	public hideTile(tile: Tile){
		if( this.isShow(tile) ){
			tile.hide();
			this.showedTiles.delete(tile.order);
		}
	}

}