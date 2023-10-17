import {
	Matrix4,
	Vector3,
	Camera
} from '../../libs/three.module';

const _matrix4 = new Matrix4();
const _projectionMatrixInverse = new Matrix4();


export default {
	unproject(v: Vector3, camera: any /*对ts的妥协*/ ){
		_projectionMatrixInverse.copy( camera.projectionMatrixInverse );
		_matrix4.compose( camera.position, camera.quaternion, camera.scale );

		v.applyMatrix4( _projectionMatrixInverse )
			.applyMatrix4( _matrix4 );

		return v;
	}

}