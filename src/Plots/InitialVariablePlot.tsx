import React, { useState } from 'react'
import { useScrollPosition } from '@n8tb1t/use-scroll-position'
// import * as d3 from 'd3'

import { HouseData } from '../data'

interface InitialVariablePlotProps {
  data: HouseData[]
  transitionHeights: number[]
  width?: number
  height?: number
  class?: string
}

export const InitialVariablePlot: React.FC<InitialVariablePlotProps> = (props: InitialVariablePlotProps) => {

  const phaseColors = ['red', 'blue', 'green', 'purple']

  const [transitionPhase, setTransitionPhase] =
    useState<{phaseIndex: number, phasePercentage: number}>({ phaseIndex: 0, phasePercentage: 0})

  useScrollPosition(
    ({ currPos }) => {
      const { transitionHeights } = props

      const calculatedPhase = transitionHeights.findIndex((transitionHeight: number) => {
        return transitionHeight > currPos.y
      })
      
      const phasePercentage = 1 - (transitionHeights[calculatedPhase] - currPos.y) / (transitionHeights[calculatedPhase + 1] - transitionHeights[calculatedPhase])
      
      setTransitionPhase({ phaseIndex: calculatedPhase, phasePercentage: phasePercentage })
    }, [], null, true, 20
  )

  return (
    <div style={{
      height: props.height,
      backgroundColor: phaseColors[transitionPhase.phaseIndex],
      opacity: transitionPhase.phasePercentage
    }}></div>
  )
}
