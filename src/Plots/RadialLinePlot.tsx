import React, { useMemo } from 'react'
import * as d3 from 'd3'

import { HouseData } from '../data'
import { GenericPlotProps } from './sharedPlotTypes'
import { splitData } from '../Utils/process_data'
import { useTransitionPhase } from '../Utils/scrollTransitionWrapper'

interface RadialPlotProps extends GenericPlotProps {
  transitionHeights: number[]
  sigmoidWeights: number[]
  top: number
  costValues: number[]
}

function generateCircle(cx: number, cy: number): string {
  const radius = 2
  return "M" + cx + "," + cy + " " +
    "m" + -radius + ", 0 " +
    "a" + radius + "," + radius + " 0 1,0 " + radius*2  + ",0 " +
    "a" + radius + "," + radius + " 0 1,0 " + -radius*2 + ",0Z";
}

function generateSigmoid(width: number, height: number, weights: number[], widthOffset: number): [number, number][] {
  
  const pointsArray = []
  for(let i = 0; i < width; i++) {
    const y = 1 / (1 + Math.exp(-1 * ((weights[1] * i) + weights[0]) + ((width - widthOffset)/2))) * height
    pointsArray.push([i, y])
  }
  return pointsArray
}

function generateMultipleSigmoids(width: number, height: number, weights: number[], widthOffsets: number[]):[number, number][][] {

  const allPointsArray = widthOffsets.map((offset: number) => {
    const pointsArray = []
  for(let i = 0; i < width; i++) {
    const y = 1 / (1 + Math.exp(-1 * ((weights[1] * i) + weights[0]) + ((width - offset)/2))) * height
    pointsArray.push([i, y])
  }
  return pointsArray
  })

  return allPointsArray

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

function generateRadialPoints(radiusValues: number[], scale: d3.ScaleLinear<number, number>, width: number, height: number): [number, number][][] {
  const circleArrays: [number, number][][] = []

  for (let i = 0; i < 200; i++) {
    const angle = (i / (200 / 2)) * Math.PI;

    radiusValues.forEach((radius, index) => {
      
      const xValue = (scale(radius) * Math.cos(angle)) + (width/2);
      const yValue = (scale(radius) * Math.sin(angle)) + (height/2);
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

  const lastTransitionHeight = props.transitionHeights[props.transitionHeights.length - 1]

  const xMinAndMax= d3.extent(props.data, (datum: HouseData) => datum[props.xDataKey]) as [number, number]
  const yMinAndMax= d3.extent(props.data, (datum: HouseData) => datum[props.yDataKey]) as [number, number]

  const xScale = d3.scaleLinear().domain(xMinAndMax).range([10, width - 20])
  const yScale = d3.scaleLinear().domain(yMinAndMax).range([10, height - 20])

  const minMax = d3.extent(data, (data: HouseData) => data[xDataKey]);
  const scaleRadial = d3.scaleLinear().domain(minMax).range([0, width/2]);
  const radiusPercentage = phaseIndex < 3 ? 0 : phaseIndex === 3 ? phasePercentage : 1
  
  const pathGenerator = d3.line().curve(d3.curveCardinal);
  

  const NYAreaGenerator = d3.area()
                          .x((d) => d[0])
                          .y0(props.height - 10)
                          .y1((d) => d[1])

  const SFAreaGenerator = d3.area()
                            .x((d) => d[0])
                            .y0(0)
                            .y1((d) => d[1])                

  const sigmoidPoints = generateSigmoid(props.width, props.height - 10, props.sigmoidWeights, 100)
  const finalNYArea = NYAreaGenerator(sigmoidPoints)
  const finalSFArea = SFAreaGenerator(sigmoidPoints)

  // ______________________________________________________________________________________________________________
  // Generate red circle to sigmoid path
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const radiusPath = useMemo(() => pathGenerator(generateRadialPoints([40], scaleRadial, width, height)[0]), [width, scaleRadial])
  
  const sigmoidPath = useMemo(() => pathGenerator(generateSigmoid(props.width, props.height - 10, props.sigmoidWeights, 100)),
  // eslint-disable-next-line react-hooks/exhaustive-deps
  [props.width, props.height, props.sigmoidWeights])

  const finalTweenedPathPathGenerator = useMemo(() => {
    return pathTween(radiusPath, sigmoidPath, 4)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const dataPointsPositionPercentage = phaseIndex < 4 ? 0 : phaseIndex === 4 ? phasePercentage : 1
  const movingPath = finalTweenedPathPathGenerator(dataPointsPositionPercentage)

  // Do the bit for the transition to a dot
  const yMinAndMaxCost = d3.extent(props.costValues)
  const xCostScale = d3.scaleLinear().domain([props.costValues.length, 0]).range([60, width - 30])
  const yCostScale = d3.scaleLinear().domain(yMinAndMaxCost.reverse()).range([30, height - 60])

  const stageThreePositionPercentage = phaseIndex < 8 ? 0 : phaseIndex === 8 ? phasePercentage : 1

  const circlePath = generateCircle(xCostScale(0), yCostScale(yMinAndMaxCost[1]))

  const stageThreeTweenedPathGenerator = useMemo(() => {
    return pathTween(movingPath, circlePath, 4)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [movingPath])

  const finalRedCirclePath = stageThreeTweenedPathGenerator(stageThreePositionPercentage)

  // ________________________________________________________________________________________________________________
  // Generate alternate sigmoid paths
  const offsetArray = [360, 300, 270, 220, 180, 150, 50, 20, -20, -70, -130, -180]

  const alternateSigmoids: string[] = useMemo(() => {
    return generateMultipleSigmoids(props.width, props.height - 10, props.sigmoidWeights, offsetArray).map((pathPoints) => {
      return pathGenerator(pathPoints)
    })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [props.width, props.height, props.sigmoidWeights])

  const alternateTweenedPathsGenerator = useMemo(() => {
    return alternateSigmoids.map((path: string) => pathTween(sigmoidPath, path, 2))
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const alternatePathsPositionPercentage = phaseIndex < 6 ? 0 : phaseIndex === 6 ? phasePercentage : 0
  const alternativePaths = alternateTweenedPathsGenerator.map((altPathGenerator) => altPathGenerator(alternatePathsPositionPercentage))

  const costConversionIndex = Math.floor(props.costValues.length / offsetArray.length)
  const greyCirclePaths = useMemo(() => {
      return offsetArray.map((_, index) => {
      const costArrayIndex = Math.min( props.costValues.length - 1, props.costValues.length -  (index * costConversionIndex))
      const xValue = xCostScale(costArrayIndex)
      const yValue = yCostScale(props.costValues[costArrayIndex])
      return generateCircle(xValue, yValue)
    })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])


  const finalAlternatePathsGenerator = useMemo(() => {
    return alternateSigmoids.map((altPath: string, index: number) => pathTween(altPath, greyCirclePaths[index], 4))
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const finalAlternatePathsOpacity = phaseIndex < 7 ? 0 : 1
  const finalAlternatePaths = finalAlternatePathsGenerator.map((finalAltPathGenerator) => finalAltPathGenerator(stageThreePositionPercentage))

  // ________________________________________________________________________________________________________________
  // create SF and NY data points and their interpolators

  const useInterpolatedPositions = phaseIndex > 3 // used to know if we should be transitioning to x and y values instead of radial

  // returns interpolators that turns data points from x and y to radial positions
  const interpolation = useMemo(() => (houseData: HouseData[]) => {
    return houseData.map((datum: HouseData, index) => {
      const angle = (index / (houseData.length / 2)) * Math.PI; 
      const xRadial = (scaleRadial(datum[xDataKey]) * Math.cos(angle)) + (width/2);
      const yRadial = (scaleRadial(datum[xDataKey]) * Math.sin(angle)) + (height/2);

      const xLinear = xScale(datum[props.xDataKey])
      const yLinear = yScale(datum[props.yDataKey])

      return d3.interpolate([xRadial, yRadial], [xLinear, yLinear])
    })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const pointsInterpolatersSF = useMemo(() => interpolation(SFData), [interpolation, SFData])
  const SFRadialDataPoints: [number, number][] = SFData.map((datum: HouseData, index) => {
    const angle = (index / (SFData.length / 2)) * Math.PI; 
    const x = (scaleRadial(datum[xDataKey]) * Math.cos(angle) * radiusPercentage) + (width/2); // Calculate the x position of the element.
    const y = (scaleRadial(datum[xDataKey]) * Math.sin(angle) * radiusPercentage) + (height/2);
    return [x, y]
  })

  const pointsInterpolatersNY = useMemo(() => interpolation(NYData), [interpolation, NYData])
  const NYRadialDataPoints: [number, number][] = NYData.map((data: HouseData, index) => {
    const angle = (index / (NYData.length / 2)) * Math.PI; 
    const x = (scaleRadial(data[xDataKey]) * Math.cos(angle) * radiusPercentage) + (width/2); // Calculate the x position of the element.
    const y = (scaleRadial(data[xDataKey]) * Math.sin(angle) * radiusPercentage) + (height/2);
    return [x, y]
  })

  const pointOpacity = phaseIndex < 6 ? 0.2 : phaseIndex === 6 ? 0.2 - (phasePercentage * 0.2)  : 0

  // ________________________________________________________________________________________________________________

  const axisArrowOpacity = phaseIndex < 8 ? 0 : phaseIndex === 8 ? phasePercentage  : 1

  if (phaseIndex === 0) {
    // bail early if we don't need to paint anything - has to happen after useMemo though
    return <div className='radial-container' style={{ height: lastTransitionHeight - props.top}} />
  }


  const staticCirclesTransform = phaseIndex === 4 ? 1 - phasePercentage * 2 : phaseIndex < 4 ? 1 : 0
  
  const staticCircleOpacity = staticCirclesTransform

  const backgroundColorsOpacity = phaseIndex < 5 ? 0 : phaseIndex === 5 ? phasePercentage : phaseIndex === 6 ? 0.2 - (phasePercentage * 0.2)  : 0

  const initialOpacity = phaseIndex === 1 ? phasePercentage : phaseIndex < 2 ? 0 : 1

  return (
    <div className='radial-container' style={{ height: lastTransitionHeight - props.top, width: props.width}} >
      <div className={props.class || ''} style={{
        height: props.height,
        width: props.width,
        position: "sticky",
        top: 0,
        opacity: initialOpacity
      }}>
        <svg width={width} height={height}>
          <pattern id="NYdiagonalHatch" patternUnits="userSpaceOnUse" width="14" height="14" viewBox="0 0 4 4">
            <path d="M-1,1 l2,-2
              M0,4 l4,-4
              M3,5 l2,-2" 
              style={{ stroke: 'green', strokeWidth: 1}} />
          </pattern>
          <pattern id="SFdiagonalHatch" patternUnits="userSpaceOnUse" width="14" height="14" viewBox="0 0 4 4">
            <path d="M-1,1 l2,-2
              M0,4 l4,-4
              M3,5 l2,-2" 
              style={{ stroke: 'blue', strokeWidth: 1}} />
          </pattern>
          <defs>
            <marker id="arrow"
              viewBox="0 -5 10 10"
              refX={0}
              refY={0}
              markerWidth={4}
              markerHeight={4}
              orient="auto"
              opacity={axisArrowOpacity}
            >
              <path d="M0,-5L10,0L0,5" />
            </marker>
          </defs>
          <path d={finalNYArea} fill="url(#NYdiagonalHatch)" opacity={Math.min(0.2, backgroundColorsOpacity)} />
          <path d={finalSFArea} fill="url(#SFdiagonalHatch)"  opacity={Math.min(0.2, backgroundColorsOpacity)} />
          {
            SFRadialDataPoints.map((point: [number, number], index) => {
              const cx = useInterpolatedPositions ? pointsInterpolatersSF[index](dataPointsPositionPercentage)[0] : point[0]
              const cy = useInterpolatedPositions ? pointsInterpolatersSF[index](dataPointsPositionPercentage)[1] : point[1]
              return <circle
                        key={`${index}`}
                        cx={cx}
                        cy={cy}
                        r={5}
                        fillOpacity={pointOpacity}
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
                        fillOpacity={pointOpacity}
                        fill={'green'}
                      />
            })
          }
          {
            alternativePaths.map((path, index) => {
              return (
                <path
                  d={path}
                  key={index}
                  fill="transparent"
                  stroke="darkGrey"
                  strokeWidth={3}
                  strokeOpacity={alternatePathsPositionPercentage}
                />
              )
            })
          }
          {
            finalAlternatePaths.map((path, index) => {
              return (
                <path
                  d={path}
                  key={index}
                  fill="transparent"
                  stroke="darkGrey"
                  strokeWidth={3}
                  strokeOpacity={finalAlternatePathsOpacity}
                />
              )
            })
          }
          <path d={finalRedCirclePath} fill="transparent" stroke="rgb(255,0,0)" strokeWidth={useInterpolatedPositions ? 3 : 1} />
          <line
            x1={(width -30) / 2 - 30}
            x2={(width -30) / 2 + 120}
            y1={height - 20}
            y2={height - 20}
            strokeOpacity={axisArrowOpacity}
            markerEnd="url(#arrow)"
            strokeWidth={2.5}
            stroke="black"
          />
          <text
            x={(width -30) / 2 + 45}
            y={height}
            textAnchor="middle"
            opacity={axisArrowOpacity}
          >
            Iterations
          </text>
          <line
            x1={30}
            x2={30}
            y1={(height - 30) / 2 - 30}
            y2={(height -30) / 2 + 120}
            strokeOpacity={axisArrowOpacity}
            markerEnd="url(#arrow)"
            rotate="90deg"
            strokeWidth={2.5}
            stroke="black"
          />
          <text
            x={15}
            y={(height - 30) / 2 + 45}
            textAnchor="middle"
            opacity={axisArrowOpacity}
            style={{ writingMode: "vertical-rl" }}
          >
            Cost
          </text>
          <g style={{ opacity: staticCircleOpacity }}>
            <StaticCirlces scale={scaleRadial} width={width} height={height} radiusValues={[20, 40, 60, 80]} />
          </g>
        </svg>
      </div>
    </div>
  )
}

interface StaticCirlces {
  radiusValues: number[]
  scale: d3.ScaleLinear<number, number>
  width: number
  height: number
}

const StaticCirlces = React.memo<StaticCirlces>(({ radiusValues, scale, width, height }) => {
  const pathGenerator = d3.line().curve(d3.curveCardinal);

  const circleArrays = generateRadialPoints(radiusValues, scale, width, height)

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