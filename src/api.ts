import Axios from 'axios'
import { IGame, IPrice, INews } from './model'

const MP_SCENE = 1001

const jumpAxios = Axios.create({
  baseURL: `https://switch.jumpvg.com`,
})

const newsAxios = Axios.create({
  baseURL: 'https://www.ninten.cn'
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
      const resp = (await jumpAxios.get<JUMP_RESULT_STRC>(`/switch/gameDlc/list?${queryString(payload,true)}`)).data
      handleJumpApiError(resp)

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
      const resp = (await jumpAxios.get<JUMP_RESULT_STRC>(`/switch/gameInfo?appid=${appid}`)).data
      handleJumpApiError(resp)
      const {game,prices} = resp.data

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
      const resp = (await jumpAxios.get<JUMP_RESULT_STRC>(`/switch/gameDlc/list?title=${encodeURIComponent(keyword)}&offset=0&limit=10`)).data
      handleJumpApiError(resp)

      const {games} = resp.data

      resolve(games)
    } catch (error) {
      console.error(error)
      reject(error)
    }
  })
}

/**
 * 获取文章列表
 * @param page 
 */
export function getNewsList(page: number = 1):Promise<Array<INews>>{
  return new Promise<Array<INews>>(async (resolve) => {
    try {
      const newsList = (await newsAxios.get<Array<INews>>(`/wp-json/mp/v2/posts?categories=1&page=${page}`)).data

      resolve(newsList)
    } catch (error) {
      console.error(error)
      resolve([])
    }
  })
}

/**
 * 获取文章详情
 * @param id 
 */
export function getNewsDetail(id: number):Promise<INews>{
  return new Promise<INews>(async (resolve)=>{
    try {
      const news = (await newsAxios.get<INews>(`/wp-json/mp/v2/posts/${id}`)).data
      resolve(news)
    } catch (error) {
      console.error(error)
    }
  })
}

function handleJumpApiError(resp: JUMP_RESULT_STRC){
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