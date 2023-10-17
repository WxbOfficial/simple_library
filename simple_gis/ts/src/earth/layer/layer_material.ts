import {
	Texture,
	RawShaderMaterial,
} from '../../../libs/three.module';
import Provider from './provider/provider';
import TileFS from '../../shaders/TileFS';
import TileVS from '../../shaders/TileVS';

export default class LayerMaterial{
	private uniforms: any = {};
	private textureName: string = 'uTexture';
	public material: any;// 对 ts 的妥协

	constructor(textureNum: number){
		for( let i = 0; i < textureNum; i++ ){
			this.uniforms[this.textureName + i] = {
				value: null
			}
		}

		this.material = new RawShaderMaterial({
			depthWrite: false,
			uniforms: this.uniforms,
			vertexShader: TileVS(),
			fragmentShader: TileFS(this.textureName, textureNum),
		});
	}

	setTextures(textures: Map<Provider, Texture>): LayerMaterial{
		let i = 0;
		textures.forEach((value)=>{
			this.uniforms[this.textureName + i] = {
				value
			}
			i ++;
		});
		return this;
	}

}