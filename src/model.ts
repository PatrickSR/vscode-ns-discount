export interface IGame {

  // 游戏唯一id
  appid: string

  // 英文名称
  title: string

  // 中文名称
  titleZh: string

  // 是否支持中文，1 = 支持 | 0 = 不支持
  chineseVer: 1 | 0

  // 折扣，off表示
  cutoff: number

  // 介绍
  detail?: string

  // 离折扣结束剩余天数
  leftDiscount: string
}


export interface IPrice {
  // 地区
  country: string
  
  // 折扣，off表示
  cutoff: number

  // 折扣结束日期
  discountEnd: string

  // 离折扣结束剩余天数
  leftDiscount: string

  // 原价
  originPrice: string

  // 当前价格
  price: string
}