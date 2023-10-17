import {
	Vector3
} from '../../../libs/three.module';


type geometryParams = {
	vertices: Array<number>,
	uvs: Array<number>,
	normals: Array<number>,
	indices: Array<number>,
	center: Vector3,
	gridCenters: Array<Vector3>
}

export default geometryParams;