import {
	Vector3,
	Group,
	Matrix4
} from '../../libs/three.module.js';

export const TerrainType = Object.freeze({
	WebMercatorTerrain: 'WebMercatorTerrain',
});

export default class Terrain{

	constructor(equatorial, polar){
		this.equatorial = equatorial;
		this.polar = polar;

		this.ellipse = new Vector3( equatorial, equatorial, polar );

		this.tileGroup = new Group();
		this.tileGroup.name = 'earth';

		this.center = new Vector3();

		this.matrix = new Matrix4();
		this.matrixInv = new Matrix4();
	}

	// 获取设点与球体的交点
	getEllipseIntersection(origin, direction){
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

	// 设置中心点
	setOrigin(cartograph){
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

	// 子类实现
	// 经纬度转化为大地坐标系下的笛卡尔坐标
	project(cartograph){};

	// 大地坐标系下的笛卡尔坐标转化为经纬度
	unproject(cartesian){};

	// 获取顶部瓦片
	getRootTiles(manager){};

	// 获取计算瓦片几何体
	computeGeometry( column, row, level){};
}
