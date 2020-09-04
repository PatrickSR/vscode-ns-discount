import Axios from 'axios'
import { GameItem } from './game-item'
import { off } from 'process'
import { TreeItemCollapsibleState, TreeItem } from 'vscode'

const MP_SCENE = 1001

const axios = Axios.create({
  baseURL: `https://switch.jumpvg.com`,
})

type JUMP_RESULT_STRC = {
  result: {
    code: number
  },
  data: any
}



export function getFeaturedDiscountList(offset: number = 0): Promise<TreeItem[]>{
  return new Promise<TreeItem[]>(async (resolve, reject)=>{
    try {
      const payload = {
        ifDiscount:true,
        title: '',
        orderByDiscountStart:-1,
        orderByDiscountEnd:0,
        orderByCutoff:0,
        orderByRate:0,
        hotType:'index',
        recommend:0,
        subCate:'featured',
        all:true,
        offset,
        limit:10,
        scene:MP_SCENE,
      }
      const resp = (await axios.get<JUMP_RESULT_STRC>(`/switch/gameDlc/list?${queryString(payload,true)}`)).data
      handleError(resp)

      const {games} = resp.data

      const uiGameList = new Array<TreeItem>()
      games.forEach((game:any) => {
        uiGameList.push(new GameItem(game.titleZh,TreeItemCollapsibleState.Collapsed,game))
      })

      resolve(uiGameList)
    } catch (error) {
      console.error(error)
      reject(error)
    }
  })

}

/**
 * 游戏id
 * @param appid 
 */
export function getGameDetail(appid: string): Promise<TreeItem[]>{
  return new Promise<TreeItem[]>(async (resolve,reject)=>{
    try {
      const resp = (await axios.get<JUMP_RESULT_STRC>(`/switch/gameInfo?appid=${appid}`)).data
      handleError(resp)
      const {game,prices} = resp.data

      const displayDetail = new Array<TreeItem>()
      displayDetail.push(new TreeItem(`介绍 - ${game.detail}`, TreeItemCollapsibleState.None))
      displayDetail.push(new TreeItem(`中文 - ${game.chineseVer == 1?'是': '否'}`, TreeItemCollapsibleState.None))
      displayDetail.push(new TreeItem(`折扣截止 - ${game.leftDiscount}`, TreeItemCollapsibleState.None))
      displayDetail.push(new TreeItem(`价格表`, TreeItemCollapsibleState.None))
      
      prices.forEach((price:any) => {
        displayDetail.push(new TreeItem(` |-${price.country} - ${price.price}RMB`))
      })

      resolve(displayDetail)
    } catch (error) {
      
      console.error(error)
      reject(error)
    }
  })
}

function handleError(resp: JUMP_RESULT_STRC){
  if(resp.result.code !== 0){
    throw new Error(JSON.stringify(resp.result))
  }
}

function queryString(param: any, encode: boolean = true) {
  return Object.keys(param)
    .map(key => {
      let value =
        typeof param[key] === 'object' ? JSON.stringify(param[key]) : param[key]
      if (encode) value = encodeURIComponent(value)
      return `${key}=${value}`
    })
    .join('&')
}