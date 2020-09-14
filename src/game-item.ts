import { TreeItem, TreeItemCollapsibleState } from "vscode";
import { IGame, IPrice } from "./model";

export class GameItem extends TreeItem {
  constructor(
		public readonly game: IGame,
		public readonly collapsibleState: TreeItemCollapsibleState,
	) {
    super(game.titleZh, collapsibleState);
    this.id = this.game.appid
    this.tooltip = `${this.label}`


		let zhDiscount = undefined
		if(this.game.cutoff){
			const x = 100 - Number(this.game.cutoff)
			zhDiscount = (x/10).toFixed(1)
		}
		this.description = `${this.game.title? this.game.title : this.game.titleZh} ${zhDiscount ?`【${zhDiscount}折】`:''}`

  }
  
	static buildTreeListWithGameList(games: Array<IGame>): Array<TreeItem>{
    const list = new Array<TreeItem>();
    games.forEach((game: IGame) => {
      list.push(new GameItem(game, TreeItemCollapsibleState.Collapsed));
    })
    return list
  }

  static buildTreeDetailWithGameInfo(game:IGame, prices: Array<IPrice>): Array<TreeItem>{

    const displayDetail = new Array<TreeItem>()
    game.detail && displayDetail.push(new TreeItem(`介绍 - ${game.detail}`, TreeItemCollapsibleState.None))
    displayDetail.push(new TreeItem(`中文 - ${game.chineseVer == 1?'是': '否'}`, TreeItemCollapsibleState.None))
    game.leftDiscount && displayDetail.push(new TreeItem(`折扣截止 - ${game.leftDiscount}`, TreeItemCollapsibleState.None))
    displayDetail.push(new TreeItem(`价格表`, TreeItemCollapsibleState.None))

    prices.forEach((price:any) => {
      displayDetail.push(new TreeItem(` |- ${price.country} - ${price.price}RMB`))
    })
    return displayDetail
  }
}