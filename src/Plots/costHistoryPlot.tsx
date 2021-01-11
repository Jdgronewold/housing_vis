import React, { useEffect, useRef } from 'react'
import * as d3 from 'd3'

interface CostHistoryProps {
  costValues: number[]
  width: number
  height: number
  top: number
  class?: string
}

export const CostHistoryPlot: React.FC<CostHistoryProps> = (props: CostHistoryProps) => {
  const xAxisRef = useRef(null)
  const yAxisRef = useRef(null)

  const width = props.width ? props.width : 100
  const height = props.height ? props.height : 100

  const yMinAndMax= d3.extent(props.costValues)

  const xScale = d3.scaleLinear().domain([props.costValues.length, 0]).range([10, width - 20])
  const yScale = d3.scaleLinear().domain(yMinAndMax.reverse()).range([10, width - 20])

  useEffect(() => {
    if ((xAxisRef && xAxisRef.current) && (yAxisRef && yAxisRef.current)) {
      const invertedXScale = d3.scaleLinear().domain([0, props.costValues.length]).range([10, width - 20])
      d3.select(xAxisRef.current)
        .attr('transform', `translate(10, ${yScale(yMinAndMax[1]) + 5})`)
        .call(d3.axisBottom(invertedXScale))

      d3.select(yAxisRef.current)
        .attr('transform', 'translate(20, 0) rotate(90)')
        .call(d3.axisBottom(yScale).tickFormat(d3.format(".2f")))
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [props.costValues, yMinAndMax])

  const createDataPoints = () => {
    return props.costValues.map((costValue: number, i) => {
      
      return (
        <circle
          key={`${i}`}
          cx={xScale(i) + 10}
          cy={yScale(costValue)}
          r={2}
          fillOpacity={0.2}
        />
      )
    })
}

  return (
    <div className='cost-container' style={{ height: props.height + 5 }}>
      <div className={props.class || ''} style={{ position: "sticky", top: 0}}>
        <svg width={width} height={height + 5}>
          <g ref={xAxisRef} />
          <g ref={yAxisRef} />
          { createDataPoints() }
        </svg>
      </div>
    </div>
  )
}