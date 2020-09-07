import {
  TreeDataProvider,
  Event,
  TreeItem,
  ProviderResult,
  EventEmitter,
  ExtensionContext,
  TreeItemCollapsibleState,
} from "vscode";
import { IGame } from "./model";
import { GameItem } from "./game-item";
import { getGameDetail } from "./api";

const WISH_GAME_LIST_KEY = 'WISH_GAME_LIST'

export class SubscribeProvider implements TreeDataProvider<TreeItem> {

  private wishGameList:Array<IGame> = []

  private _onDidChangeTreeData: EventEmitter < TreeItem | undefined > =new EventEmitter < TreeItem | undefined > ()
  readonly onDidChangeTreeData: Event < TreeItem | undefined > =this._onDidChangeTreeData.event

  constructor(private workspaceRoot: string | undefined, private context: ExtensionContext) {
    this.wishGameList = context.globalState.get(WISH_GAME_LIST_KEY, new Array<IGame>())
    console.log(`当前关注`, this.wishGameList)
  }

  addWishGame(game: IGame){
    this.wishGameList.push(game)
    this.syncGlobalState()
    this.refresh()
  }

  removeWishGame(id: string){
    const wishGameIndex = this.wishGameList.findIndex((game)=>game.appid === id)
    wishGameIndex !== -1 && this.wishGameList.splice(wishGameIndex, 1)
    this.syncGlobalState()
    this.refresh()
  }

  syncGlobalState(){
    this.context.globalState.update(WISH_GAME_LIST_KEY,this.wishGameList)
  }

  getTreeItem(element: TreeItem): TreeItem | Thenable<TreeItem> {
    return element;
  }
  getChildren(element?: GameItem): ProviderResult<GameItem[] | TreeItem[]> {
    return new Promise<GameItem[] | TreeItem[]>(async (resolve) => {
      try {
        if(element){
          // 获取详情
          const { game, prices } = await getGameDetail(element.id);

          resolve(GameItem.buildTreeDetailWithGameInfo(game, prices));

        }else {
          resolve(GameItem.buildTreeListWithGameList(this.wishGameList))
        }
      } catch (error) {
        console.error(error)
        resolve([])
      }
    });
  }

  refresh() {
    this._onDidChangeTreeData.fire(undefined);
  }
}
