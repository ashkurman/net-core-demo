import * as $ from 'jquery';
import 'signalr';
import * as d3 from 'd3';
import * as Enumerable from 'linq-es2015';
import * as ko from 'knockout';

import TestModelGenerator     from 'src/TestModelGenerator';
import ArtistInfo             from 'src/ArtistInfo';
import GraphModel             from 'src/GraphModel';
import {GraphNode}            from 'src/GraphNode';
import {GraphLink}            from 'src/GraphLink';
import AppViewModel           from 'src/viewModel/AppViewModel';     //todo: flatten this path in tsconfig
import IGraphBuilder          from 'src/IGraphBuilder';
import GraphNodeEventHandlers from 'src/GraphNodeEventHandlers';
import SvgGraphBuilder        from 'src/SvgGraphBuilder';
import VmeTools               from 'src/MathTools';
import ApiConnection          from 'src/services/ApiConnection';
import GraphNodeFactory       from 'src/GraphNodeFactory';


export class App {
//todo: refactor this monster with solid in mind


	/**
	 * Interval time in ms between calls to server api. Temporary solution until server-side throttling to last.fm is done.
	 */
	private static _LASTFM_API_DELAY= 100; //todo: move this out to related service

	/** Tuning constant. Tells how strongly graph nodes are attracted/repelled from each other */
	private _FORCE_SCALE:               number    =     0.3;
	/** Tuning constant. Tells how much space is spawned between the nodes. */
	private _SPACE_SCALE:               number    =     0.5;
	/** Tuning constant. Allows to make graph nodes bigger/smaller.  */
	private _NODE_SIZE_SCALE:           number    =     1.0;
	private _NODE_COLLISION_AURA_SCALE: number    =     2.5;
	private _NODE_LINK_SCALE:           number    =     4.0;

	private _api: IApiHub;
	private _simulation: d3.Simulation<GraphNode, GraphLink>;
	private _graphModel: GraphModel = new GraphModel();
	private _linksSelector: d3.Selection<SVGGElement, GraphLink, SVGElement, any>;
	private _nodesSelector: d3.Selection<SVGGElement, GraphNode, SVGElement, any>;
	private _graphBuilder: IGraphBuilder;
	/** All artists that are present in a graph. Mapped by their name which corresponds to node's id. */
	private _artists: Map<string, ArtistInfoDto> = new Map();

	private _apiConnection: ISignalrConnection;

	public lastFmEnabled: boolean = false;



	private setupViewModel(): void {
		const viewModel = new AppViewModel();
		viewModel.onSearch = async (searchString) => {
			try {
				if (!this.lastFmEnabled) return;
				console.log(`Search for artist: ${searchString}`);
				await this.loadRootArtist(searchString);
				this.updateGraph(this._simulation, this._graphModel, this._graphBuilder);
			} catch (error) {
				console.error(`Unexpected error while searching for artist from a navbar: ${error}`);
			}

		};
		ko.applyBindings( viewModel );
	}

	private getGraphLinksSelectorWithData( linksContainer: SVGGElement ): d3.Selection<SVGGElement, GraphLink, SVGElement, Object> {
		const svgLinksG = d3.select(linksContainer);
		const linksSelector = (
			svgLinksG
				.selectAll()
				.data<GraphLink>(this._graphModel.links, (link: GraphLink) => link.id )
		);
		return <any> linksSelector;
	}

	private getDataSelectionFromContainer
		<TData, TContainer extends Element>
		(container: TContainer, data: TData[], dataKeyFunc: (datum: TData) => string )
		: d3.Selection<TContainer, TData, Element, any>
	{
		const containerSelector = d3.select(container);
		const dataSelector = containerSelector
			.selectAll()
			.data(data, dataKeyFunc);
		return <any> dataSelector;
	}

