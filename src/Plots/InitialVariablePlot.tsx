import React, { useState, useRef, useEffect } from 'react'
import { useScrollPosition } from '@n8tb1t/use-scroll-position'
import * as d3 from 'd3'

import { HouseData } from '../data'

interface InitialVariablePlotProps {
  data: HouseData[]
  transitionHeights: number[]
  width: number
  height: number
  class?: string
}

export const InitialVariablePlot: React.FC<InitialVariablePlotProps> = (props: InitialVariablePlotProps) => {
  const svgRef = useRef(null)
  const phaseColors = ['red', 'blue', 'green', 'purple']
  const elevationMinMax = d3.extent(props.data, (datum: HouseData) => datum.elevation) as [number, number]
  const elevationScale = d3.scaleLinear().domain(elevationMinMax).range([0, props.height - 25])

  const [transitionPhase, setTransitionPhase] =
    useState<{phaseIndex: number, phasePercentage: number}>({ phaseIndex: 0, phasePercentage: 0})

  useScrollPosition(
    ({ currPos }) => {
      const { transitionHeights } = props

      const calculatedPhase = transitionHeights.findIndex((transitionHeight: number) => {
        return transitionHeight > currPos.y
      })
      let phasePercentage: number
      if (transitionHeights[calculatedPhase + 1]) {
        phasePercentage = 1 - (transitionHeights[calculatedPhase] - currPos.y) / (transitionHeights[calculatedPhase + 1] - transitionHeights[calculatedPhase])
      } else {
        phasePercentage = 1
      }
      
      setTransitionPhase({ phaseIndex: calculatedPhase, phasePercentage: phasePercentage })
    }, [], null, true, 20
  )

  useEffect(() => {
    if (svgRef && svgRef.current) {
      
      const svgElement = d3.select(svgRef.current)
      svgElement.attr('width', props.width).attr('height', props.height)

      const containerElement = svgElement
        .select('g')
        .attr('class', 'container')
        .attr('transform', 'translate(25, 25)')
      console.log(transitionPhase.phaseIndex);
      
      const percentage = transitionPhase.phaseIndex === 1 ? transitionPhase.phasePercentage : 1

      const opacity = transitionPhase.phaseIndex < 1 ? 0 : 1

      containerElement.selectAll('g')
        .data(props.data, (data: HouseData) => `${data.elevation} ${data.price}`)
        .join((enter) => {
          return enter.append('g')
                      .attr('transform', (d: HouseData) => {
                        const translateX = d.in_sf ? 0 : props.width / 2
                        return `translate(${translateX}, ${props.height - (elevationScale(d.elevation) * percentage)})`
                      })
                      .append('rect')
                      .attr('height', 6)
                      .attr('width', (props.width - 10) /2)
                      .attr('fill', (data: HouseData) => data.in_sf ? 'green' : 'blue')
                      .attr('opacity', opacity)


        })
    }
  }, [transitionPhase, props, elevationScale, phaseColors, svgRef ])

  return (
    <div style={{
      height: props.height,
      width: props.width,
      position: 'fixed',
      top: 0
    }}>
      <svg ref={svgRef}>
        <g></g>
      </svg>
    </div>
  )
}
