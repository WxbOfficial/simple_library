import Tile from '../tile/tile';
import Terrain from '../terrain/terrain'
import Layer from '../layer/layer';

type tileParams = {
	column: number,
	row: number,
	level: number,
	parent?: Tile | undefined,
	terrain: Terrain,
	layer: Layer
}

export default tileParams;