import * as ko from 'knockout';

export default class AppViewModel {
	public searchString = ko.observable<string>();

	public onSearch: (searchString: string) => void;

	constructor() {
		this.searchString.subscribe(
			newValue => this.onSearch(newValue)
		);
	}
}