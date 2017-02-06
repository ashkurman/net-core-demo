import * as Enumerable from 'linq-es2015';

import { GraphNode } from 'src/GraphNode';
import { GraphLink } from 'src/GraphLink';


export default class GraphModel {
	/** All known graph nodes. Maps node's unique name to it's content */
	public nodes: Map<string, GraphNode> = new Map();
	public links: GraphLink[] = [];

	/** Dimensions of a viewport where the graph will be rendered */
	private _viewportSize = {
		width: 100,
		height: 100
	}

	private _selectedNode: GraphNode | null;
	public get selectedNode(): GraphNode | null {
		return this._selectedNode || null;
	}
	public set selectedNode(node: GraphNode | null) {
		if (node)
			if (!this.nodes.has(node.id))
				return;
		this._selectedNode = node;
	}


	public getNodesArray(): GraphNode[] {
		return Array.from( this.nodes.values() );
	}


	public createAndAddNode(newNodeId: string, parentNodeId?: string): this {
		if (this.nodes.has(newNodeId)) return this;
		const newNode = new GraphNode(<GraphNode>{id: newNodeId, radius: 15});
		return this.addNode(newNode, parentNodeId);
	}

	/**
	 * Adds new node to the graph. New node can be optionally linked to one of already existing nodes by its id.
	 * @param newNode
	 * @param parentNodeId id of existing node to which new node will be linked.
	 */
	public addNode(newNode: GraphNode, parentNodeId?: string): this {
		if (this.nodes.has(newNode.id)) return this;

		const parentNode = parentNodeId ? this.nodes.get(parentNodeId) : undefined;
		if (parentNode) {
		// if new node has a parrent - make this newnode 'emerge' from inside the parent.
			newNode.x = parentNode.x;
			newNode.y = parentNode.y;
		} else {
		// if new node has no parent - make it appear at the center of the screen.
			newNode.x = this._viewportSize.width / 2;
			newNode.y = this._viewportSize.height / 2;
		}

		this.nodes.set(newNode.id, newNode);
		return this;
	}

	/**
	 * Connect two graph nodes with a link. New link won't be produced if
		* <p>- given nodes are already linked</p>
		* <p>- some/all of nodes does not exist</p>
	 * @param firstNodeId
	 * @param secondNodeId
	 */
	public addLink(firstNodeId: string, secondNodeId: string): this {
		const firstNode = this.nodes.get(firstNodeId);
		if (!firstNode) return this;
		const secondNode = this.nodes.get(secondNodeId);
		if (!secondNode) return this;

		const linkExists = Enumerable.asEnumerable<GraphLink>(this.links)
			.Any(link =>
				 ((link.source.id === firstNodeId) && (link.target.id === secondNodeId)) ||
				 ((link.source.id === secondNodeId) && (link.target.id === firstNodeId))
			);
		if (linkExists) return this;
		const newLink = new GraphLink(firstNode, secondNode);
		this.links.push(newLink);
		return this;
	}

	/**
	 * Erases current model by removing all nodes and links.
	 */
	public clearAll(): void {
		this.nodes.clear();
		this.links = [];
		this._selectedNode = null;
	}

	/**
	 * Set viewport size so that root nodes appear in the center of it.
	 * @param width in pixels
	 * @param height in pixels
	 */
	public setViewportSize( width: number, height: number ) {
		this._viewportSize.width = width;
		this._viewportSize.height = height;
	}
}