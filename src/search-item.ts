import { QuickPickItem } from "vscode";
import { IGame } from "./model";

export interface SearchItem extends QuickPickItem {
  game: IGame;
}

export function buildQuickPickListWithSearch(
  games: Array<IGame>
): Array<SearchItem> {
  const gameSelector = new Array<SearchItem>()

  games.forEach((game:IGame) => {
    gameSelector.push({
      label: game.titleZh,
      description: game.title,
      game
    })
  })

  return gameSelector;
}
