import VmeNodeEventHandlers from 'GraphNodeEventHandlers';
import {GraphLink} from 'src/GraphLink';
import {GraphNode} from 'src/GraphNode';


/**
 * Describes how to construct and manipulate graph's DOM representation
 */
interface IGraphBuilder {
	rebuildLinks(graphLinks: GraphLink[]): void;
	rebuildNodes(nodesData: GraphNode[], eventHandlers?: VmeNodeEventHandlers): void;
	clearAll(): void;
	insertViewportContainer(container: SVGElement): SVGGElement;
	insertGraphNodesContainer(container: SVGElement, className: string): SVGGElement;
	insertGraphLinksContainer(container: SVGElement, className: string): SVGGElement;
}

export default IGraphBuilder;