import {
	RawShaderMaterial
} from '../../libs/three.module.js';
import TileFS from './TileFS.js';
import TileVS from './TileVS.js';

const textureName = 'uTexture';

export default class Layer{
	constructor(){
		this.material = new RawShaderMaterial();
	}

	updateMaterial(manager){
		let textureNum = manager.providers.length;

		this.uniforms = {};

		for( let i = 0; i < textureNum; i++ ){
			this.uniforms[textureName + i] = {
				value: null
			}
		}

		this.material.uniforms = this.uniforms;
		this.material.depthTest = false;
		this.material.vertexShader = TileVS();
		this.material.fragmentShader = TileFS(textureName, textureNum);

		this.material.needsUpdate = true;
	}

	render(textures){
		let i = 0;
		textures.forEach((texture)=>{
			let
				name = textureName + i,
				uTexture = this.uniforms[name];

			if( uTexture ){
				uTexture.value = texture;
			}else{
				this.uniforms[name] = {
					value: texture
				}
			}
			i++;
		});
	}
}