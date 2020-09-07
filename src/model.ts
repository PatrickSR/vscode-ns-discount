export interface IGame {

  // 游戏唯一id
  appid: string

  // 英文名称
  title: string

  // 中文名称
  titleZh: string

  // 是否支持中文，1 = 支持 | 0 = 不支持
  chineseVer: 1 | 0
}