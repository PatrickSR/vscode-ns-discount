import { ViewColumn, WebviewPanel, window } from "vscode";
import { getGameDetail } from "./api";
import { IGame, IPrice } from "./model";

function coverZhDiscount(enDisCount: number): string{
  const x = 100 - Number(enDisCount)
  return (x/10).toFixed(1)
}


export class GameviewProvider {
  createGameviewWebviewWithDelegate() {
    return (appid: string) => {
      console.log(`command ${appid}`);
      this.preSetupGameView(appid);
    };
  }

  preSetupGameView(appid: string) {
    const plane = window.createWebviewPanel(
      "ns-game-view",
      "加载中",
      ViewColumn.Active,
      {}
    );

    plane.webview.html = `<p>加载中</p>`;
    this.setupGameView(appid, plane);
  }

  async setupGameView(appid: string, plane: WebviewPanel) {
    const res = await getGameDetail(appid);
    plane!.title = `${res.game.titleZh} ${res.game.title}`
    plane!.webview.html = this.getGameviewHtml(res);
  }

  getGameviewHtml({ game, prices }: { game: IGame; prices: Array<IPrice> }) {

    function chineseSupportView(game:IGame){
      if(game.chinese_all){
        return `<span>🇨🇳  全区</span>`
      }else {
        let supportHmtl = ''
        if(game.chinese_america) {supportHmtl+= '<span>🇺🇸  美区</span>'}
        if(game.chinese_europe) {supportHmtl+= '<span>🇬🇧  欧区</span>'}
        if(game.chinese_hongkong) {supportHmtl+= '<span>🇭🇰  港区</span>'}
        if(game.chinese_japan) {supportHmtl+= '<span>🇯🇵  日区</span>'}


        if(!supportHmtl) {supportHmtl+='<span>🤷‍♂️  不支持中文</span>'}
        return supportHmtl
      }
    }


    const picView = game.pics.length > 0? `<div class="game-cover"><img src="${game.pics[0]}"></img></div>`: `<div></div>`

    const supportView = chineseSupportView(game)

    const priceList = prices.map(price => {
      return `
      <div class="price"> 
        <span>${price.country}</span> 
        <span>${price.cutoff > 0 ? `<span>【${coverZhDiscount(price.cutoff)}折】- </span>`:`<span></span>`}${price.price}RMB</span>
      </div>`
    })
    const priceListView = priceList.toString().replace(/\,/g, '')
    return `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8" />
        <meta http-equiv="X-UA-Compatible" content="IE=edge" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <style>
          body {
            padding: 0;
            margin: 0;
            width: 400px;
          }

          .game-cover{
            width: 400px
          }

          .game-cover img {
            object-fit: cover;
            width: 100%;
            height: 225px;
          }
    
          .title-wrapper {
            padding: 10px;
            border-bottom: 1px solid #a0a0a0;
          }
    
          .title-wrapper .zh-title {
            font-size: 22px;
            font-weight: bold;
          }
    
          .title-wrapper .origin-title {
            font-size: 14px;
            color: #a0a0a0;
          }
    
          .label {
            font-size: 18px;
            margin-bottom: 5px;
          }
    
          .detail-wrapper {
            padding: 5px 10px 10px;
            border-bottom: 1px solid #a0a0a0;
          }
    
          .detail-wrapper .detail {
            font-size: 14px;
            color: #a0a0a0;
          }
    
          .price-wrapper {
            padding: 5px 10px 10px;
          }
    
          .price-wrapper .price {
            font-size: 14px;
            color: #a0a0a0;
            display: flex;
            padding: 4px 0px;
            justify-content: space-between;
          }
    
          .chinese-wrapper {
            padding: 5px 10px 10px;
            border-bottom: 1px solid #a0a0a0;
          }
    
          .support-wrapper span {
            margin-right: 10px;
            font-size: 14px;
            color: #a0a0a0;
          }
        </style>
      </head>
      <body>
        ${picView}
        <div class="title-wrapper">
          <div class="zh-title">
          ${game.titleZh}
          </div>
          <div class="origin-title">
          ${game.title}
          </div>
        </div>
    
        <div class="detail-wrapper">
          <div class="label">介绍</div>
          <div class="detail">
            ${game.brief? game.brief: ''}
          </div>
        </div>
    
        <div class="chinese-wrapper">
          <div class="label">支持中文情况</div>
          <div class="support-wrapper">
            ${supportView}
          </div>
        </div>
    
        <div class="price-wrapper">
          <div class="label">价格</div>
          ${priceListView}
        </div>
    
      </body>
    </html>
    
    `;
  }
}
