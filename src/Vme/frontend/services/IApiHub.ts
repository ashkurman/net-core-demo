class ArtistInfoDto {
	public Title: string;
	public Listeners: number;
	public Playbacks: number;
	public Tags: string[];
}

interface IApiHub {
	ping(): JQueryPromise<string>;
	getSimilarArtists(baselineArtistTitle: string, limit: number | null): JQueryPromise<string[]>;
	getArtistInfo(artistName: string): JQueryPromise<ArtistInfoDto>;
}