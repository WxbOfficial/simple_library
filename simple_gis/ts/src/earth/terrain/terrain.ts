import {
	Vector3,
	Group,
	Matrix4
} from '../../../libs/three.module';

import Cartograph from '../coordinates/cartograph';
import Tile from '../tile/tile';
import geometryParams from '../types/geometry_params'
import Layer from '../layer/layer';

export default abstract class Terrain{
	// 赤道长轴
	public equatorial: number;
	// 两极短轴
	public polar: number;

	public ellipse: Vector3 = new Vector3();

	public center: Vector3;

	public tileGroup: any;// 对 ts 的妥协

	public matrix: Matrix4 = new Matrix4();
	public matrixInv: Matrix4 = new Matrix4();

	constructor(equatorial: number, polar: number){
		this.ellipse.x = this.ellipse.y = this.equatorial = equatorial;
		this.ellipse.z = this.polar = polar;


		this.center = new Vector3();

		this.tileGroup = new Group;
		this.tileGroup.name = 'earth';
	}

	// 经纬度转化为笛卡尔坐标
	public abstract project(cartograph: Cartograph): Vector3;

	// 笛卡尔坐标转化为经纬度
	public abstract unproject(cartesian: Vector3): Cartograph;

	public abstract getRootTiles(layer: Layer): Array<Tile>;

	public abstract computeGeometry( column: number, row: number, level: number): geometryParams;


	public setOrigin(cartograph: Cartograph): Terrain{
		let
			cartesian = this.project(cartograph),
			up = new Vector3(
				cartesian.x / this.equatorial,
				cartesian.y / this.equatorial,
				cartesian.z / this.polar
			).normalize(),
			east = new Vector3( -cartesian.y, cartesian.x, 0 ).normalize(),
			north = new Vector3().crossVectors(up, east);

		this.matrix.set(
			east.x, north.x, up.x, cartesian.x,
			east.y, north.y, up.y, cartesian.y,
			east.z, north.z, up.z, cartesian.z,
			0, 0, 0, 1,
		).invert();

		this.matrix.decompose(
			this.tileGroup.position,
			this.tileGroup.quaternion,
			this.tileGroup.scale
		);

		this.matrixInv.copy(this.matrix).invert();

		this.center.set(0,0,0).applyMatrix4(this.matrix);

		return this;
	}

	public getEllipseIntersection(origin: Vector3, direction: Vector3): Vector3 | null{
		origin = origin.clone().applyMatrix4(this.matrixInv);
		direction = direction.clone().transformDirection(this.matrixInv);

		origin.x /= this.equatorial;
		origin.y /= this.equatorial;
		origin.z /= this.polar;

		direction.x /= this.equatorial;
		direction.y /= this.equatorial;
		direction.z /= this.polar;
		direction = direction.normalize();

		let
			ao = new Vector3(0, 0, 0).sub(origin),
			angle = ao.angleTo(direction),
			lao = ao.length(),
			len = lao * Math.sin(angle);


		if( len > 1 ){
			// console.log('无交点');
			return null;
		}else{
			let p;

			if( len < 1 ){
				let
					len1 = lao * Math.cos(angle),
					len2 = Math.sqrt( 1 - len * len );

				lao < 1 ? len = len1 + len2 : len = len1 - len2;
			}else{
				len = Math.sqrt( lao * lao - 1 );
			}

			p = new Vector3().copy(origin).add( direction.multiplyScalar(len) );
			p.x *= this.equatorial;
			p.y *= this.equatorial;
			p.z *= this.polar;

			p.applyMatrix4(this.matrix);

			return p;
		}

	}

	// 获得经纬度坐标
	public getCartograph(cartesian: Vector3): Cartograph{
		return this.unproject( cartesian.clone().applyMatrix4( this.matrixInv ) );
	}

	// 获得笛卡尔坐标
	public getCartesian(cartograph: Cartograph): Vector3{
		return this.project(cartograph).applyMatrix4( this.matrix );
	}

}