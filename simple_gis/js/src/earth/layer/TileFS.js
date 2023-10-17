
export default function tileFragmentShader(textureName, textureNum){
	let
		uTextures = '',
		vTextures = '',

		uTextureX = '',
		uTextureY = '',
		uTextureZ = '',
		texture = 'vec4(';

	for( let i = 0; i < textureNum; i++ ){
		let name = textureName + i;
		uTextures += 'uniform sampler2D ' + name + ';';
		vTextures += 'vec4 vTexture' + i + ' = texture2D( ' + name + ', vUv );'

		uTextureX += ' vTexture' + i + '.x'
		uTextureY += ' vTexture' + i + '.y'
		uTextureZ += ' vTexture' + i + '.z'

		if( i < textureNum - 1 ){
			uTextureX += '+'
			uTextureY += '+'
			uTextureZ += '+'
		}else{
			uTextureX += ','
			uTextureY += ','
			uTextureZ += ','
		}

		texture += '';
	}

	texture += uTextureX + uTextureY + uTextureZ + ' 1.0)';

	return `
		precision mediump float;
		precision mediump int;

		varying vec2 vUv;

		${uTextures}

		void main() {

			${vTextures}

			vec4 texture = ${texture};

			gl_FragColor = texture;
		}`
}