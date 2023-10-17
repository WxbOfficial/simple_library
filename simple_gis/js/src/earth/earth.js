import { isNumber, isInstance } from '../core/check_value.js';
import developerError from '../core/developer_error.js';

import Camera from '../core/camera.js';
import GlobeControls from '../tools/globe_controls.js';

import Cartograph from './coordinates/cartograph.js';

import { TerrainType } from './terrain/terrain.js';
import WebMercatorTerrain from './terrain/web_mercator.js';
import Provider from './provider/provider.js';
import BingProvider from './provider/bing_provider.js';

import Manager from './manager/manager.js';

export default function createEarth( earthOptions ){

	let
		{ 
			minLevel, maxLevel, terrainType, provider, origin, sseThreshold,
			camera, canvas, scene
		} = earthOptions,

		terrain,
		manager, globeControls;

	let
		defaultEarthOption = {
			origin: new Cartograph(120.04340, 30.31806, 0),
			provider: new BingProvider(),
			minLevel: 1,
			maxLevel: 19,
			sseThreshold: 5,
		};


	switch( earthOptions.terrainType ){
		case TerrainType.WebMercatorTerrain:
			terrain = new WebMercatorTerrain();
			break;
		default:
			terrain = new WebMercatorTerrain();
			break;
	}
	scene.add( terrain.tileGroup );

	manager = new Manager(terrain);


	if( !isInstance(origin, Cartograph) ){
		origin = defaultEarthOption.origin;
	}

	if( !isInstance(provider, Provider) ){
		provider = defaultEarthOption.provider;
	}
	manager.setProvider(provider);


	if( !isNumber(minLevel) ){
		minLevel = defaultEarthOption.minLevel;
	}
	if( !isNumber(maxLevel) ){
		maxLevel = defaultEarthOption.maxLevel;
	}
	if( maxLevel < minLevel ){
		developerError('瓦片最低层级比最高层级大');
	}
	manager.setBaseTiles(minLevel);

	if( !isNumber(sseThreshold) ){
		sseThreshold = defaultEarthOption.sseThreshold;
	}

	let
		_camera = new Camera(),

		earth = {
			setMinLevel(level){
				if( isNumber(level) ){
					if( maxLevel < level ){
						developerError('比最高层级大');
					}else{
						minLevel = level;
						manager.setBaseTiles(minLevel);
					}
				}else{
					developerError('请输入正确的参数格式');
				}
			},
			update(){
				_camera.copy(camera);
				_camera.applyMatrix4(terrain.matrixInv);
				_camera.updateWorldMatrix();

				manager.setCameraTile(minLevel, maxLevel, canvas, _camera, sseThreshold)
			},

			// 获得经纬度坐标
			getCartograph(cartesian){
				return terrain.unproject( cartesian.clone().applyMatrix4( terrain.matrixInv ) );
			},
			// 获得笛卡尔坐标
			getCartesian(cartograph){
				return terrain.project(cartograph).applyMatrix4( terrain.matrix );
			},
			// 设置原点的经纬度
			setOrigin(longitude, latitude, height){
				if( isInstance(longitude, Cartograph) ){
					terrain.setOrigin( longitude );
				}else if( isNumber(longitude) || isNumber(latitude) || isNumber(height) ){
					terrain.setOrigin(new Cartograph(longitude, latitude, height));
				}else{
					developerError('设置原点的经纬度, 输入正确的原点数据');
				}
				
				this.update();
			},
			// 获取中心点
			getCenter(){
				return terrain.center;
			},
			// 销毁
			destroy(){
				globeControls.destroy();
			}
		};

	globeControls = new GlobeControls(canvas, camera, earth, terrain);



	return Object.freeze(earth);
}

