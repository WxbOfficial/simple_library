import Terrain from '../terrain/terrain';
import WebMercator from '../terrain/web_mercator';
import Provider from '../layer/provider/provider';
import BingProvider from '../layer/provider/bing_provider';
import Cartograph from '../coordinates/cartograph';

type earthOptions = {
	minLevel: number;
	maxLevel: number;
	terrain: Terrain;
	provider: Provider;
	origin: Cartograph;
}

export default earthOptions;

export function createDefaultEarthOption(): earthOptions{
	return {
		minLevel: 1,
		maxLevel: 19,
		terrain: new WebMercator(),
		provider: new BingProvider(),
		origin: new Cartograph(120.04340, 30.31806, 0)
	}
}
