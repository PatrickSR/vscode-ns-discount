// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from "vscode";
import { FeaturedProvider } from "./featured-provider";
import { SubscribeProvider } from "./subscribe-provider";
import { searchGame } from "./api";
import { SearchItem, buildQuickPickListWithSearch } from "./search-item";
import { GameItem } from "./game-item";
import { NEWS_SCHEME, NewsDetailProvider, NewsProvider } from "./news-provider";
import { COMMAND } from "./command";

let searchTimeout: NodeJS.Timeout | undefined = undefined;

export function activate(context: vscode.ExtensionContext) {
  try {
    const featuredProvider = new FeaturedProvider(vscode.workspace.rootPath);
    const subscribeProvider = new SubscribeProvider(
      vscode.workspace.rootPath,
      context
    )

    const newsProvider = new NewsProvider(vscode.workspace.rootPath, context)

    vscode.window.registerTreeDataProvider("featured", featuredProvider);
    vscode.window.registerTreeDataProvider("subscribe", subscribeProvider);
    vscode.window.registerTreeDataProvider("ns-news",newsProvider)


    vscode.workspace.registerTextDocumentContentProvider(
      NEWS_SCHEME,
      new NewsDetailProvider()
    );

    const previewNews = vscode.commands.registerCommand(
      COMMAND.NEWS_SHOW,
      async (newsId) => {
        let uri = vscode.Uri.parse(`${NEWS_SCHEME}:${newsId}.ts`);

        let doc = await vscode.workspace.openTextDocument(uri); // calls back into the provider
        await vscode.window.showTextDocument(doc, { preview: false,  });
      }
    );

    context.subscriptions.push(previewNews);

    // 加载更多折扣游戏
    const featuredMore = vscode.commands.registerCommand(
      COMMAND.FEATURED_MORE,
      () => {
        featuredProvider.loadMoreFeaturedListAction();
      }
    );

    // 添加关注的游戏
    const addWishGame = vscode.commands.registerCommand(
      COMMAND.SUBSCRIBE_ADD,
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
    );

    // 移除关注的游戏
    const removeWishGame = vscode.commands.registerCommand(
      COMMAND.SUBSCRIBE_REMOVE,
      (gameItem: GameItem) => {
        subscribeProvider.removeWishGame(gameItem.game.appid);
      }
    );

    // 刷新关注的游戏
    const rereshWishGame = vscode.commands.registerCommand(
      COMMAND.SUBSCRIBE_REFRESH,
      () => {
        subscribeProvider.refreshWishGames();
      }
    );

    context.subscriptions.push(featuredMore);
    context.subscriptions.push(addWishGame);
    context.subscriptions.push(removeWishGame);
    context.subscriptions.push(rereshWishGame);
  } catch (error) {
    console.error(error);
  }
}

export function deactivate() {}
