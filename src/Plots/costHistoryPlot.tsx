import React from 'react'
import * as d3 from 'd3'

interface CostHistoryProps {
  costValues: number[]
  width: number
  height: number
  class?: string
}

export const CostHistoryPlot: React.FC<CostHistoryProps> = (props: CostHistoryProps) => {
  
  const width = props.width ? props.width : 100
  const height = props.height ? props.height : 100

  const yMinAndMax= d3.extent(props.costValues)

  const xScale = d3.scaleLinear().domain([props.costValues.length, 0]).range([10, width - 20])
  const yScale = d3.scaleLinear().domain(yMinAndMax.reverse()).range([10, width - 20])

  const createDataPoints = () => {
    return props.costValues.map((costValue: number, i) => {
      
      return (
        <circle
          key={`${i}`}
          cx={xScale(i)}
          cy={yScale(costValue)}
          r={2}
          fillOpacity={0.2}
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