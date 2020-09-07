import { QuickPickItem } from "vscode";

export interface SearchItem extends QuickPickItem {
  game: any
}