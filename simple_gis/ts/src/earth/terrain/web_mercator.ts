import {
	Vector2,
	Vector3,
} from '../../../libs/three.module';

import Terrain from './terrain';
import Cartograph from '../coordinates/cartograph'
import geometryParams from '../types/geometry_params'
import Tile from '../tile/tile';
import Layer from '../layer/layer';

export default class WebMercatorTerrain extends Terrain{
	constructor(){
		super(6378137, 6378137 * ( 1 - 1 / 298.257223563 ))
	}
	// 笛卡尔坐标转化为经纬度
	public unproject(cartesian: Vector3): Cartograph{
		let
			a = this.equatorial,
			b = this.polar,
			{ x, y, z } = cartesian,

			e = Math.sqrt( a * a - b * b ) / a,
			eprime = Math.sqrt( a * a - b * b ) / b,
			p = Math.sqrt( x * x + y * y ),
			theta = Math.atan(z * a / p / b),
 
			// // 计算经纬度及海拔
			longitude = Math.atan2( y, x ),
			latitude = Math.atan2( z + eprime * eprime * b * Math.pow( Math.sin(theta), 3),
															p - e * e * a * Math.pow( Math.cos(theta), 3)),
			N = a / Math.sqrt( 1 - e * e * Math.sin(latitude) * Math.sin(latitude) ),
			height = p / Math.cos(latitude) - N;

		  longitude = longitude / Math.PI * 180;
		  latitude = latitude / Math.PI * 180;

		return new Cartograph( longitude, latitude, height );
	}
	// 经纬度转化为笛卡尔坐标
	public project(cartograph: Cartograph): Vector3{
		let
			a = this.equatorial,
			b = this.polar,
			{ latitude, height, longitude } = cartograph,

			e = Math.sqrt(a * a - b * b) / a,
			N = a / Math.sqrt(1 - e * e * Math.sin(latitude * Math.PI / 180) * Math.sin(latitude * Math.PI / 180));

		return new Vector3(
			(N + height) * Math.cos(latitude * Math.PI / 180) * Math.cos(longitude * Math.PI / 180),
			(N + height) * Math.cos(latitude * Math.PI / 180) * Math.sin(longitude * Math.PI / 180),
			(N * (1 - (e * e)) + height) * Math.sin(latitude * Math.PI / 180)
		);
	}

	private longitudeToMercatorX(longitude: number): number{
		return this.equatorial * longitude / 180 * Math.PI;
	}

	private latitudeToMercatorY(latitude: number): number{
		return this.equatorial * Math.log( Math.tan( ( latitude / 90 + 1 ) * Math.PI / 4 ) );
	}

	private mercatorXToLongitude(mercatorX: number): number{
		return mercatorX / this.equatorial / Math.PI * 180; 
	}

	private mercatorYToLatitude(mercatorY: number): number{
		return (2 * Math.atan( Math.pow( Math.E, mercatorY / this.equatorial ) ) - Math.PI / 2) / Math.PI * 180; 
	}

	private tileOrderToLongitude(column: number, level: number): number{
		return column / (1 << level) * 360 - 180;
	}

	private tileOrderToLatitude(row: number, level: number): number{
		return Math.atan( 
							Math.sinh(
								Math.PI * (1 - 2 * row / (1 << level))
							)
						) * 180 / Math.PI;
	}

	public getRootTiles(layer: Layer): Array<Tile>{
		return [
			new Tile({
				column: 0,
				row: 0,
				level: 0,
				terrain: this,
				layer
			})
		];
	}

	public computeGeometry(
		column: number,
		row: number,
		level: number): geometryParams{
		
		let
			vertices: Array<number> = [],
			uvs: Array<number> = [],
			normals: Array<number> = [],
			indices: Array<number> = [],
			gridCenters: Array<Vector3> = [],

			minLongitude = this.tileOrderToLongitude(column, level),
			maxLongitude = this.tileOrderToLongitude(column + 1, level),
			minLatitude = this.tileOrderToLatitude(row + 1, level),
			maxLatitude = this.tileOrderToLatitude(row, level),

			minMercatorX = this.longitudeToMercatorX(minLongitude),
			maxMercatorX = this.longitudeToMercatorX(maxLongitude),
			minMercatorY = this.latitudeToMercatorY(minLatitude),
			maxMercatorY = this.latitudeToMercatorY(maxLatitude),

			center: Vector3 = this.project( new Cartograph( 
					(minLongitude + maxLongitude) / 2, 
					(minLatitude + maxLatitude) / 2,
					0 
				) 
			),

			wSegment = Math.max( 64 >> level, 1),
			hSegment = Math.max( 64 >> level, 1),
		
			deltaX = ( maxMercatorX - minMercatorX ) / wSegment,
			deltaY = ( maxMercatorY - minMercatorY ) / hSegment,
			deltaU = 1 / wSegment,
			deltaV = 1 / hSegment;

		for( let i = 0; i <= hSegment; i++ ){
			let latitude = this.mercatorYToLatitude( maxMercatorY - i * deltaY ),
					v = 1 - i * deltaV;
			for( let j = 0; j <= wSegment; j++ ){
				let vector = this.project(
					new Cartograph(
						this.mercatorXToLongitude( minMercatorX + j * deltaX ),
						latitude,
					)
				);
				vertices.push(vector.x, vector.y, vector.z);
				uvs.push( j * deltaU, v );

				if( i > 0 && j > 0 ){
					let
						leftIndex = vertices.length - 6,
						left = new Vector3( vertices[leftIndex], vertices[leftIndex + 1], vertices[leftIndex + 2] ),

						topIndex = vertices.length - wSegment * 3 - 6,
						top = new Vector3( vertices[topIndex], vertices[topIndex + 1], vertices[topIndex + 2] );

					gridCenters.push( left.add(top).divideScalar(2) );
				}
			}
		}

	  for (let i = 0; i < hSegment; i++) {
	    for (let j = 0; j < wSegment; j++) {
				let
					idx0 = (wSegment + 1) * i + j,
					idx1 = (wSegment + 1) * ( i + 1 ) + j,
					idx2 = idx1 + 1,
					idx3 = idx0 + 1;
				indices.push(
					// 0 1 2
					idx0, idx1, idx2,
					// 2 3 0
					idx2, idx3, idx0
				);
			}	
		}

		return {
			vertices,
			uvs,
			normals,
			indices,
			center,
			gridCenters
		};
	}
}

