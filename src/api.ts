import Axios from 'axios'
import { IGame, IPrice } from './model'

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


/**
 * 获取推荐折扣游戏
 * @param offset 
 */
export function getFeaturedDiscountList(offset: number = 0): Promise<IGame[]>{
  return new Promise<IGame[]>(async (resolve, reject)=>{
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

      // const uiGameList = new Array<TreeItem>()
      // games.forEach((game:any) => {
      //   uiGameList.push(new GameItem(game.titleZh,TreeItemCollapsibleState.Collapsed,game))
      // })

      resolve(games)
    } catch (error) {
      console.error(error)
      reject(error)
    }
  })

}

/**
 * 获取游戏详情
 * @param appid 游戏id 
 */
export function getGameDetail(appid: string): Promise<{game:IGame, prices: Array<IPrice>}>{
  return new Promise<{game:IGame, prices: Array<IPrice>}>(async (resolve,reject)=>{
    try {
      const resp = (await axios.get<JUMP_RESULT_STRC>(`/switch/gameInfo?appid=${appid}`)).data
      handleError(resp)
      const {game,prices} = resp.data

      // const displayDetail = new Array<TreeItem>()
      // displayDetail.push(new TreeItem(`介绍 - ${game.detail}`, TreeItemCollapsibleState.None))
      // displayDetail.push(new TreeItem(`中文 - ${game.chineseVer == 1?'是': '否'}`, TreeItemCollapsibleState.None))
      // displayDetail.push(new TreeItem(`折扣截止 - ${game.leftDiscount}`, TreeItemCollapsibleState.None))
      // displayDetail.push(new TreeItem(`价格表`, TreeItemCollapsibleState.None))
      
      // prices.forEach((price:any) => {
      //   displayDetail.push(new TreeItem(` |-${price.country} - ${price.price}RMB`))
      // })

      resolve({game,prices})
    } catch (error) {
      
      console.error(error)
      reject(error)
    }
  })
}

/**
 * 搜索游戏
 * @param keyword 
 */
export function searchGame(keyword: string): Promise<Array<IGame>>{
  return new Promise<Array<IGame>>(async (resolve, reject)=> {
    try {
      console.log(`搜索：${keyword}`)
      const resp = (await axios.get<JUMP_RESULT_STRC>(`/switch/gameDlc/list?title=${encodeURIComponent(keyword)}&offset=0&limit=10`)).data
      handleError(resp)

      const {games} = resp.data
      // const gameSelector = new Array<SearchItem>()

      // games.forEach((game:any) => {
      //   gameSelector.push({
      //     label: game.titleZh,
      //     description: game.title,
      //     game
      //   })
      // })

      resolve(games)
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