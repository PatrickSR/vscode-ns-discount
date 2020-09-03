import { ExtensionContext, window, commands, TreeDataProvider } from "vscode";

export class NsDiscountTreeView<T> {

	constructor(context: ExtensionContext, provider: TreeDataProvider<T>) {
		const view = window.createTreeView('nsDiscount', { treeDataProvider: provider, showCollapseAll: true });
		
	}
}