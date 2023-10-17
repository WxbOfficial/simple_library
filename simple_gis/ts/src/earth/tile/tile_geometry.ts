import {
	BufferGeometry,
	Float32BufferAttribute
} from '../../../libs/three.module';
import geometryParams from '../types/geometry_params';
// import Tile from './tile';

export default class TileGeometry extends BufferGeometry{
	constructor(geometryParams: geometryParams){
		super();
		this.type = 'TileGeometry';

		this.setIndex( geometryParams.indices );
		this.setAttribute( 'position', new Float32BufferAttribute( geometryParams.vertices, 3 ) );
		this.setAttribute( 'normal', new Float32BufferAttribute( geometryParams.normals, 3 ) );
		this.setAttribute( 'uv', new Float32BufferAttribute( geometryParams.uvs, 2 ) );

		this.computeBoundingSphere();
	}
}