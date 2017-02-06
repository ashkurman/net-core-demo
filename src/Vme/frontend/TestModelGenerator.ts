import * as Enumerable from 'linq-es2015';
import * as Collections from 'typescript-collections';

import ArtistInfo from 'src/ArtistInfo';
import { GraphNode } from 'src/GraphNode';
import { GraphLink } from 'src/GraphLink';


/* Generates graph data for testing/experiments */
export default class TestModelGenerator {
	public static GenerateArtists(): ArtistInfo[] {
		return [
			new ArtistInfo({ name: 'This Morn\' Omina', popularity: 626700, similar: ['Geomatic', 'Na-Hag', 'Flint Glass'] }),
			new ArtistInfo({ name: 'Geomatic', popularity: 426000, similar: ['Flint Glass'] }),
			new ArtistInfo({ name: 'Cities Last Broadcast', popularity: 157000, similar: ['Black Mountain Transmitter', 'Geomatic'] }),
			new ArtistInfo({ name: 'Black Mountain Transmitter', popularity: 9167, similar: ['Lustmord'] }),
			new ArtistInfo({ name: 'Lustmord', popularity: 2600000, similar: ['Black Mountain Transmitter'] }),
			new ArtistInfo({ name: 'Access To Arasaka', popularity: 1800000, similar: ['Cities Last Broadcast', 'Hecq'] }),
			new ArtistInfo({ name: 'Flint Glass', popularity: 213000, similar: ['Access To Arasaka', 'Antigen Shift'] }),
			new ArtistInfo({ name: 'Na-Hag', popularity: 56100, similar: ['Antigen Shift', 'Geomatic'] }),
			new ArtistInfo({ name: 'Antigen Shift', popularity: 123000, similar: ['Hecq', 'Undermathic'] }),
			new ArtistInfo({ name: 'Hecq', popularity: 2000000, similar: ['Flint Glass'] }),
			new ArtistInfo({ name: 'Undermathic', popularity: 180000, similar: ['Undermathic', 'Totakeke'] }),
			new ArtistInfo({ name: 'Totakeke', popularity: 383200, similar: ['MEGAPOPULAR'] }),
			new ArtistInfo({ name: 'MEGAPOPULAR', popularity: 430000000 }),
			new ArtistInfo({ name: 'Bodh Gaya', popularity: 14000, similar: ['Digital Sun'] }),
			new ArtistInfo({ name: 'Digital Sun', popularity: 6813, similar: ['Bodh Gaya'] }),
			new ArtistInfo({ name: 'Hmot', popularity: 55500, similar: ['Moa Pillar'] }),
			new ArtistInfo({ name: 'Moa Pillar', popularity: 164000, similar: ['Moa Pillar'] }),
			new ArtistInfo({ name: 'Pixelord', popularity: 386900, similar: ['Moa Pillar', 'DZA'] }),
			new ArtistInfo({ name: 'DZA', popularity: 331500, similar: ['Moa Pillar', 'Pixelord'] })
		];
	}

	public static GenerateArtists2(): ArtistInfo[] {
		return [
			new ArtistInfo({ name: 'Nanocult', popularity: 20600})
		];
	}

	//public static assembleVmeGraph(artists: ArtistInfo[]): { nodes: Map<string,GraphNode>, links: GraphLink[] } {
	//	const nodes = this.createArtistsNodes(artists);
	//	const links = TestModelGenerator.extractUniqueLinks(nodes);
	//	return { nodes: nodes, links: links };
	//}

	//private static extractUniqueLinks(nodes: Map<string, GraphNode>): GraphLink[] {

	//	const markedLinks = new Collections.Dictionary<string, Set<string>>();
	//	const uniqueLinks = new Array<GraphLink>();

	//	for (let baseNode of nodes.values()) {
	//		const baseArtist: string = baseNode.id;

	//		if ( !markedLinks.containsKey(baseArtist))	// register artist as link node
	//			markedLinks.setValue(baseArtist, new Set());

	//		// traverse all related artists and register them as outgoing links (if they dont already)
	//		for (let relatedArtist of baseNode.data.Similar ) {
	//			const relatedNode = nodes.get(relatedArtist);
	//			if (!relatedNode) continue;//skip related artists that aren't in the graph.

	//			// does related artist has it's own links in graph?
	//			if ( markedLinks.containsKey( relatedArtist )) {
	//				//check if it already links to current baseArtist
	//				if (markedLinks.getValue(relatedArtist).has(baseArtist))
	//					continue; //yes, we already have this link. dont register the duplicate.
	//			}

	//			markedLinks.getValue(baseArtist).add(relatedArtist);

	//			const link = new GraphLink(baseNode, relatedNode);
	//			uniqueLinks.push(link);
	//		}
	//	}
	//	return uniqueLinks;
	//}

	private static createArtistsNodes(artists: ArtistInfo[]): Map<string, GraphNode> {
		const nodes: Map<string, GraphNode> = Enumerable
			.asEnumerable(artists)
			.Select(artist => new GraphNode(artist as ArtistInfo))
			.ToDictionary(
				node => node.id, //artist name as key
				node => node); // GraphNode containing artist data as value
		return nodes;
	}
}