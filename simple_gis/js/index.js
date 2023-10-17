
export * as THREE from './src/libs/three.module.js';

import createGis from './src/gis.js';
import createEarth from './src/earth/earth.js';
import TerrainType from './src/earth/terrain/terrain.js';
import Cartograph from './src/earth/coordinates/cartograph.js';

export const Gis = {
	createGis,
	createEarth,
	TerrainType,
	Cartograph
}
