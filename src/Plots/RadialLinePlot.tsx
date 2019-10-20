import React from 'react'
import * as d3 from 'd3'

import { HouseData } from '../data'
import { GenericPlotProps } from './sharedPlotTypes'
import { splitData } from '../Utils/process_data'
import { useTransitionPhase } from '../Utils/scrollTransitionWrapper'

interface RadialPlotProps extends GenericPlotProps {
  transitionHeights: number[]
}

export const RadialLinePlot: React.FC<RadialPlotProps> = (props: RadialPlotProps) => {
  const { height, width, xDataKey, data } = props
  const { SFData, NYData } = splitData(data);
  const { transitionPhase: { phaseIndex, phasePercentage }, scrollTop } = useTransitionPhase(props.transitionHeights)
  
  const minMax = d3.extent(data, (data: HouseData) => data[xDataKey]);
  const scale = d3.scaleLinear().domain(minMax).range([0, width/2]);
  const radiusPercentage = phaseIndex < 2 ? 0 : phaseIndex === 2 ? phasePercentage : 1
  // const pathGenerator = d3.line().curve(d3.curveCardinal);

  const SFRadialDataPoints: [number, number][] = SFData.map((data: HouseData, index) => {
    const angle = (index / (SFData.length / 2)) * Math.PI; 
    const x = (scale(data[xDataKey]) * Math.cos(angle) * radiusPercentage) + (width/2); // Calculate the x position of the element.
    const y = (scale(data[xDataKey]) * Math.sin(angle)* radiusPercentage) + (width/2);
    return [x, y]
  })

  const NYRadialDataPoints: [number, number][] = NYData.map((data: HouseData, index) => {
    const angle = (index / (NYData.length / 2)) * Math.PI; 
    const x = (scale(data[xDataKey]) * Math.cos(angle) * radiusPercentage) + (width/2); // Calculate the x position of the element.
    const y = (scale(data[xDataKey]) * Math.sin(angle) * radiusPercentage) + (width/2);
    return [x, y]
  })

  return (
    <div className={props.class || ''} style={{ position: 'fixed'}}>
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
                      className={`${SFData[index].elevation} elev`}
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
        <StaticCirlces scale={scale} width={width} radiusValues={[5, 10, 20, 30, 50]} />
      </svg>
    </div>
  )
}

interface StaticCirlces {
  radiusValues: number[]
  scale: d3.ScaleLinear<number, number>
  width: number
}

const StaticCirlces = React.memo<StaticCirlces>(({ radiusValues, scale, width }) => {
  const pathGenerator = d3.line().curve(d3.curveCardinal);

  const circleArrays = radiusValues.map(() => { return [] })

  for (let i = 0; i < 200; i++) {
    const angle = (i / (200 / 2)) * Math.PI;

    radiusValues.forEach((radius, index) => {
      const xValue = (scale(radius) * Math.cos(angle)) + (width/2);
      const yValue = (scale(radius) * Math.sin(angle)) + (width/2);
      circleArrays[index].push([xValue, yValue])
    })
  }

  circleArrays.forEach((circleArray) => {
    circleArray.push(circleArray[0])
  })

  const finalPaths: string[] = circleArrays.map((circleArray) => {
    return pathGenerator(circleArray)
  })
  
  return (
    <g>
      {
        finalPaths.map((path: string, index) => {
          return (
            <g key={index}>
              <path
                d={path}
                fill="transparent"
                stroke="darkGrey"
                id={`elevationCircle_${index}`}
              />
              <text>
                <textPath
                  startOffset="70%"
                  fontSize="10"
                  xlinkHref={`#elevationCircle_${index}`}>
                    {`${radiusValues[index]}`}
                </textPath>
              </text>
            </g>
          )
        })
      }
    </g>
  )
})