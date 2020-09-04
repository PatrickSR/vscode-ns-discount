// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from 'vscode';
import { NsDiscountProvider } from './ns-discount-provider';
import { NsDiscountTreeView } from './ns-discount-treeview';
import { GameItem } from './game-item';

export function activate(context: vscode.ExtensionContext) {
	const nsDiscountProvider = new NsDiscountProvider(vscode.workspace.rootPath);
	vscode.window.registerTreeDataProvider('nsDiscount', nsDiscountProvider);
	// new NsDiscountTreeView<GameItem | vscode.TreeItem>(context, nsDiscountProvider)
  context.subscriptions.push(vscode.commands.registerCommand('nsDiscount.featured.more', ()=>{nsDiscountProvider.loadMoreFeaturedListAction()}));
}

export function deactivate() {}
