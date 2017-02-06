import * as d3 from 'd3';

import { GraphNode, GraphNodeBase } from 'src/GraphNode';

export abstract class GraphLinkBase<TVmeNode extends GraphNodeBase> implements d3.SimulationLinkDatum<TVmeNode> {
	source: TVmeNode;
	target: TVmeNode;
}

export class GraphLink extends GraphLinkBase<GraphNode> {
	/** Unique id of this link */
	public id: string;

	constructor( sourceNode: GraphNode, targetNode: GraphNode ) {
		super();
		this.source = sourceNode;
		this.target = targetNode;
		this.id = `${this.source.id}-${this.target.id}`;
	}
}