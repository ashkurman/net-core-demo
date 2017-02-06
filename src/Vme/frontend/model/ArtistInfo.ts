export default class ArtistInfo {
//todo: outdated. scrap this class

	private _popularity:    number;
	private _popularityLog: number;
	private _similar:       string[];
	private _tags:          string[];

	public get Popularity() : number {
		return this._popularity;
	}
	public set Popularity( value: number ) {
		this._popularity = value;
		this._popularityLog = Math.log(this._popularity);
	}

	//public get PopularityLogE(): number {
	//	return this._popularityLog = Math.pow( (this._popularity*3)/(4*Math.PI), 1/3 );
	//}

	public get PopularityLogE(): number {
		return Math.sqrt(this._popularity / Math.PI);
	}

	public Name: string;

	public get Similar(): string[] {
		return this._similar || [];
	}

	public get Tags(): string[] {
		return this._tags || [];
	}


	constructor(options?: { name: string; popularity: number, similar?: string[], tags?: string[] }) {
		if (!options)	return;
		this.Name = options.name;
		this.Popularity = options.popularity;
		if ( options.similar ) {
			this._similar = options.similar;
		}
		if ( options.tags ) {
			this._tags = options.tags;
		}
	}
}

