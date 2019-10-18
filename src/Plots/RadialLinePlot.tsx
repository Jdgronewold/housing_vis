import React from 'react'
import * as d3 from 'd3'

import { HouseData } from '../data'
import { GenericPlotProps } from './sharedPlotTypes'
import { SplitHouseData, splitData } from '../Utils/process_data'


export const RadialLinePlot: React.FC<GenericPlotProps> = (props: GenericPlotProps) => {
  const { height, width, xDataKey, data } = props
  const { SFData, NYData } = splitData(data);
  const minMax = d3.extent(data, (data: HouseData) => data[xDataKey]);
  const scale = d3.scaleLinear().domain(minMax).range([0, height - 25])
  const pathGenerator = d3.line().curve(d3.curveCardinal);

  const SFRadialDataPoints: [number, number][] = SFData.map((data: HouseData, index) => {
    const angle = (index / (SFData.length / 2)) * Math.PI; 
    const x = (scale(data[xDataKey]) * Math.cos(angle)) + (width/2); // Calculate the x position of the element.
    const y = (scale(data[xDataKey]) * Math.sin(angle)) + (width/2);
    return [x, y]
  })

  const NYRadialDataPoints: [number, number][] = NYData.map((data: HouseData, index) => {
    const angle = (index / (NYData.length / 2)) * Math.PI; 
    const x = (scale(data[xDataKey]) * Math.cos(angle)) + (width/2); // Calculate the x position of the element.
    const y = (scale(data[xDataKey]) * Math.sin(angle)) + (width/2);
    return [x, y]
  })

  const elevationFiveCircle = []
  const elevationFifteenCircle = []
  const elevationThirtyCircle = []
  const elevationFiftyCircle = []

  for (let i = 0; i < 200; i++) {
    const angle = (i / (200 / 2)) * Math.PI; 
    const fiveX = (scale(5) * Math.cos(angle)) + (width/2);
    const fifteenX = (scale(15) * Math.cos(angle)) + (width/2);
    const thirtyX = (scale(30) * Math.cos(angle)) + (width/2);
    const fiftyX = (scale(50) * Math.cos(angle)) + (width/2);

    const fiveY = (scale(5) * Math.sin(angle)) + (width/2);
    const fifteenY = (scale(15) * Math.sin(angle)) + (width/2);
    const thirtyY = (scale(30) * Math.sin(angle)) + (width/2);
    const fiftyY = (scale(50) * Math.sin(angle)) + (width/2);

    elevationFiveCircle.push([fiveX, fiveY])
    elevationFifteenCircle.push([fifteenX, fifteenY])
    elevationThirtyCircle.push([thirtyX, thirtyY])
    elevationFiftyCircle.push([fiftyX, fiftyY])
  }

  SFRadialDataPoints.push(SFRadialDataPoints[0])
  NYRadialDataPoints.push(NYRadialDataPoints[0])
  
  const SFpath = pathGenerator(SFRadialDataPoints)
  const NYpath = pathGenerator(NYRadialDataPoints)

  const fivePath = pathGenerator(elevationFiveCircle);
  const fifteenPath = pathGenerator(elevationFifteenCircle);
  const thirtyPath = pathGenerator(elevationThirtyCircle);
  const fiftyPath = pathGenerator(elevationFiftyCircle);

  return (
    <div className={props.class || ''}>
      <svg width={width} height={height}>
        
        {
          SFRadialDataPoints.map((point: [number, number], index) => {
            return <circle
                      key={`${index}`}
                      cx={point[0]}
                      cy={point[1]}
                      r={5}
                      fillOpacity={0.2}
                      fill={'blue'}
                    />
          })
        }
        {
          NYRadialDataPoints.map((point: [number, number], index) => {
            return <circle
                      key={`${index}`}
                      cx={point[0]}
                      cy={point[1]}
                      r={5}
                      fillOpacity={0.2}
                      fill={'green'}
                    />
          })
        }
        {/* <path d={SFpath} fill="blue" fillOpacity="0.1" stroke="blue"/>
        <path d={NYpath} fill="green" fillOpacity="0.3" stroke="green"/> */}
        <path d={fivePath} fill="transparent" stroke="darkGrey"/>
        <path d={fifteenPath} fill="transparent" stroke="darkGrey"/>
        <path d={thirtyPath} fill="transparent" stroke="darkGrey"/>
        <path d={fiftyPath} fill="transparent" stroke="darkGrey"/>
      </svg>
    </div>
  )
}