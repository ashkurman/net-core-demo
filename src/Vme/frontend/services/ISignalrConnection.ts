interface ISignalrConnection {
	isConnected: boolean;
	connect(): Promise<void>;
	getApi(): IApiHub;
}