import { TreeDataProvider, Event, TreeItem, ProviderResult } from "vscode";
import { GameItem } from "./game-item";

export class NsDiscountProvider implements TreeDataProvider<GameItem> {
  onDidChangeTreeData?: Event<void | GameItem | null | undefined> | undefined;

  constructor(private workspaceRoot: string| undefined) {}

  getTreeItem(element: GameItem): TreeItem | Thenable<TreeItem> {
    return element;
  }
  getChildren(element?: GameItem): ProviderResult<GameItem[]> {
    return [];
  }
}
