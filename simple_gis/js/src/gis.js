import {
	Scene,
	WebGLRenderer,
	Vector3
} from './libs/three.module.js';

import { isDom, isNumber, isInstance, isObject } from './core/check_value.js';
import developerError from './core/developer_error.js';

import Camera from './core/camera.js';

import createEarth from './earth/earth.js';



/**
 * Gis 初始化, 最开始的 gis 对象，一切从这里开始
 * @example
 * let gis = createGis({
 * 	canvas,
 * 	fov: 60,
 * 	near: 1,
 * 	far: 10000000,
 * 	cameraPosition: new Vector(0,0,1000)
 * });
 * @param {Object} options 初始化 gis 的参数，内部属性如下
 * @property {HTMLCanvasElement} canvas canvas 画布
 * @property {HTMLDivElement} container dom 容器，用于存放 canvas 画布，与 canvas 参数同时输入的话，以 canvas 为准
 * @property {number} fov 初始的相机视锥体垂直视野角度
 * @property {number} near 初始的相机近端面
 * @property {number} far 初始的相机远端面
 * @property {Vector3} cameraPosition 初始的相机位置
 */
export default function createGis(options){

	if( !isObject(options) ){
		developerError('请输入初始化参数');
	}

	if(!isNumber(options.fov)){
		developerError('请正确输入 fov 参数以确定相机视锥体垂直视野角度');
	}

	if(!isNumber(options.near)){
		developerError('请正确输入 near 参数以确定相机视锥体近端面');
	}

	if(!isNumber(options.far)){
		developerError('请正确输入 far 参数以确定相机视锥体远端面');
	}

	// 初始化
	let 
		container, renderer, camera, globeControls,
		scene = new Scene(),
		earth;

	if( isDom(options.canvas) ){
		renderer = new WebGLRenderer( {
			antialias: true,
			canvas: options.canvas
		} );
	}else if( isDom(options.container) ){
		renderer = new WebGLRenderer( {
			antialias: true,
		} );
		options.container.appendChild( renderer.domElement );
	}else{
		developerError('请确认 canvas 画布或 container 容器');
	}
	container = renderer.domElement.parentNode;

	camera = new Camera(
		options.fov,
		container.offsetWidth / container.offsetHeight,
		options.near,
		options.far
	);

	if( isInstance(options.cameraPosition, Vector3) ){
		camera.position.copy(options.cameraPosition)
	}else{
		developerError('请输入正确的相机位置');
	}

	renderer.setPixelRatio( window.devicePixelRatio );
	renderer.setClearColor( 0xffffff, 1.0 );
	renderer.setSize( container.offsetWidth, container.offsetHeight );

	// 动画运行
	animation();
	function animation(){
		requestAnimationFrame( animation );
		renderer.render( scene, camera );
	}

	// 自适应
	function onWindowResize(){
		camera.aspect = container.offsetWidth / container.offsetHeight;
		camera.updateProjectionMatrix();
		renderer.setSize( container.offsetWidth, container.offsetHeight );
	}
	window.addEventListener( 'resize', onWindowResize );


	return Object.freeze({
		initEarth(options){
			let replenish = {
				camera,
				canvas: renderer.domElement,
				scene
			}
			if( isObject(options) ){
				earth = createEarth( Object.assign(options, replenish) );
			}else{
				earth = createEarth( replenish );
			}
			replenish = null;
			return this;
		},
		getEarth(){
			return earth;
		},
		getScene(){
			return scene;
		},
		getCamera(){
			return camera;
		},
		destroy(){
			window.removeEventListener( 'resize', onWindowResize );
			earth.destroy();
		}
	});
}