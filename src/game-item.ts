import { TreeItem, TreeItemCollapsibleState, Command } from "vscode";

export class GameItem extends TreeItem {
  constructor(
		public readonly label: string,
		public readonly collapsibleState: TreeItemCollapsibleState,
		public readonly payload: any,
	) {
		super(label, collapsibleState);
	}
	
	get id(): string {
		return this.payload.appid
	}

	get description(): string {
		const x = 100 - Number(this.payload.cutoff)
		const zhDiscount = (x/10).toFixed(1)
		return `${this.payload.title} 【${zhDiscount}折】`
	}

  get tooltip(): string {
		return `${this.label}`;
	}
}