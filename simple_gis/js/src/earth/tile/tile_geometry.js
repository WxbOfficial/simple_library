import {
	BufferGeometry,
	Float32BufferAttribute
} from '../../libs/three.module.js';


export default class TileGeometry extends BufferGeometry{
	constructor(geometryParams){
		super();
		this.type = 'TileGeometry';

		this.setAttribute( 'position', new Float32BufferAttribute( geometryParams.vertices, 3 ) );
		this.setAttribute( 'normal', new Float32BufferAttribute( geometryParams.normals, 3 ) );
		this.setAttribute( 'uv', new Float32BufferAttribute( geometryParams.uvs, 2 ) );
		this.setIndex( geometryParams.indices );

		this.computeBoundingSphere();
	}
}