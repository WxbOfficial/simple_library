import {
	Scene,
	WebGLRenderer,
	Vector3
} from '../libs/three.module';

import { isDom, isEmpty, isNumber, isInstance } from './core/check_value';
import developerError from './core/developer_error';

import Camera from './core/camera';

import Earth from './earth/earth';
import earthOptions from './earth/types/earth_options';
import GlobeControls from './tool/globe_controls';


type gisOptions = {
	container: HTMLDivElement,
	canvas: HTMLCanvasElement,
	fov: number,
	near: number,
	far: number,
	cameraPosition: Vector3
}

export default class Gis{

	private container: HTMLDivElement;

	private renderer: WebGLRenderer;

	private scene: Scene;

	private earth: Earth;

	private camera: Camera;

	private globeControls: GlobeControls;

	constructor(options: gisOptions){

		if( isEmpty(options) ){
			developerError('gis 参数缺失');
		}

		let
			container: HTMLDivElement,
			renderer!: WebGLRenderer;

		if( isDom(options.container) ){

			renderer = new WebGLRenderer( {
				antialias: true,
			} );

			options.container.appendChild( renderer.domElement );

		}else{

			if( isDom(options.canvas) ){

				renderer = new WebGLRenderer( {
					antialias: true,
					canvas: options.canvas
				} );

			}else{
				developerError('container 或者 canvas 参数缺失');
			}
		}

		container = renderer.domElement.parentNode;

		renderer.setPixelRatio( window.devicePixelRatio );
		renderer.setClearColor( 0xffffff, 1.0 );
		renderer.setSize( container.offsetWidth, container.offsetHeight );

		this.renderer = renderer;
		this.container = container;

		let
			fov!:number,
			near!:number,
			far!:number;

		if(isNumber(options.fov)){
			fov = options.fov;
		}else{
			developerError('请输入 fov 参数以确定相机视锥体垂直视野角度');
		}
		if(isNumber(options.near)){
			near = options.near;
		}else{
			developerError('请输入 near 参数以确定相机视锥体近端面');
		}
		if(isNumber(options.far)){
			far = options.far;
		}else{
			developerError('请输入 far 参数以确定相机视锥体远端面');
		}

		this.camera = new Camera(
			fov,
			container.offsetWidth / container.offsetHeight,
			near, far
		);

		if( isInstance(options.cameraPosition, Vector3) ){
			this.setCameraPosition(options.cameraPosition);
		}

		this.scene = new Scene();

		this.onWindowResize = this.onWindowResize.bind(this);
		window.addEventListener( 'resize', this.onWindowResize );

		this.animation = this.animation.bind(this);
		this.animation();

		return this;
	}

	public initEarth(options: earthOptions): Gis{
		this.earth = new Earth(options)
									.mount(this.renderer.domElement, this.scene);

		this.globeControls = new GlobeControls(this.camera, this.renderer.domElement, this.earth);

		this.earth.update(this.camera);
		return this;
	}

	public getEarth(): Earth{
		return this.earth;
	}

	private onWindowResize(){
		this.camera.aspect = this.container.offsetWidth / this.container.offsetHeight;
		this.camera.updateProjectionMatrix();
		this.renderer.setSize( this.container.offsetWidth, this.container.offsetHeight );
	}

	private animation(){

		requestAnimationFrame( this.animation );

		this.renderer.render( this.scene, this.camera );
	}

	public getCamera(): Camera{
		return this.camera;
	}

	public setCameraPosition(position: Vector3): Gis{
		this.camera!.position.copy(position);
		return this;
	}

	public getControls(): GlobeControls{
		return this.globeControls;
	}


	public getScene(): Scene{
		return this.scene;
	}

	public destroy(){

		window.removeEventListener( 'resize', this.onWindowResize );
	}

}