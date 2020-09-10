import { TreeItem, TreeItemCollapsibleState } from "vscode";
import { IGame, IPrice, INews } from "./model";
import { COMMAND } from "./command";

export class NewsItem extends TreeItem {
  constructor(
		public readonly news: INews,
		public readonly collapsibleState: TreeItemCollapsibleState,
	) {
    super(`${news.title.rendered} - ${news.time}`, collapsibleState)
    this.command = {
      title: "加载文章",
      command: COMMAND.NEWS_SHOW,
      arguments: [news.id]
    }
  }
  
  
	get id(): string {
		return `${this.news.id}`
  }
  
  static buildTreeListWithNewsList(news: Array<INews>): Array<TreeItem>{
    const list = new Array<TreeItem>();
    news.forEach((news: INews) => {
      list.push(new NewsItem(news, TreeItemCollapsibleState.None));
    })
    return list
  }
}