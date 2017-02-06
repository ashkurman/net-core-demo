import * as d3 from 'd3';

import ArtistInfo from 'src/ArtistInfo';


/**
 * Base class for any element that might be used in the D3's force simulation
 */
export abstract class GraphNodeBase implements d3.SimulationNodeDatum {
//todo: how to get inherited documentation to be displayed on these fields?
	x: number = 0;
	y: number = 0;
	vx: number = 0;
	vy: number = 0;
	fx?: number | null = null;
	fy?: number | null = null;
}


export class GraphNode extends GraphNodeBase {
	/**  Unique identifier of this node */
	public id: string;
	/** How large the node should be rendered (in pixels) */
	public radius: number;
	public title: string;
	public tooltip: string;

	constructor( init?: Partial<GraphNode>) {
		super();
		if (!init) return;
		Object.assign(this, init);
	}
}