	public async Run(): Promise<void> {

		this.setupViewModel();

		this._apiConnection = new ApiConnection();
		const apiConnectingTask = this._apiConnection.connect();

		//todo: generate random graph when api is not available
		//{
		//	const artists = TestModelGenerator.GenerateArtists2();
		//	const graph = TestModelGenerator.assembleVmeGraph(artists);
		//	this._graphModel.nodes = graph.nodes;
		//	this._graphModel.links = graph.links;
		//}

		this._simulation = this.initSimulation(this.processTick);

		const svg = d3.select<HTMLDivElement, any>('#screen')
			.append<SVGSVGElement>('svg');

		//todo: screen dimensions must be updated when browser window is resized.
		const screen = {
			width: +svg.style('height').replace('px', ''),
			height: +svg.style('width').replace('px', '')
		}
		this._graphModel.setViewportSize(screen.width, screen.height);
		this._graphBuilder = new SvgGraphBuilder(this._NODE_SIZE_SCALE);

		const graphContainer = this._graphBuilder.insertViewportContainer(<SVGElement>svg.node());
		const linksContainer = this._graphBuilder.insertGraphNodesContainer(graphContainer, 'links');
		const nodesContainer = this._graphBuilder.insertGraphNodesContainer(graphContainer, 'nodes');
		this._linksSelector = this.getDataSelectionFromContainer(linksContainer, this._graphModel.links, link => link.id);
		this._nodesSelector = this.getDataSelectionFromContainer(nodesContainer, this._graphModel.getNodesArray(), node => node.id);


		var self = this;
		this.updateGraph( this._simulation, this._graphModel, this._graphBuilder);

		try {
			await apiConnectingTask;
			this._api = this._apiConnection.getApi();
			console.debug('signalr STARTED!');
		}
		catch (err) {
			 console.error(`SignalR failed to start: ${err}`);
		}
	}


	/**
	 * Updates graph's DOM and 'reheats' the forces simulation.
	 * - New elements in graph model get their DOM elements
	 * - Graph starts to move as a result of simulation reheating
	 */
	private updateGraph( simulation: d3.Simulation<GraphNode, GraphLink>, graphModel: GraphModel, graphBuilder: IGraphBuilder) {

		const handlers = new GraphNodeEventHandlers();
		handlers.onClicked     = onNodeClick;
		handlers.onDragStarted = dragstarted;
		handlers.onDragging    = dragged;
		handlers.onDragEnded   = dragended;
		handlers.onMouseIn     = onNodeMouseOver;
		handlers.onMouseOut = onNodeMouseOut;

		// update graph nodes & links DOM
		graphBuilder.rebuildLinks(graphModel.links);
		graphBuilder.rebuildNodes(graphModel.getNodesArray(), handlers);

		// setup graph force simulation to take into account any new nodes and potentially changed tuning variables.
		this.updateSimulation(simulation, this._FORCE_SCALE, this._SPACE_SCALE);

		// turn on forces recalulation and allow graph  to take the least energetic position.
		simulation.alpha(0.1).alphaTarget(0).restart();
		var self = this;

		function onNodeClick(node: GraphNode): void {
		//	self.generateAndAddRandomNodesToGraph( node ); //todo: enable when apikey not specified
			self.requestSimilarArtists(node.title)
				.then(artists => {
					artists.forEach(artist => self.addArtist(artist, [node.title], node.title));
					self.updateGraph( simulation, graphModel, graphBuilder );
				});
		//	updateGraph();
			self.selectNode(node);
			simulation.stop();
		}

		let svgHighlightedLinksG: any = null;
		let svgHighlightedNodesG: any = null;
		let isDragging = false; // todo: move dagging state to GraphModel
		function onNodeMouseOver(node: GraphNode): void {
		//todo: refactor into 'highlight node neighbours' in graphBuilder
			if (isDragging)
				return;
			const connectedLinksG = d3.selectAll('.link').filter((d: GraphLink) => d.source === node || d.target === node);
			const connectedLinks = Enumerable.AsEnumerable(connectedLinksG.data());
			const connectedNodes = connectedLinks
				.SelectMany( (link: GraphLink) => [link.source, link.target])
				.Distinct();
			const connectedNodesG = d3.selectAll('.node').filter(node_ => connectedNodes.Contains(node_));

			connectedLinksG.classed('link--highlighted', true);
			connectedNodesG.classed('node--highlighted', true);
			svgHighlightedLinksG = connectedLinksG;
			svgHighlightedNodesG = connectedNodesG;
		}

		function onNodeMouseOut(node: GraphNode): void {
			if (isDragging) return;
			if (svgHighlightedLinksG) svgHighlightedLinksG.classed('link--highlighted', false);
			if (svgHighlightedNodesG) svgHighlightedNodesG.classed('node--highlighted', false);
			svgHighlightedLinksG = null;
			svgHighlightedNodesG = null;
		}

		function dragstarted(node: GraphNode): void {
			isDragging = true;
			if (!d3.event.active) simulation.alphaTarget(0.3).restart();
			node.fx = node.x;
			node.fy = node.y;
		}

		function dragged(node: GraphNode): void {
			// pinning the node and moving it with the cursor
			node.fx = d3.event.x;
			node.fy = d3.event.y;
		}

		function dragended(node: GraphNode): void {
			isDragging = false;

			// allow simulation iterations to decay over time to 0. this will gradually slow down
			// graph rebalancing to a halt. (user should not catch artists with a mouse)
			if (!d3.event.active) simulation.alphaTarget(0);

			// we must unpin the node when it is no longer being dragged
			node.fx = null;
			node.fy = null;
		}
	}


