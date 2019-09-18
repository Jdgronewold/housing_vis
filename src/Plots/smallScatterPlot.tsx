import React from 'react'
import * as d3 from 'd3'

import { HouseData } from '../data'

interface SmallScatterPlotProps {
  data: HouseData[]
  xDataKey: keyof HouseData
  yDataKey: keyof HouseData
  width?: number
  height?: number
  class?: string
}

export const SmallScatterPlot: React.FC<SmallScatterPlotProps> = (props: SmallScatterPlotProps) => {
  
  const width = props.width ? props.width : 100
  const height = props.height ? props.height : 100

  const xMinAndMax= d3.extent(props.data, (datum: HouseData) => datum[props.xDataKey]) as [number, number]
  const yMinAndMax= d3.extent(props.data, (datum: HouseData) => datum[props.yDataKey]) as [number, number]

  const xScale = d3.scaleLinear().domain(xMinAndMax.reverse()).range([10, 80])
  const yScale = d3.scaleLinear().domain(yMinAndMax.reverse()).range([10, 80])


  const createDataPoints = () => {
      return props.data.map((houseData: HouseData, i) => {
        const fillColor = houseData.in_sf ? 'green' : 'blue'
        return (
        <circle
          key={`${houseData.price_per_sqft} ${houseData.price} ${i}`}
          cx={xScale(houseData[props.xDataKey])}
          cy={yScale(houseData[props.yDataKey])}
          r={2}
          fillOpacity={0.2}
          fill={fillColor}
        />
        )
      })
  }
  
  return (
    <div className={props.class || ''}>
      <svg width={width} height={height}>
        { createDataPoints() }
      </svg>
    </div>
  )
}