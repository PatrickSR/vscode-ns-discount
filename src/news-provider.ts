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
import { parse } from 'node-html-parser'
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
    this.setup()
  }

  async setup(){
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
          let treeList = NewsItem.buildTreeListWithNewsList(this.list)
          treeList = treeList.concat(this.getMoreTreeItem())
          resolve(treeList)
        }
      } catch (error) {
        console.error(error)
        resolve([])
      }
    });
  }

  getMoreTreeItem(): TreeItem {
    const more = new TreeItem(`查看更多`, TreeItemCollapsibleState.None);
    more.command = {
      title: `查看更多`,
      command: COMMAND.NEWS_MORE
    };
    return more;
  }
  

  refresh() {
    this._onDidChangeTreeData.fire(undefined);
  }
}

export const NEWS_SCHEME = "ns-news"

export class NewsDetailProvider {
  plane:WebviewPanel|undefined
  createDetailWebViewWithDelegate(){
    return (newsId:number)=> {
      this.preSetupArticle(newsId)
    }
  }

  preSetupArticle(newsId:number){
    if(!this.plane){
      this.plane = window.createWebviewPanel('ns-news', '加载中', ViewColumn.Active,{})
    }
    this.plane.webview.html = `<p>加载中</p>`
    this.setupArticle(newsId)
  }

  async setupArticle(newsId:number){
    const news = await getNewsDetail(newsId)
    news.content!.rendered = news.content!.rendered.replace(/\<br \/\>/g, '')
    this.plane!.title = news.title.rendered
    this.plane!.webview.html = this.getArticleHtml(news)
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