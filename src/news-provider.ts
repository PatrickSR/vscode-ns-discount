import {
  TreeDataProvider,
  Event,
  ProviderResult,
  EventEmitter,
  ExtensionContext,
  TextDocumentContentProvider,
  Uri,
  TreeItemCollapsibleState,
  TreeItem,
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

export class NewsDetailProvider implements TextDocumentContentProvider{
  
  parseNewsContent(news:INews): string{
    if(!news.content || !news.content.rendered) return ''
    let content = ``
    const root = parse(news.content.rendered)
    const pArray = root.querySelectorAll('P')
    content += 'const content = `'
    this.addLine()
    pArray.forEach(p => {
      content += p.innerHTML
      content += '\n\n'
    })
    content += '`'
    return content
  }

  parseNewsTitle(news:INews): string {
    return `const title = '${news.title.rendered}'`
  }

  parseNewsDate(news:INews): string {
    return `const date = '${news.time}'`
  }

  parseOrigin(news:INews): string {
    return `const web = '${news.link}'`
  }
  
  addLine():string {
    return '\n\n'
  }
  parseNews(news: INews):string{
    let article = ''
    article += this.parseNewsTitle(news)
    article += this.addLine()
    article += this.parseNewsDate(news)
    article += this.addLine()
    article += this.parseNewsContent(news)
    article += this.addLine()
    article += this.parseOrigin(news)
    return article
  }

  provideTextDocumentContent(uri: Uri): ProviderResult<string> {
    return new Promise<string>(async (resolve)=> {
      // try {
      // } catch (error) {
        
      // }
      const r = uri.path.split('.')
      const newsId = Number(r[0])

      const news = await getNewsDetail(newsId)
      const finalContent = this.parseNews(news)
      resolve(finalContent)
    })
  }
}