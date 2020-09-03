import { TreeItem, TreeItemCollapsibleState, Command } from "vscode";

export class GameItem extends TreeItem {
  constructor(
		public readonly label: string,
		public readonly collapsibleState: TreeItemCollapsibleState,
		public readonly command?: Command
	) {
		super(label, collapsibleState);
  }
  get tooltip(): string {
		return `${this.label}`;
	}
}