import VmeTools    from 'MathTools';
import {GraphNode} from 'src/GraphNode';


/**
 * Allows to create graph nodes based on some other data structures
 */
export default class GraphNodeFactory {
	public static createFromArtistInfo( artistInfo: ArtistInfoDto ) {
		return new GraphNode(<GraphNode>{
			id:     artistInfo.Title,
			title:  artistInfo.Title,
			radius: VmeTools.calculateSphereRadiusFromVolume(artistInfo.Listeners),
			tooltip: artistInfo.Tags.join(', ')
		});
	}
}