	private initSimulation( tickListener: () => void): d3.Simulation<GraphNode, GraphLink> {
		const simulation = d3.forceSimulation<GraphNode, GraphLink>();
		simulation.on('tick', tickListener);
		return simulation;
	}

	/** D3 runs graph simulation with iterations. On each iteration nodes positions gets recalculated.
	* This method updates the DOM to correspond to current state of graph simulation. */
	private processTick(): void {
		d3.selectAll('.link__line')
			.attr('x1', (link: GraphLink) => link.source.x)
			.attr('y1', (link: GraphLink) => link.source.y)
			.attr('x2', (link: GraphLink) => link.target.x)
			.attr('y2', (link: GraphLink) => link.target.y);

		d3.selectAll('.node')
			.attr('transform', (node: GraphNode) => `translate(${[node.x, node.y]})`);
	}

	/**
	 * Updates d3's graph simulation: add/remove noes and links, change tuning variables.
	 */
	private updateSimulation(simulation: d3.Simulation<GraphNode, GraphLink>, forceScale: number, spaceScale: number) {
	// todo: get nodes and links and tuning variables as method parameters.
		simulation
			.nodes(Array.from(this._graphModel.nodes.values()))
			.force('link',
			// make graph links to hold together the nodes.
			d3.forceLink(this._graphModel.links)
				.strength(1)
				.distance(link => (link.source.radius + link.target.radius) * this._NODE_LINK_SCALE + 10))
			.force('center', d3.forceCenter(screen.width / 2, screen.height / 2))
			// make graph nodes to be repelled from each on a large scale other to allow the graph to spred out
			.force('repel',
				d3.forceManyBody()
					.strength(-6000 * forceScale)
					.distanceMax(2000 * spaceScale)
				.distanceMin(1))
			// make graph nodes repel from each other on a short distances with big force proportional to node's radius.
			// this will prevent the nodes from overlapping.
			.force('collide',
				d3.forceCollide((node: GraphNode) => node.radius * this._NODE_COLLISION_AURA_SCALE));
	}

	public async loadRootArtist(artistName: string, relatedArtistsCount?: number ): Promise<void> {
		try {
			const rootArtist = await this.requestArtist(artistName);
			if (!rootArtist) {
				//todo: viewModel -> this artist is not found, try another one
				return;
			}
			const similarArtists = await this.requestSimilarArtists(artistName, relatedArtistsCount || 8 );
			if (!similarArtists) {
				//todo: viewModel -> no similar artists found, thy another artist
				return;
			}
			this._graphModel.clearAll();
			this.resetScreenPosition();
			this.addArtist(rootArtist);
			similarArtists.forEach(artist =>
				this.addArtist(artist, [rootArtist.Title], rootArtist.Title));
		}
		catch (error) {
			console.error(`Unexpected error in 'loadRootArtist': ${error}`);
		}
	}

