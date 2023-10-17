import {
	PerspectiveCamera,
	Vector3
} from '../libs/three.module.js';
import GisMath from './math.js';


export default class GisCamera extends PerspectiveCamera{

	constructor(fov, aspect, near, far){
		super(fov, aspect, near, far);

	}

	getMouseRay(mouse){
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

	getRightDirection(){
		let
			start = new Vector3(0, 0, 0),
			end = new Vector3(1, 0, 0);

		GisMath.unproject(start, this);
		GisMath.unproject(end, this);

		return end.sub(start);
	}
}