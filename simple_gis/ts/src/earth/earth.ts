import {
	Scene,
	Matrix4,
	Vector2,
	Vector3,
	Group,
	Frustum
} from '../../libs/three.module';

import { isEmpty, isNumber, isInstance } from '../core/check_value';
import developerError from '../core/developer_error';

import Terrain from './terrain/terrain';
import Layer from './layer/layer';
import Tile from './tile/tile';
import TileManager from './tile/tile_manager';
import earthOptions, { createDefaultEarthOption } from './types/earth_options';
import Provider from './layer/provider/provider';
import Cartograph from './coordinates/cartograph';
import Camera from '../core/camera';


export default class Earth{

	private minLevel: number;
	private maxLevel: number;

	private canvas: HTMLCanvasElement;
	private scene: Scene;

	private terrain: Terrain;

	private tileManager: TileManager;;

	public layer: Layer = new Layer();

	private sseThreshold: number = 5;

	constructor( options: earthOptions ){
		let defaultEarthOption = createDefaultEarthOption();

		if( isEmpty(options) ){
			options = defaultEarthOption;
		}

		if( isInstance(options.terrain, Terrain) ){
			this.terrain = options.terrain;
		}else{
			this.terrain = defaultEarthOption.terrain;
		}

		if( isInstance(options.provider, Provider) ){
			this.layer.setProvider(options.provider);
		}else{
			this.layer.setProvider(defaultEarthOption.provider);
		}

		if( isInstance(options.origin, Cartograph) ){
			this.setOrigin( options.origin );
		}else{
			this.setOrigin( defaultEarthOption.origin );
		}

		if( isNumber(options.minLevel) ){
			this.minLevel = options.minLevel;
		}else{
			this.minLevel = defaultEarthOption.minLevel;
		}

		if( isNumber(options.maxLevel) ){
			this.maxLevel = options.maxLevel;
		}else{
			this.maxLevel = defaultEarthOption.maxLevel;
		}

		if( this.maxLevel < this.minLevel ){
			developerError('瓦片最低层级比最高层级大');
		}

		this.tileManager = new TileManager({
			terrain: this.terrain,
			layer: this.layer,
		});
		this.tileManager.setBaseTiles(this.minLevel);
	}

	public getTerrain(): Terrain{
		return this.terrain;
	}

	public mount(canvas: HTMLCanvasElement,scene: Scene): Earth{
		this.canvas = canvas;
		this.scene = scene;
		scene.add(this.terrain.tileGroup);
		return this;
	}

	public setMinLevel(minLevel: number): Earth{
		this.minLevel = minLevel;
		this.tileManager.setBaseTiles(minLevel);
		return this;
	}

	public getScene(): Scene{
		return this.scene;
	}

	public setOrigin(cartograph: Cartograph): Earth{
		this.terrain.setOrigin(cartograph);
		return this;
	}

	public getCenter(): Vector3{
		return this.terrain.center;
	}

	public getIntersection(event: any, camera: Camera): Vector3{
		let
			mouse = new Vector2(
				( event.offsetX / this.canvas.offsetWidth ) * 2 - 1,
					- ( event.offsetY / this.canvas.offsetHeight ) * 2 + 1
			),
			ray = camera.getMouseRay(mouse);

		return this.terrain.getEllipseIntersection(ray.origin, ray.direction);
	}

	public update(camera: Camera): Earth{
		// let cameraClone = camera.clone()
		// cameraClone.applyMatrix4(this.terrain.matrixInv);
		// cameraClone.updateWorldMatrix();

		// let show = []

		// this.tileManager.traverse((tile)=>{

		// 	tile.subVisible = 0;

		// 	if( tile.level <= this.minLevel ){
		// 		return true;
		// 	}else if( tile.level > this.maxLevel ){
		// 		show.push(tile);
		// 		return false;
		// 	}else if( this.tileIsVision(cameraClone, tile) ){
		// 		if( this.subIsVision(cameraClone, tile) ){
		// 			return true
		// 		}else{
		// 			show.push(tile);
		// 		}

		// 	}

		// 	return false;
		// });

		// this.tileManager.clear();
		

		// show.forEach((tile)=>{
		// 	this.tileManager.showTile(tile);
		// })


		// let
		// 	stack = [...this.tileManager.rootTiles],
		// 	tile;

		// // this.tileManager.clear();

		// while( tile = stack.pop() ){
		// 	if( this.tileIsVision(cameraClone, tile) ){

		// 		if( tile.level > this.minLevel ){
		// 			this.tileManager.showTile(tile);
		// 		}

		// 		if( this.subIsVision(cameraClone, tile) &&
		// 			 tile.level <= this.maxLevel
		// 			){
		// 			tile.getChildren().forEach((child)=>{
		// 				stack.push(child);
		// 			});
		// 		}
		// 	}
		// }

		return this;
	}

	private subIsVision(camera: Camera, tile: Tile): boolean{
	  let
	  	cV = camera.position.clone().divide(this.terrain.ellipse),
	  	vhMagnitudeSquared = cV.lengthSq() - 1.0,
	  	canvasSize = new Vector2( this.canvas.offsetWidth, this.canvas.offsetHeight ),
	  	hypotenuse = canvasSize.length(),
	  	radAngle = camera.fov * Math.PI / 180,
	  	HYFOV = 2.0 * Math.atan(Math.tan(radAngle * 0.5) * hypotenuse / canvasSize.x),
	  	preSSE = hypotenuse * (2.0 * Math.tan(HYFOV * 0.5)),

			boundingSphere = tile.mesh.geometry.boundingSphere,
			center = tile.center,

	  	distance = Math.max(
	        0.0,
	        camera.position.clone().distanceTo(center) - 
	        boundingSphere.radius);

	  return this.sseThreshold < preSSE * (tile.geometricError / distance);
	}

	private tileIsVision(camera: Camera, tile: Tile): boolean{
		let
			_frustum = new Frustum(),
			_matrix = new Matrix4(),

			boundingSphere = tile.mesh.geometry.boundingSphere.clone();

		_frustum.setFromProjectionMatrix(
			_matrix.multiplyMatrices( 
				camera.projectionMatrix, 
				camera.matrixWorldInverse
			)
		);

		if( _frustum.intersectsSphere(boundingSphere) ){
			
			// return true;

			let normals = tile.gridCenters;

			for( let i = 0, len = normals.length; i < len; i++ ){

				let
					n = normals[i],
					v = camera.position.clone().applyMatrix4(this.terrain.matrixInv).sub( n ),
					angle = v.angleTo( n );
				
				if( angle <= Math.PI / 2 ){
					return true;
				}
			}
		}

		return false;
	}

}