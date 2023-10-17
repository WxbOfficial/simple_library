

export default class Cartograph{

	public longitude: number;
	public latitude: number;
	public height: number;

	constructor(longitude: number = 0, latitude: number = 0, height: number = 0){
		this.longitude = longitude;
		this.latitude = latitude;
		this.height = height;
	}
}