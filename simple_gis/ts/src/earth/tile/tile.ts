import { isInstance, isNumber } from '../../core/check_value';
import Terrain from '../terrain/terrain';
import Layer from '../layer/layer';
import Provider from '../layer/provider/provider';
import tileParams from '../types/tile_params';
import tileGeometry from './tile_geometry';
import LayerMaterial from '../layer/layer_material'
import {
	Mesh,
	Texture,
	Vector3
	// MeshBasicMaterial,
	// RawShaderMaterial
} from '../../../libs/three.module';

export default class Tile{
	public column: number;
	public row: number;
	public level: number;
	public order: string;

	private textures: Map<Provider, Texture> = new Map();
	private parent: Tile | undefined ;
	private terrain: Terrain;
	private layer: Layer;
	private children: Array<Tile> = [];

	public mesh: Mesh;
	public subVisible: number;
	private layerMaterial: LayerMaterial;

	public center: Vector3;
	public gridCenters: Array<Vector3>;
	public centerSphere: Vector3;
	public geometricError: number;

	constructor(tileParams: tileParams){

		if( isNumber(tileParams.column) ){
			this.column = tileParams.column;
		}

		if( isNumber(tileParams.row) ){
			this.row = tileParams.row;
		}

		if( isNumber(tileParams.level) ){
			this.level = tileParams.level;
		}

		this.order = `${this.column}-${this.row}-${this.level}`

		if( isInstance(tileParams.parent, Tile) ){
			this.parent = tileParams.parent;
		}

		if( isInstance(tileParams.terrain, Terrain) ){
			this.terrain = tileParams.terrain;
		}

		if( isInstance(tileParams.layer, Layer) ){
			this.layer = tileParams.layer;
			this.layerMaterial = new LayerMaterial( this.layer.getProvidersLength() );

		}

		this.createMesh();
	}
	
	public getChildren(): Array<Tile>{

		if( this.children.length === 0){
			this.children.push(
				new Tile({
					column: this.column << 1,
					row: this.row << 1,
					level: this.level + 1,
					parent: this,
					terrain: this.terrain,
					layer: this.layer
				}),
				new Tile({
					column: this.column << 1 | 1,
					row: this.row << 1,
					level: this.level + 1,
					parent: this,
					terrain: this.terrain,
					layer: this.layer
				}),
				new Tile({
					column: this.column << 1,
					row: this.row << 1 | 1,
					level: this.level + 1,
					parent: this,
					terrain: this.terrain,
					layer: this.layer
				}),
				new Tile({
					column: this.column << 1 | 1,
					row: this.row << 1 | 1,
					level: this.level + 1,
					parent: this,
					terrain: this.terrain,
					layer: this.layer
				})
			);
		}

		return this.children;
	}
		
	public getParent(): Tile | undefined{
		return this.parent;
	}

	public traverse(judge: Function): Tile{
		if( judge(this) ){
			this.getChildren().forEach((child)=>{
				child.traverse(judge);
			});
		}
		return this;
	}

	private createMesh(): Tile{
		let
			geometryParams = this.terrain.computeGeometry(this.column, this.row, this.level),
			geometry = new tileGeometry(geometryParams);

		// this.layerMaterial = new LayerMaterial( this.layer.getProvidersLength() );

		this.mesh = new Mesh(geometry, this.layerMaterial.material );
		this.mesh.name = `${this.order}-tile`;

		this.center = geometryParams.center;
		this.gridCenters = geometryParams.gridCenters;
		this.centerSphere = this.mesh.geometry.boundingSphere.center;
		this.geometricError = this.mesh.geometry.boundingSphere.radius / 256;

		return this;
	}

	public hasProviderImage(provider: Provider){
		return this.textures.has(provider);
	}

	public show(): Tile{
		this.terrain.tileGroup.add(this.mesh);
		this.load();
		return this;
	}

	public hide(): Tile{
		this.terrain.tileGroup.remove(this.mesh);
		return this;
	}

	public load(): Tile{
		this.layer.loadTileMap(this);
		return this;
	}

	public cancelLoad(): Tile{
		this.layer.cancelLoadTileMap(this);
		return this;
	}

	public saveImage(provider: Provider, img: HTMLImageElement): Tile{
		let	texture = new Texture();
		texture.image = img;
		texture.needsUpdate = true;
		this.textures.set(provider, texture);

		return this;
	}

	public render(): Tile{
		this.layerMaterial.setTextures(this.textures);
		return this;
	}
}