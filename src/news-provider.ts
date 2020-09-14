import {
  TreeDataProvider,
  Event,
  ProviderResult,
  EventEmitter,
  ExtensionContext,
  TextDocumentContentProvider,
  Uri,
  TreeItemCollapsibleState,
  TreeItem, window, ViewColumn, WebviewPanel
} from "vscode";
import { getNewsList, getNewsDetail } from "./api";
import { INews } from "./model";
import { NewsItem } from "./news-item";
import { COMMAND } from "./command";

export class NewsProvider implements TreeDataProvider<NewsItem|TreeItem> {

  list: Array<INews> = new Array()
  page: number = 1

  private _onDidChangeTreeData: EventEmitter < NewsItem | undefined > =new EventEmitter < NewsItem | undefined > ()
  readonly onDidChangeTreeData: Event < NewsItem | undefined > =this._onDidChangeTreeData.event

  constructor(private workspaceRoot: string | undefined, private context: ExtensionContext) {
    this.refreshNews()
  }

  async refreshNews(){
    if(this.list.length > 0){
      this.list = []
      this.refresh()
    }
    const newsList = await getNewsList(this.page)
    this.list = this.list.concat(newsList)
    this.page ++
    this.refresh()
  }

  getTreeItem(element: NewsItem): NewsItem | Thenable<NewsItem> {
    return element;
  }
  getChildren(element?: NewsItem): ProviderResult<NewsItem[] | TreeItem[]> {
    return new Promise<NewsItem[] | TreeItem[]>(async (resolve) => {
      try {
        if(element){

          resolve([])
        }else {
          if(this.list.length > 0){

            let treeList = NewsItem.buildTreeListWithNewsList(this.list)
            treeList = treeList.concat(this.getMoreTreeItem())
            resolve(treeList)
          }else {
            resolve([new TreeItem('加载中', TreeItemCollapsibleState.None)])
          }
        }
      } catch (error) {
        console.error(error)
        resolve([])
      }
    });
  }

  getMoreTreeItem(): TreeItem {
    const more = new TreeItem(`查看更多快报`, TreeItemCollapsibleState.None);
    more.command = {
      title: `查看更多快报`,
      command: COMMAND.NEWS_MORE
    };
    return more;
  }
  
  async loadMoreNews(){
    const newsList = await getNewsList(this.page)
    this.list = this.list.concat(newsList)
    this.page ++
    this.refresh()
  }

  refresh() {
    this._onDidChangeTreeData.fire(undefined);
  }
}

export const NEWS_SCHEME = "ns-news"

export class NewsDetailProvider {
  createDetailWebViewWithDelegate(){
    return (newsId:number)=> {
      this.preSetupArticle(newsId)
    }
  }

  preSetupArticle(newsId:number){
    const plane = window.createWebviewPanel('ns-news', '加载中', ViewColumn.Active,{})
    
    plane.webview.html = `<p>加载中</p>`
    this.setupArticle(newsId, plane)
  }

  async setupArticle(newsId:number, plane: WebviewPanel){
    const news = await getNewsDetail(newsId)
    news.content!.rendered = news.content!.rendered.replace(/\<br \/\>/g, '')
    plane!.title = news.title.rendered
    plane!.webview.html = this.getArticleHtml(news)
  }

  getArticleHtml(news:INews){
    return `
    <html>
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <style>
          p {
            width: 500px;
            font-size: 14px !important;
            line-height: 26px !important;
          }

          img {
            width: 500px;
            height: 282px;
            object-fit: cover;
          }

          .title {
            font-size: 18px !important;
            margin: 10px 0px
          }

          .extra {
            color: #ccc !important;
          }
        </style>
      </head>
      <div style="width: 500px">
        <div class="title">
          ${news.title.rendered}
        </div>

        <div class="extra">
          ${news.date}
        </div>
        <div class="content">
          ${news.content!.rendered}
        </div>
      </div>
    </html>
  `
  }
}