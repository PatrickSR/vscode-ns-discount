// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from "vscode";
import { FeaturedProvider } from "./featured-provider";
import { SubscribeProvider } from "./subscribe-provider";
import { searchGame } from "./api";
import { SearchItem, buildQuickPickListWithSearch } from "./search-item";
import { IGame } from "./model";
import { GameItem } from "./game-item";

let searchTimeout: NodeJS.Timeout | undefined = undefined;

export function activate(context: vscode.ExtensionContext) {
  try {
    const featuredProvider = new FeaturedProvider(vscode.workspace.rootPath);
    const subscribeProvider = new SubscribeProvider(
      vscode.workspace.rootPath,
      context
    );

    vscode.window.registerTreeDataProvider("featured", featuredProvider);
    vscode.window.registerTreeDataProvider("subscribe", subscribeProvider);

    const featuredMore = vscode.commands.registerCommand(
      "nsDiscount.featured.more",
      () => {
        featuredProvider.loadMoreFeaturedListAction();
      }
    );

    const addWishGame = vscode.commands.registerCommand(
      "nsDiscount.subscribe.add",
      async () => {
        const input = vscode.window.createQuickPick<SearchItem>();
        input.placeholder = `请输入想关注的游戏`;

        input.onDidChangeValue((val: string) => {
          if (searchTimeout) {
            clearTimeout(searchTimeout);
          }
          searchTimeout = setTimeout(async () => {
            const games = await searchGame(val);
            input.items = buildQuickPickListWithSearch(games);
          }, 1000);
        });

        input.onDidChangeSelection((items) => {
          const selected = items[0];
          const { game } = selected;
          subscribeProvider.addWishGame(game);
          input.hide();
        });

        input.show();
        // console.log(res)
      }
    )

    const removeWishGame = vscode.commands.registerCommand('nsDiscount.subscribe.remove', (gameItem:GameItem)=> {
      subscribeProvider.removeWishGame(gameItem.game.appid)
    })

    const rereshWishGame = vscode.commands.registerCommand('nsDiscount.subscribe.refresh', ()=>{
      subscribeProvider.refreshWishGames()
    })

    context.subscriptions.push(featuredMore);
    context.subscriptions.push(addWishGame);
    context.subscriptions.push(removeWishGame)
    context.subscriptions.push(rereshWishGame)
  } catch (error) {
		console.error(error)
	}
}

export function deactivate() {}
