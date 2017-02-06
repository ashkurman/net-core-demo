import * as $ from 'jquery';
import * as d3 from 'd3';

import { GraphLink } from 'src/GraphLink';
import { GraphNode } from 'src/GraphNode';
import IGraphBuilder from 'IGraphBuilder';
import GraphNodeEventHandlers from 'src/GraphNodeEventHandlers';


export default class SvgGraphBuilder implements IGraphBuilder {

	public rebuildLinks(graphLinks: GraphLink[]): void {

		//todo: move out this selection to allow upper DOM structure change in future
		const linksG = d3.select<SVGGElement, GraphLink>('.links').selectAll<SVGGElement, GraphLink>('.link');

		const links = linksG
			.data<GraphLink>(graphLinks, link => link.id);

		// Remove DOM elements that does not have any associated VmeLinks.
		links.exit().remove();

		// get placeholder selection for each GraphLink that does not have any associated DOM elements.
		const newLinks = links.enter();

		// insert new DOM elements into placeholder selection
		const svgLinksEnterG = newLinks.append<SVGGElement>('g');
		svgLinksEnterG
			.classed('link', true);

		const svgLinkLines = svgLinksEnterG.append<SVGLineElement>('line');
		svgLinkLines
			.classed('link__line', true)
			.attr('stroke', '#b0b0b0')
			.attr('stroke-width', '1,10');
	}

	public rebuildNodes(nodesData: GraphNode[], eventHandlers?: GraphNodeEventHandlers): void {

		//todo: move out this selection to allow upper DOM structure change in future
		const svgNodesG = d3.select<SVGGElement, any>('.nodes').selectAll<SVGGElement, GraphNode>('.node');

		const nodes = svgNodesG.data<GraphNode>(nodesData, node => node.id);

		// Remove DOM elements that do not have any associated VmeNodes.
		nodes.exit().remove();

		const newNodes = nodes.enter();

		const svgNodesEnterG = newNodes
			.append<SVGGElement>('g');
		svgNodesEnterG
			.classed('node', true)
			.style('pointer-events', 'visibleFill');

		if (eventHandlers) {
			svgNodesEnterG
				.call(
					(d3.drag()
						.on('start', eventHandlers.onDragStarted)
						.on('drag', eventHandlers.onDragging)
						.on('end', eventHandlers.onDragEnded)
					) as any
				);
			svgNodesEnterG
				.on('click',	 eventHandlers.onClicked)
				.on('mouseover', eventHandlers.onMouseIn)
				.on('mouseout',  eventHandlers.onMouseOut);
		}

		/*-- assemble SVG markup for nodes --*/

		const svgNodeCircles = svgNodesEnterG.append<SVGCircleElement>('circle');
		svgNodeCircles
			.classed('node__body', true)
			.attr('r', node => node.radius * this.nodeSizeScale)
			.attr('fill', 'red');

		const svgNodeTitles = svgNodesEnterG.append<SVGTitleElement>('title');
		svgNodeTitles
			.text((node: GraphNode) => node.tooltip);

		const svgNodeLabels = svgNodesEnterG.append<SVGTextElement>('text');
		svgNodeLabels
			.classed('node__text', true)
			.attr('dx', 12)
			.attr('dy', '.35em')
			.text(node => node.title);
		//.attr('style', 'stroke:#e0e0e0;stroke-width:0.015em; stroke-opacity=0.5;pointer-events:none;');
	}

	public insertViewportContainer(container: SVGElement): SVGGElement {
		const svgRoot = d3.select(container);
		svgRoot.attr('text-rendering', 'optimizeSpeed');
		svgRoot.call(
			d3.zoom()
				.on('zoom', onZoomPan)
		)
		.on('dblclick.zoom', null); // disable zoom-in on double-click;


		const svgRootContainer = svgRoot.append<SVGGElement>('g');
		svgRootContainer.attr('id', 'graph-transform-container');
		let currentZoom = 1.0;
		function onZoomPan() {
			const newZoom = d3.event.transform.k;
			const newX    = d3.event.transform.x;
			const newY    = d3.event.transform.y;
			if ( currentZoom !== newZoom ) {
				(svgRootContainer as any).transition().attr('transform', `translate(${newX}, ${newY}) scale(${newZoom})`);
			}
			else {
				svgRootContainer.attr('transform', `translate(${newX}, ${newY}) scale(${newZoom})`);
			}
			currentZoom = newZoom;
		}

		return <SVGGElement>svgRootContainer.node();
	}

	public insertGraphNodesContainer(container: SVGElement, className: string): SVGGElement {
		const selection = d3.select(container);
		const svgNodesG = selection.append<SVGGElement>('g');
		svgNodesG.classed(className, true);
		return <SVGGElement> svgNodesG.node();
	}

	public insertGraphLinksContainer(container: SVGElement, className: string): SVGGElement {
		const selection = d3.select(container);
		const svgLinksG = selection.append<SVGGElement>('g');
		svgLinksG.classed(className, true);
		return <SVGGElement> svgLinksG.node();
	}

	public clearAll(): void {
		this.rebuildLinks([]);
		this.rebuildNodes([]);
	}

	constructor(public nodeSizeScale: number = 1.0) {}
}