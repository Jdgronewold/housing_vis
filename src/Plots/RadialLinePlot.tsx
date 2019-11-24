import React, { useMemo } from 'react'
import * as d3 from 'd3'

import { HouseData } from '../data'
import { GenericPlotProps } from './sharedPlotTypes'
import { splitData } from '../Utils/process_data'
import { useTransitionPhase } from '../Utils/scrollTransitionWrapper'

interface RadialPlotProps extends GenericPlotProps {
  transitionHeights: number[]
  sigmoidWeights: number[]
}

function generateSigmoid(width: number, height: number, weights: number[]): [number, number][] {
  
  const pointsArray = []
  for(let i = 0; i < width; i++) {
    const y = 1 / (1 + Math.exp(-1 * ((weights[1] * i) + weights[0]) + ((width - 100)/2))) * height
    pointsArray.push([i, y])
  }
  return pointsArray
}

function pathTween(d0: string, d1: string, precision: number) {
  const path0: SVGPathElement = document.createElementNS("http://www.w3.org/2000/svg", "path")
  path0.setAttribute("d", d0)
  const path1: SVGPathElement = document.createElementNS("http://www.w3.org/2000/svg", "path")
  path1.setAttribute("d", d1)

  const n0 = path0.getTotalLength()
  const n1 = path1.getTotalLength()

  // Uniform sampling of distance based on specified precision.
  var distances = [0], i = 0, dt = precision / Math.max(n0, n1);
  while ((i += dt) < 1) distances.push(i);
  distances.push(1);

  // Compute point-interpolators at each distance.
  var points = distances.map(function(t) {
    var p0 = path0.getPointAtLength(t * n0),
        p1 = path1.getPointAtLength(t * n1);
    return d3.interpolate([p0.x, p0.y], [p1.x, p1.y]);
  });

  return function(t: number) {
    return t < 1 ? "M" + points.map(function(p) { return p(t); }).join("L") : d1;
  };
};

function generateRadialPoints(radiusValues: number[], scale: d3.ScaleLinear<number, number>, width: number): [number, number][][] {
  const circleArrays: [number, number][][] = []

  for (let i = 0; i < 200; i++) {
    const angle = (i / (200 / 2)) * Math.PI;

    radiusValues.forEach((radius, index) => {
      
      const xValue = (scale(radius) * Math.cos(angle)) + (width/2);
      const yValue = (scale(radius) * Math.sin(angle)) + (width/2);
      const dataPoint: [number, number] = [xValue, yValue]

      if (!circleArrays[index]) {
        circleArrays.push([dataPoint])
      } else {
        circleArrays[index].push(dataPoint)
      }
    })
  }

  circleArrays.forEach((circleArray) => {
    circleArray.push(circleArray[0])
  })

  return circleArrays
}

