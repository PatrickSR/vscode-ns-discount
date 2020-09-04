import {
  TreeDataProvider,
  Event,
  TreeItem,
  ProviderResult,
  TreeItemCollapsibleState,
  EventEmitter,
} from "vscode";
import { GameItem } from "./game-item";
import { getFeaturedDiscountList, getGameDetail } from "./api";

export class NsDiscountProvider implements TreeDataProvider<TreeItem> {

  gameDiscount:Array<GameItem | TreeItem> = new Array()
  disCountListOffset:number = 0
  // tree数据改变事件
  private _onDidChangeTreeData: EventEmitter < TreeItem | undefined > =new EventEmitter < TreeItem | undefined > ()
  readonly onDidChangeTreeData: Event < TreeItem | undefined > =this._onDidChangeTreeData.event

  constructor(private workspaceRoot: string | undefined) {
    this.setupDiscountList()
  }

  async setupDiscountList(){
    const list = await getFeaturedDiscountList()
    this.gameDiscount = this.gameDiscount.concat(list)
    this.disCountListOffset = this.gameDiscount.length
    this.refresh()
  }

  getTreeItem(element: GameItem): TreeItem | Thenable<TreeItem> {
    return element;
  }
  getChildren(element?: GameItem): ProviderResult<GameItem[] | TreeItem[]> {
    return new Promise<GameItem[] | TreeItem[]>(async (resolve) => {
      try {
        if(element){
          // 获取详情
          const detail = await getGameDetail(element.id)
          resolve(detail)
        }else {
          if (this.gameDiscount.length >0) {
            // 获取列表
            resolve(this.gameDiscount.concat(this.getMoreTreeItem()))
          }else {
            resolve([new TreeItem(`加载中，请稍后`)])
          }
        }
      } catch (error) {
        resolve([]);
      }
    });
  }

  getMoreTreeItem():TreeItem{
    const more = new TreeItem(`查看更多`,TreeItemCollapsibleState.None)
    more.command = {
      title: `查看更多`,
      command: `nsDiscount.featured.more`
    }
    return more
  }

  loadMoreFeaturedListAction(){
    console.log(`更多`)
    this.loadMoreFeaturedList()
  }

  async loadMoreFeaturedList(){
    const list = await getFeaturedDiscountList(this.disCountListOffset)
    this.gameDiscount = this.gameDiscount.concat(list)
    this.disCountListOffset = this.gameDiscount.length
    this.refresh()
  }

  refresh() {
    this._onDidChangeTreeData.fire(undefined);
  }
}
