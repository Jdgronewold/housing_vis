import { HouseData } from '../data'

export interface  GenericPlotProps {
  data: HouseData[]
  xDataKey: keyof HouseData
  yDataKey: keyof HouseData
  width?: number
  height?: number
  class?: string
}