export const RadialLinePlot: React.FC<RadialPlotProps> = (props: RadialPlotProps) => {
  
  const { height, width, xDataKey, data } = props
  const { SFData, NYData } = splitData(data);
  const { transitionPhase: { phaseIndex, phasePercentage } } = useTransitionPhase(props.transitionHeights)

  const xMinAndMax= d3.extent(props.data, (datum: HouseData) => datum[props.xDataKey]) as [number, number]
  const yMinAndMax= d3.extent(props.data, (datum: HouseData) => datum[props.yDataKey]) as [number, number]

  const xScale = d3.scaleLinear().domain(xMinAndMax).range([10, width - 20])
  const yScale = d3.scaleLinear().domain(yMinAndMax).range([10, width - 20])

  const minMax = d3.extent(data, (data: HouseData) => data[xDataKey]);
  const scaleRadial = d3.scaleLinear().domain(minMax).range([0, width/2]);
  const radiusPercentage = phaseIndex < 3 ? 0 : phaseIndex === 3 ? phasePercentage : 1

  const interpolation = (houseData: HouseData[]) => {
    return houseData.map((datum: HouseData, index) => {
      const angle = (index / (houseData.length / 2)) * Math.PI; 
      const xRadial = (scaleRadial(datum[xDataKey]) * Math.cos(angle)) + (width/2);
      const yRadial = (scaleRadial(datum[xDataKey]) * Math.sin(angle)) + (width/2);

      const xLinear = xScale(datum[props.xDataKey])
      const yLinear = yScale(datum[props.yDataKey])

      return d3.interpolate([xRadial, yRadial], [xLinear, yLinear])
    })
  }

  const pointsInterpolatersSF = useMemo(() => interpolation(SFData), [interpolation, SFData])
  const pointsInterpolatersNY = useMemo(() => interpolation(NYData), [interpolation, NYData])
  
  const pathGenerator = d3.line().curve(d3.curveCardinal);
  
  const sigmoidPath = useMemo(() => pathGenerator(generateSigmoid(props.width, props.height - 10, props.sigmoidWeights)),
  [props.width, props.height, props.sigmoidWeights])

  const radiusPath = useMemo(() => pathGenerator(generateRadialPoints([40], scaleRadial, width)[0]), [width, scaleRadial])

  const finalTweenedPathPathGenerator = pathTween(radiusPath, sigmoidPath, 4)

  if (phaseIndex === 0) {
    return null
  }

  const SFRadialDataPoints: [number, number][] = SFData.map((datum: HouseData, index) => {
    const angle = (index / (SFData.length / 2)) * Math.PI; 
    const x = (scaleRadial(datum[xDataKey]) * Math.cos(angle) * radiusPercentage) + (width/2); // Calculate the x position of the element.
    const y = (scaleRadial(datum[xDataKey]) * Math.sin(angle) * radiusPercentage) + (width/2);
    return [x, y]
  })

  const NYRadialDataPoints: [number, number][] = NYData.map((data: HouseData, index) => {
    const angle = (index / (NYData.length / 2)) * Math.PI; 
    const x = (scaleRadial(data[xDataKey]) * Math.cos(angle) * radiusPercentage) + (width/2); // Calculate the x position of the element.
    const y = (scaleRadial(data[xDataKey]) * Math.sin(angle) * radiusPercentage) + (width/2);
    return [x, y]
  })

  const staticCirclesTransform = phaseIndex === 4 ?
   1 - phasePercentage * 2 :
    phaseIndex < 4 ? 1 : 0
  
  const staticCircleOpacity = staticCirclesTransform

  const useInterpolatedPositions = phaseIndex > 3
  const dataPointsPositionPercentage = phaseIndex < 4 ? 0 : phaseIndex === 4 ? phasePercentage : 1

  const initialOpacity = phaseIndex === 1 ? phasePercentage : phaseIndex < 2 ? 0 : 1

  const movingPath = finalTweenedPathPathGenerator(dataPointsPositionPercentage)
  
  return (
    <div className={props.class || ''} style={{ position: 'fixed', top: 0, opacity: initialOpacity}}>
      <svg width={width} height={height}>
        
        {
          SFRadialDataPoints.map((point: [number, number], index) => {
            const cx = useInterpolatedPositions ? pointsInterpolatersSF[index](dataPointsPositionPercentage)[0] : point[0]
            const cy = useInterpolatedPositions ? pointsInterpolatersSF[index](dataPointsPositionPercentage)[1] : point[1]
            return <circle
                      key={`${index}`}
                      cx={cx}
                      cy={cy}
                      r={5}
                      fillOpacity={0.2}
                      fill={'blue'}
                      className={`${SFData[index].elevation} elev`}
                    />
          })
        }
        {
          NYRadialDataPoints.map((point: [number, number], index) => {
            const cx = useInterpolatedPositions ? pointsInterpolatersNY[index](dataPointsPositionPercentage)[0] : point[0]
            const cy = useInterpolatedPositions ? pointsInterpolatersNY[index](dataPointsPositionPercentage)[1] : point[1]
            return <circle
                      key={`${index}`}
                      cx={cx}
                      cy={cy}
                      r={5}
                      fillOpacity={0.2}
                      fill={'green'}
                    />
          })
        }
        <path d={movingPath} fill="transparent" stroke="darkGrey" strokeWidth={useInterpolatedPositions ? 3 : 1} />
        <g style={{ opacity: staticCircleOpacity }}>
          <StaticCirlces scale={scaleRadial} width={width} radiusValues={[20, 40, 60, 80]} />
        </g>
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

  const circleArrays = generateRadialPoints(radiusValues, scale, width)

  const finalPaths: string[] = circleArrays.map((circleArray) => {
    return pathGenerator(circleArray)
  })
  
  return (
    <>
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
    </>
  )
})