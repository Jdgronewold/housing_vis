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

  const [transitionPhase, setTransitionPhase] = useState()

  useScrollPosition(
    ({ currPos }) => {
      const calculatedPhase = props.transitionHeights.findIndex((transitionHeight: number) => {
        return transitionHeight > currPos.y
      })
      console.log(calculatedPhase);
    }, [], null, true, 20
  )

  return (
    <div style={{ height: props.height }}></div>
  )
}
