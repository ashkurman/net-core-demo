import 'signalr';

export default class ApiConnection
	implements ISignalrConnection
{
	private _api: IApiHub;

	public isConnected: boolean;

	public async connect(): Promise<void> {
		if (this.isConnected) return;

		const hub = ($.connection as any).apiHub;
		this._api = hub.server;
		try {
			await $.connection.hub.start();
			const pong = await this._api.ping();
			console.debug('SignalR ping ok. Response: ' + pong);
			this.isConnected = true;
		}
		catch (error) {
			console.error(`Failed to establish api connection. Reason: ${error}`);
		}
	}

	getApi(): IApiHub {
		if (!this.isConnected)
			throw new Error('Invalid operation: api connection not established.');

		return this._api;
	}
}