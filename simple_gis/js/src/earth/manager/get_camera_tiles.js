import {
	Matrix4,
	Frustum,
	Vector2
} from '../../libs/three.module.js';

function tileIsVision(camera, tile){
	let
		_frustum = new Frustum(),
		_matrix = new Matrix4(),

		boundingSphere = tile.getSphere().clone();

	_frustum.setFromProjectionMatrix(
		_matrix.multiplyMatrices( 
			camera.projectionMatrix, 
			camera.matrixWorldInverse
		)
	);

	if( _frustum.intersectsSphere(boundingSphere) ){

		let normals = tile.gridCenters;

		for( let i = 0, len = normals.length; i < len; i++ ){

			let
				n = normals[i],
				v = camera.position.clone().sub( n ),
				angle = v.angleTo( n );
			
			if( angle <= Math.PI / 2 ){
				return true;
			}
		}
	}

	return false;
}

function subIsVision(ellipse, canvas, camera, tile, sseThreshold){
	let
		cV = camera.position.clone().divide(ellipse),
		vhMagnitudeSquared = cV.lengthSq() - 1.0,
		canvasSize = new Vector2( canvas.offsetWidth, canvas.offsetHeight ),
		hypotenuse = canvasSize.length(),
		radAngle = camera.fov * Math.PI / 180,
		HYFOV = 2.0 * Math.atan(Math.tan(radAngle * 0.5) * hypotenuse / canvasSize.x),
		preSSE = hypotenuse * (2.0 * Math.tan(HYFOV * 0.5)),

		boundingSphere = tile.getSphere(),
		center = tile.center,

		distance = Math.max(
				0.0,
				camera.position.clone().distanceTo(center) - 
				boundingSphere.radius);

	return sseThreshold < preSSE * (tile.geometricError / distance);
}

export default function getTile(
	minLevel, maxLevel,
	rootTiles,
	ellipse,
	canvas,
	camera,
	sseThreshold
){
	// console.log('minLevel:', minLevel);
	// console.log('maxLevel:', maxLevel);
	// console.log('rootTiles:', rootTiles);
	// console.log('ellipse:', ellipse);
	// console.log('canvas:', canvas);
	// console.log('camera:', camera);
	// console.log('sseThreshold:', sseThreshold);
	let
		stack = [...rootTiles],
		tile,
		tiles = [];

	while( tile = stack.pop() ){
		// console.log('tileIsVision:', tile.order,tileIsVision(camera, tile))
		if( tileIsVision(camera, tile) ){

			if( tile.level > minLevel ){
				tiles.push(tile);
			}

			// console.log('subIsVision:', tile.order, (subIsVision(ellipse, canvas, camera, tile, sseThreshold) && tile.level <= maxLevel) || tile.level < minLevel )
			if( (subIsVision(ellipse, canvas, camera, tile, sseThreshold) && tile.level <= maxLevel) || tile.level < minLevel ){
				tile.getChildren().forEach((child)=>{
					stack.push(child);
				});
			}
		}
	}

	return tiles;
}