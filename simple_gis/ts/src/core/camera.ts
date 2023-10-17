import {
	PerspectiveCamera,
	Vector2,
	Vector3
} from '../../libs/three.module';
import GisMath from './math';
import ray from '../earth/types/ray';



export default class GisCamera extends PerspectiveCamera{
	public position: Vector3;

	constructor(fov:number, aspect:number, near:number, far:number){
		super(fov, aspect, near, far);
	}
	
	getMouseRay(mouse: Vector2): ray{
		let
			origin = new Vector3(),
			direction = new Vector3();

		origin.x = direction.x = mouse.x;
		origin.y = direction.y = mouse.y;

		origin.z = -1;
		direction.z = 1;

		GisMath.unproject(origin, this);
		GisMath.unproject(direction, this);

		direction.sub(origin);

		return {
			origin,
			direction
		}
	}

}