	//todo: move this out to api services
	public async requestArtist( artistName: string ): Promise<ArtistInfoDto> {
		try {
			const artistDto: ArtistInfoDto | undefined = await this._api.getArtistInfo(artistName);
			return artistDto || <any> null;
		}
		catch (error) {
			console.error(`Unexpected error in 'requestArtist': ${error}`);
			return <any> null;
		}
	}

	//todo: move this out to api services
	private async requestSimilarArtists(artistId: string, limit: number = 5): Promise<ArtistInfoDto[]> {
		try {
			const similarArtists: ArtistInfoDto[] = [];

			const similarArtistsIds: string[] = await this._api.getSimilarArtists(artistId, limit) || [];

			// check if some of similar artists are already in the graph
			for (let similarArtistId of similarArtistsIds) {
				if (!similarArtistId) continue; // ignore null artists, just in case

				if (this._graphModel.nodes.has(similarArtistId)) {
				/* the graph already has a node for a similar artist. Find associated artist data */
					const node = this._graphModel.nodes.get(similarArtistId);
					if (!node) continue; //todo: log if this ever hits
					const existingArtistData = this._artists.get(node.id);
					if (!existingArtistData) continue; //todo: log if this ever hits
					similarArtists.push(existingArtistData);
					continue;
				}

				/* similar artist does not present in the graph. Get info about him from the API */
				await this.setTimeoutAsync(App._LASTFM_API_DELAY); // note: for now i do timeout between requests manually while server-side delays to last.fm api not implemented.
				const artistInfoDto: ArtistInfoDto | undefined = await this._api.getArtistInfo(similarArtistId);
				if (!artistInfoDto) continue;

				similarArtists.push(artistInfoDto);
			}
			return similarArtists;
		}
		catch (error) {
			console.error(`unexpected error in 'requestSimilarArtists': ${error}`);
			return [];
		}
	}

	private generateAndAddRandomNodesToGraph(graphNode: GraphNode): void {
	//todo: move this to services to some data generator
		const artists = new Array<string>(5);
		for (var i = 0; i < 5; i++) {
			const number = Math.floor(Math.random() * 99999) + 10000;
			const artistName: string = String(number);
			artists.push(artistName);
		}
		artists.forEach(
			artist => this._graphModel
				.createAndAddNode(artist)
				.addLink(graphNode.id, artist));
	}

	private selectNode(node: GraphNode): void {
	//todo: move this to GraphBuilder
		const deselectedNode = this._graphModel.selectedNode;
		this._graphModel.selectedNode = node;
		d3.selectAll<SVGGElement, GraphNode>('.node')
			.filter(datum => datum === node || datum === deselectedNode)
			.classed('selected', (datum: GraphNode) => {
				if (!this._graphModel.selectedNode) return false;
				return this._graphModel.selectedNode === datum;
			});
	}

	/**
	 * Just a normal setTimeout that you can await for
	 * @param ms milliseconds to wait
	 */
	private setTimeoutAsync(ms: number): Promise<void> {
		return new Promise<void>(resolve => setTimeout(resolve, ms));
	}

	/**
	* Adds new artist node to the graph
	* @param artist
	* @param linkedArtists To which nodes in the graph this artist visually connects.
	* @param rootArtist Specify existing artist from which new artist will visually emerge.
	*/
	private addArtist(artist: ArtistInfoDto, linkedArtistsIds?: string[], rootArtistId?: string): void {
	//todo: move this inside a graph model
		const newNode = GraphNodeFactory.createFromArtistInfo(artist);
		this._artists.set(artist.Title, artist);
		this._graphModel.addNode(newNode, rootArtistId);
		if ( linkedArtistsIds ) {
			linkedArtistsIds.forEach(
				linkedArtistId => this._graphModel.addLink(newNode.id, linkedArtistId));
		}
	}

	/**
	 * Focuses the screen at coordinates (0;0) and resets the zoom level to 1.0
	 */
	private resetScreenPosition() {
		d3.select<SVGGElement, any>('#graph-transform-container')
			.attr('transform', `translate(${0}, ${0}) scale(${1})`);
	}
}