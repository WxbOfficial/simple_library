import {
	Vector2,
	Vector3,
	Quaternion,
} from '../libs/three.module.js';

const _mouseButtons = {
	LEFT: 0,
	MIDDLE: 1,
	RIGHT: 2
}

const STATE = {
	NONE: -1,
	PAN: 0,
	ZOOM: 1,
	ROTATE: 2,
}


export default class GlobeControls{

	constructor(canvas, camera, earth, terrain){
		// console.log('GlobeControls');

		let
			hasDown = false,
			isMouse,

			state = STATE.NONE,

			panPoint,
				
			rotatePoint,
			rotateStart = new Vector2(),
			rotateEnd = new Vector2(),
			verticalAxis =  new Vector3(),
			horizontalAxis = new Vector3(),

			zoomPoint,
			minHeight = 0,
			maxHeight = Infinity,
			scale = 0.05,

			changeQuaternion = false,
			_quaternion = new Quaternion(),

			changePosition = false,
			cameraPsotion = new Vector3().copy(camera.position);

		function update(){
			if( changeQuaternion ){
				camera.applyQuaternion(_quaternion);
				changeQuaternion = false;
			}

			if( changePosition ){
				camera.position.copy(cameraPsotion);
				changePosition = false;
			}

			earth.update(camera);
		}

		function setMouseVector2(event, v){
			v.x = ( event.offsetX / canvas.offsetWidth ) * 2 - 1;
			v.y = - ( event.offsetY / canvas.offsetHeight ) * 2 + 1;
		}

		// 获取屏幕在地球上的坐标点(世界坐标下的笛卡尔坐标)
		function getIntersection(event){
			let
				mouse = new Vector2(
					( event.offsetX / canvas.offsetWidth ) * 2 - 1,
						- ( event.offsetY / canvas.offsetHeight ) * 2 + 1
				),
				ray = camera.getMouseRay(mouse);

			return terrain.getEllipseIntersection(ray.origin, ray.direction);
		}

		// Pan 操作

		function handleMouseDownPan( event ){
			panPoint = getIntersection(event);
		}

		function handleMouseMovePan( event ){
			if( panPoint ){
				let
					intersection = getIntersection(event),
					earthCenter = earth.getCenter();

				if( intersection ){
					let
						sV = panPoint.clone().sub(earthCenter),
						eV = intersection.clone().sub(earthCenter),
						angle = sV.angleTo(eV),
						axis = sV.clone().cross(eV).normalize(),

						v = cameraPsotion.clone().sub(earthCenter);

					_quaternion.setFromAxisAngle(axis, -angle);

					cameraPsotion.sub(v);
					v.applyQuaternion(_quaternion);
					cameraPsotion.add(v);

					changeQuaternion = true;
					changePosition = true;
					update();
				}else{
					panPoint = void 0;
				}
			}
		}

		// Zoom 操作

		function handleMouseDownZoom( event ){
			
		}

		function handleMouseMoveZoom( event ){

		}

		// Rotate 操作

		function handleMouseDownRotate( event ){
			// rotatePoint = getIntersection(event);
			// console.log(intersection)

			setMouseVector2(event, rotateStart);
		}

		function handleMouseMoveRotate( event ){// 先实现再说

			camera.getWorldDirection(verticalAxis);
			horizontalAxis.copy(camera.getRightDirection());

			setMouseVector2(event, rotateEnd);

			let
				verticalAngle = ( rotateEnd.x - rotateStart.x ) * Math.PI / 2,
				horizontalAngle = ( rotateEnd.y - rotateStart.y ) * Math.PI / 2,

				q1 = new Quaternion(),
				q2 = new Quaternion();

			q1.setFromAxisAngle( verticalAxis, verticalAngle );
			camera.applyQuaternion(q1);

			q2.setFromAxisAngle( horizontalAxis, horizontalAngle );
			camera.applyQuaternion(q2);

			rotateStart.copy(rotateEnd);

			// changeQuaternion = true;
			// update();

		}


		// canvas 添加事件

		canvas.addEventListener( 'contextmenu', onContextMenu );
		function onContextMenu( event ) {
			event.preventDefault();
		}

		// pointer 相关
		canvas.addEventListener( 'pointerdown', onPointerDown );
		function onPointerDown( event ) {

			if ( !hasDown ){
				hasDown = true;

				canvas.addEventListener( 'pointermove', onPointerMove );
				canvas.addEventListener( 'pointerup', onPointerUp );
			}

			if ( event.pointerType === 'touch' ) {
				isMouse = false;
				alert('暂不支持移动端');
			}else{
				isMouse = true;
				canvas.addEventListener( 'mouseleave', onMouseLeave );
				onMouseDown(event);
			}
		}

		function onPointerMove( event ){

			if ( event.pointerType === 'touch' ) {
				alert('暂不支持移动端');
			} else {
				onMouseMove( event );
			}
		}

		function onPointerUp( event ){
			endDown();
		}

		function endDown(){
			if( hasDown ){
				hasDown = false;
				canvas.removeEventListener( 'pointermove', onPointerMove );
				canvas.removeEventListener( 'pointerup', onPointerUp );
				if( isMouse ){
					canvas.removeEventListener( 'mouseleave', onMouseLeave );
				}
			}
			state = STATE.NONE;
		}

		// pc 端
		function onMouseDown( event ){
			if(state !== STATE.NONE){
				console.log('已经在变化了, 保持之前的变化不作改变');
				return;
			}

			switch ( event.button ) {
				case _mouseButtons.LEFT: 
					// console.log('左键');
					handleMouseDownPan( event );
					state = STATE.PAN;
					break;
				case _mouseButtons.MIDDLE: 
					// console.log('中间');
					handleMouseDownZoom( event );
					state = STATE.ZOOM;
					break;
				case _mouseButtons.RIGHT: 
					// console.log('右键');
					handleMouseDownRotate( event );
					state = STATE.ROTATE;
					break;
			}
		}

		function onMouseMove( event ) {

			switch ( state ) {
				case STATE.PAN:
					handleMouseMovePan( event );
					break;
				case STATE.ZOOM:
					handleMouseMoveZoom( event );
					break;
				case STATE.ROTATE:
					handleMouseMoveRotate( event );
					break;
			}
		}

		function onMouseLeave( event ) {
			endDown();
		}

		canvas.addEventListener( 'wheel', onMouseWheel, { passive: false } );

		function onMouseWheel( event ){
			event.preventDefault();

			let intersection = getIntersection(event);
			if( !intersection ){

				return ;
			}


			if ( event.deltaY < 0 ) {
				zoomIn( intersection );
			} else if ( event.deltaY > 0 ) {
				zoomOut( intersection );
			}
		}

		// 拉近
		function zoomIn(intersection){
			let
				direction = cameraPsotion.clone().sub(intersection),
				cartograph = earth.getCartograph(cameraPsotion);

			if( cartograph.height > minHeight ){
				cameraPsotion.sub( direction.multiplyScalar( scale ) );

				changePosition = true;
				update();
			}
		}

		// 放远
		function zoomOut(intersection){
			let
				direction = cameraPsotion.clone().sub(intersection),
				cartograph = earth.getCartograph(cameraPsotion);

			if( cartograph.height < maxHeight ){
				cameraPsotion.add( direction.multiplyScalar( scale ) );

				changePosition = true;
				update();
			}
		}

		this.setMaxHeight = function (height){
			if( height > minHeight ){
				maxHeight = height;
			}
		}

		this.setMinHeight = function (height){
			if( height < maxHeight && height > 0 ){
				minHeight = height;
			}
		}

		this.dispose = function () {
			canvas.removeEventListener( 'contextmenu', onContextMenu );
			canvas.removeEventListener( 'pointerdown', onPointerDown );

			canvas.removeEventListener( 'wheel', onMouseWheel );

			endDown();
		}

	}

}