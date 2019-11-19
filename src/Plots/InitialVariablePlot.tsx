import React, { useState, useRef, useEffect } from 'react'
import * as d3 from 'd3'

import { HouseData } from '../data'
import { useTransitionPhase } from '../Utils/scrollTransitionWrapper'

interface InitialVariablePlotProps {
  data: HouseData[]
  transitionHeights: number[]
  width: number
  height: number
  class?: string
}

// Note - at some point clean up the gigantic hook. The scales can probably all be moved inside of it, although it propabl does
// not matter because it re renders so much on scroll. And figure out how to do they whole determineTriangleWidth once instead of
// tons of times

export const InitialVariablePlot: React.FC<InitialVariablePlotProps> = (props: InitialVariablePlotProps) => {
  const svgRef = useRef(null)
  const elevationMinMax = d3.extent(props.data, (datum: HouseData) => datum.elevation) as [number, number]
  const sqFtMinMax = d3.extent(props.data, (datum: HouseData) => datum.price_per_sqft) as [number, number]
  const elevationScale = d3.scaleLinear().domain(elevationMinMax).range([0, props.height - 25])
  const sqFtSFScale = d3.scaleLinear().domain(sqFtMinMax).range([0, props.width - 25])
  const sqFtNYScale = d3.scaleLinear().domain(sqFtMinMax.reverse()).range([0, props.width - 25])

  const { transitionPhase, scrollTop } = useTransitionPhase(props.transitionHeights)
  const lastTransitionHeight = props.transitionHeights[props.transitionHeights.length - 1]

  useEffect(() => {
    if (svgRef && svgRef.current) {

      const determineTriangleWidth = (data: HouseData, percentageWidth: number): number => {
        const dataHeightPercentage = data.elevation / elevationMinMax[1]
        const dataHeightRoundedDown = dataHeightPercentage - 0.1 // (Math.floor(dataHeightPercentage * 10) / 10)
        const dataHeightRoundedUp = dataHeightPercentage + 0.1 //(Math.ceil(dataHeightPercentage * 10) / 10)

        if (percentageWidth < dataHeightRoundedDown) {
          return 1
        } else if (percentageWidth > dataHeightRoundedUp) {
          return 0
        } else {
          return (dataHeightRoundedUp - percentageWidth) / .1
        }
      }
      
      const svgElement = d3.select(svgRef.current)

      const containerElement = svgElement
      .select('g')
      .attr('class', 'container')
      .attr('transform', 'translate(25, 25)')

      const boxContainer = svgElement
        .select('g.box-container')
        .attr('class', 'box-container')
        .attr('transform', 'translate(25, 25)')
      
      const removeData = scrollTop - lastTransitionHeight >= props.height + 200

      svgElement.attr('width', props.width).attr('height', props.height)
      
      const percentageY = transitionPhase.phaseIndex === 1 ? transitionPhase.phasePercentage : 1

      const percentageWidth = transitionPhase.phaseIndex === 2 ?
        transitionPhase.phasePercentage :
        transitionPhase.phaseIndex > 2 ? 0 : 1
      
      const percentageX = transitionPhase.phaseIndex === 3 ?
        transitionPhase.phasePercentage :
        transitionPhase.phaseIndex > 3 ? 1 : 0

      const roundedCorners = transitionPhase.phaseIndex >= 3 ? 6 : 0
      
      const opacity = transitionPhase.phaseIndex < 1 ? 0 : 0.8

      const boxOpacity = transitionPhase.phaseIndex > 3 ? 0.25 : 0
      const boxSizePercentage = transitionPhase.phaseIndex === 4 ?
        transitionPhase.phasePercentage :
        transitionPhase.phaseIndex > 4 ? 1 : 0
      
      
      containerElement.selectAll('g')
        .data(removeData ? [] : props.data, (data: HouseData, i: number) => `${data.elevation} + ${i}`)
        .join((enter) => {
          return enter.append('g')
                      .append('rect')   
                      .attr('height', 6)
                      .attr('class', (data: HouseData) => `${data.elevation}+${data.price_per_sqft}`)       
                    },
          (update) => {
            return update.attr('transform', (d: HouseData, i: number) => {
                            
                            const translateX = d.in_sf ?
                              (0 + percentageX * sqFtSFScale(d.price_per_sqft))  :
                              (props.width - 25 - (sqFtNYScale(d.price_per_sqft) * percentageX))

                            const translateY = (props.height - 25) - (elevationScale(d.elevation) * percentageY)
                            
                            const rotateAmount = d.in_sf ? 0 : 180

                            return `translate(${translateX}, ${translateY}) rotate(${rotateAmount})`
                          })
                          .select('rect')
                          .attr('width', (data: HouseData) => {
                            if (transitionPhase.phaseIndex === 2) {
                              const calcPercentageWidth = determineTriangleWidth(data, percentageWidth)
                              const width = Math.min((calcPercentageWidth * (props.width - 30) / 2), (props.width - 30) / 2)                            
                              return Math.max(width, 6)
                            }                            
                            return Math.max((percentageWidth * (props.width - 30) / 2), 6)
                          })
                          .attr('fill', (data: HouseData) => data.in_sf ? 'green' : 'blue')
                          .attr('opacity', (_, i) =>  i % 3 === 0 ? opacity : i % 2 ? opacity * 0.7 : opacity * 0.4 )
                          .attr('rx', (data: HouseData) => {
                            if (transitionPhase.phaseIndex === 2) {
                              const calcPercentageWidth = determineTriangleWidth(data, percentageWidth)                             
                              const width = Math.max((calcPercentageWidth * (props.width - 30) / 2), 6)
                              if (width === 6) {
                                return width
                              }
                            }
                            return roundedCorners
                          })
                          .attr('ry', (data: HouseData) => {
                            if (transitionPhase.phaseIndex === 2) {
                              const calcPercentageWidth = determineTriangleWidth(data, percentageWidth)                             
                              const width = Math.max((calcPercentageWidth * (props.width - 30) / 2), 6)
                              if (width === 6) {
                                return width
                              }
                            }
                            return roundedCorners
                          })
          },
          (exit) => {
            return exit.remove()
          }
        )

      boxContainer.selectAll('g')
          .data(['green', 'blue'], (d: string) => d)
          .join((enter) => {
            return enter
              .append('g')
              .append('rect')
              .attr('transform', (d: string) => {
                const isSF = d === 'green'
                return `translate(${isSF ? 0 : sqFtSFScale(1900)}, ${isSF ? (props.height - 25) - elevationScale(31):  props.height -25}) rotate(-90)`
              })
              .attr('rotateY', 180)
          },
          (update) => {
            return update.select('rect').attr('fill', (data: string) => data)
              .attr('width', (data: string) => {
                const isSF = data === 'green'
                const maxSFHeight = (props.height - 25) - elevationScale(31)
                return isSF ? maxSFHeight * boxSizePercentage : elevationScale(31)
              })
              .attr('height', (data: string) => {
                const isSF = data === 'green'
                const maxNYWidth = (props.width - 25) - sqFtSFScale(1900)
                return isSF ? props.width - 25 : maxNYWidth * boxSizePercentage 
              })
              .attr('opacity', boxOpacity)
          })
    }
  }, [transitionPhase, scrollTop, props, elevationScale, sqFtSFScale, sqFtNYScale, svgRef, elevationMinMax, sqFtMinMax ])

  const isAtLastPhase = transitionPhase.phaseIndex < props.transitionHeights.length
  
  const plotPosition =  isAtLastPhase ? 'fixed' : 'relative'
  const plotTop = isAtLastPhase ? 0 : lastTransitionHeight - props.height
  return (
    <div style={{
      height: props.height,
      width: props.width,
      position: plotPosition,
      top: plotTop
    }}>
      <svg ref={svgRef}>
        <g></g>
        <g className="box-container"></g>
      </svg>
    </div>
  )
}
