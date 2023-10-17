import Loader from './loader.js';
import getCameraTiles from './get_camera_tiles.js';


export default class Manager{
	constructor(terrain){
		
		this.providers = [];

		this.terrain = terrain;

		this.rootTiles = terrain.getRootTiles(this);
		this.allTiles = new Map();


		this.loader = new Loader(this)
	}

	setProvider(provider){
		if( this.providers.length === 0 ){
			this.providers.push(provider);
		}else{
			this.providers = [provider];
		}
	}

	isBase(tile){
		return this.baseTiles.has(tile);
	}

	isShow(tile){
		return this.preShowTiles.has(tile);
	}

	traverseTiles(callback){
		this.rootTiles.forEach((rootTile)=>{
			rootTile.traverse(callback);
		});
	}

	setBaseTiles(minLevel){
		let baseTiles = [];
		this.traverseTiles((tile)=>{
			if( tile.level < minLevel ){
				return true;
			}else if( tile.level === minLevel ){
				baseTiles.push(tile);
			}
			return false;
		});
		this.loader.setLoadBaseTile(baseTiles);
	}

	setCameraTile(minLevel, maxLevel, canvas, camera, sseThreshold){
		let cameraTiles = getCameraTiles(	minLevel, maxLevel, this.rootTiles, this.terrain.ellipse, canvas, camera, sseThreshold);
		this.loader.setLogicCameraTiles(cameraTiles);
	}

}