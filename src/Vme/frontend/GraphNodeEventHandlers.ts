import {GraphNode} from 'src/GraphNode';

/**
 * Describes all currently supported event handlers that can be attached to each gragh node element in a DOM.
 */
export default class GraphNodeEventHandlers {
	public onClicked:     (node: GraphNode) => void;
	public onDragStarted: (node: GraphNode) => void;
	public onDragging:    (node: GraphNode) => void;
	public onDragEnded:   (node: GraphNode) => void;
	public onMouseIn:     (node: GraphNode) => void;
	public onMouseOut:    (node: GraphNode) => void;
}