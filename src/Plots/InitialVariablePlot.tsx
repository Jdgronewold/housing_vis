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
  const sqFtMinMax = d3.extent(props.data, (datum: HouseData) => datum.price_per_sqft) as [number, number]
  const elevationScale = d3.scaleLinear().domain(elevationMinMax).range([0, props.height - 25])
  const sqFtSFScale = d3.scaleLinear().domain(sqFtMinMax).range([0, props.width - 25])
  const sqFtNYScale = d3.scaleLinear().domain(sqFtMinMax.reverse()).range([0, props.width - 25])

  const [transitionPhase, setTransitionPhase] =
    useState<{phaseIndex: number, phasePercentage: number}>({ phaseIndex: 0, phasePercentage: 0})

  useScrollPosition(
    ({ currPos }) => {
      const { transitionHeights } = props

      const calculatedPhase = transitionHeights.findIndex((transitionHeight: number) => {
        return transitionHeight > currPos.y
      })
      let phasePercentage: number
      if (transitionHeights[calculatedPhase - 1]) {
        phasePercentage = 1 - ((transitionHeights[calculatedPhase] - currPos.y) / (transitionHeights[calculatedPhase] - transitionHeights[calculatedPhase - 1]))  
      } else {
        phasePercentage = 1
      }
      
      setTransitionPhase({ phaseIndex: calculatedPhase, phasePercentage: Math.min(1, phasePercentage) })
    }, [], null, true, 10
  )

  useEffect(() => {
    if (svgRef && svgRef.current) {

      const determineTriangleWith = (data: HouseData, percentageWidth: number): number => {
        const dataHeightPercentage = data.elevation / elevationMinMax[1]
        const dataHeightRoundedDown = (Math.floor(dataHeightPercentage * 100) / 100)
        const dataHeightRoundedUp = (Math.ceil(dataHeightPercentage * 100) / 100)

        if (percentageWidth < dataHeightRoundedDown) {
          return 1
        } else if (percentageWidth > dataHeightRoundedUp) {
          return 0
        } else {
          return (dataHeightRoundedUp - percentageWidth) / .05
        }
      }
      
      const svgElement = d3.select(svgRef.current)
      svgElement.attr('width', props.width).attr('height', props.height)

      const containerElement = svgElement
        .select('g')
        .attr('class', 'container')
        .attr('transform', 'translate(25, 25)')
      
      const percentageY = transitionPhase.phaseIndex === 1 ? transitionPhase.phasePercentage : 1

      const percentageWidth = transitionPhase.phaseIndex === 2 ?
        transitionPhase.phasePercentage :
        transitionPhase.phaseIndex > 2 ? 0 : 1
      
      const percentageX = transitionPhase.phaseIndex >= 3 ? transitionPhase.phasePercentage : 0

      const roundedCorners = transitionPhase.phaseIndex >= 3 ? 6 : 0
      
      const opacity = transitionPhase.phaseIndex < 1 ? 0 : 0.8
      
      containerElement.selectAll('g')
        .data(props.data, (data: HouseData, i: number) => `${data.elevation} + ${i}`)
        .join((enter) => {
          return enter.append('g')
                      .append('rect')   
                      .attr('height', 6)       
                    },
          (update) => {
            return update.attr('transform', (d: HouseData, i: number) => {
                            
                            const translateX = d.in_sf ?
                              (0 + percentageX * sqFtSFScale(d.price_per_sqft))  :
                              (props.width - 25 - (sqFtNYScale(d.price_per_sqft) * percentageX))

                            const translateY = props.height - (elevationScale(d.elevation) * percentageY)
                            
                            const rotateAmount = d.in_sf ? 0 : 180

                            return `translate(${translateX}, ${translateY}) rotate(${rotateAmount})`
                          })
                          .select('rect')
                          .attr('width', (data: HouseData) => {
                            if (transitionPhase.phaseIndex === 2) {
                              const calcPercentageWidth = determineTriangleWith(data, percentageWidth)                             
                              return Math.max((calcPercentageWidth * (props.width - 30) / 2), 6)
                            }                            
                            return Math.max((percentageWidth * (props.width - 30) / 2), 6)
                          })
                          .attr('fill', (data: HouseData) => data.in_sf ? 'green' : 'blue')
                          .attr('opacity', (_, i) =>  i % 3 === 0 ? opacity : i % 2 ? opacity * 0.7 : opacity * 0.4 )
                          .attr('rx', (data: HouseData) => {
                            if (transitionPhase.phaseIndex === 2) {
                              const calcPercentageWidth = determineTriangleWith(data, percentageWidth)                             
                              const width = Math.max((calcPercentageWidth * (props.width - 30) / 2), 6)
                              if (width === 6) {
                                return width
                              }
                            }
                            return roundedCorners
                          })
                          .attr('ry', (data: HouseData) => {
                            if (transitionPhase.phaseIndex === 2) {
                              const calcPercentageWidth = determineTriangleWith(data, percentageWidth)                             
                              const width = Math.max((calcPercentageWidth * (props.width - 30) / 2), 6)
                              if (width === 6) {
                                return width
                              }
                            }
                            return roundedCorners
                          })
                          .attr('class', 'boop')
          }
        )
    }
  }, [transitionPhase, props, elevationScale, sqFtSFScale, sqFtNYScale, phaseColors, svgRef, elevationMinMax ])

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
