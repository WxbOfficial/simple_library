import {
	Mesh,
	Texture,
} from '../../libs/three.module.js';
import tileGeometry from './tile_geometry.js';
import Layer from '../layer/layer.js';

export default class Tile{
	constructor(column, row, level, terrain, manager, parent){

		this.column = column;
		this.row = row;
		this.level = level;
		this.order = `${column}-${row}-${level}`;

		this.terrain = terrain;
		this.manager = manager;

		this.parent = parent;
		this.children = [];

		this.isShow = false;
		this.isRender = false;

		// 初始化瓦片模型
		this.mesh;
		this.layer = new Layer();
		this.textures = new Map();

		let
			geometryParams = this.terrain.computeGeometry(this.column, this.row, this.level),
			geometry = new tileGeometry(geometryParams);

		geometry.computeBoundingSphere();

		this.mesh = new Mesh(geometry, this.layer.material );
		this.mesh.name = `${this.order}-tile`;
		this.mesh.renderOrder = -1;

		this.gridCenters = geometryParams.gridCenters;
		this.center = geometryParams.center;
		this.geometricError = geometry.boundingSphere.radius / 256;

		this.updateLayer();
	}

	getChildren(){
		if( this.children.length === 0){
			this.children.push(
				new Tile(
					this.column << 1,
					this.row << 1,
					this.level + 1,
					this.terrain,
					this.manager,
					this
				),
				new Tile(
					this.column << 1 | 1,
					this.row << 1,
					this.level + 1,
					this.terrain,
					this.manager,
					this
				),
				new Tile(
					this.column << 1,
					this.row << 1 | 1,
					this.level + 1,
					this.terrain,
					this.manager,
					this
				),
				new Tile(
					this.column << 1 | 1,
					this.row << 1 | 1,
					this.level + 1,
					this.terrain,
					this.manager,
					this
				)
			);
		}

		return this.children;
	}

	traverse(judge){
		if( judge(this) ){
			this.getChildren().forEach((child)=>{
				child.traverse(judge);
			});
		}
		return this;
	}

	getSphere(){
		return this.mesh.geometry.boundingSphere;
	}

	updateLayer(){
		this.isRender = false;
		this.layer.updateMaterial(this.manager);
	}

	hasProviderImage(provider){
		return this.textures.has(provider);
	}

	saveImage(provider, image){
		let	texture = new Texture();
		texture.image = image;
		texture.needsUpdate = true;
		this.textures.set(provider, texture);
	}

	show(){
		if( !this.isRender ){
			this.layer.render(this.textures);
			this.isRender = true;
		}
		this.terrain.tileGroup.add(this.mesh);
		this.isShow = true;
	}

	hide(){
		this.terrain.tileGroup.remove(this.mesh);
		this.isShow = false;
	}



}