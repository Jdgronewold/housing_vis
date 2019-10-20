import { useRef, useState } from 'react'
import { useScrollPosition } from '@n8tb1t/use-scroll-position'

interface TransitionData {
  phaseIndex: number
  phasePercentage: number
}

export function useTransitionPhase(scrollTransitionPoints: number[]): { transitionPhase: TransitionData, scrollTop: number} {
  const scrollPosition = useRef<number>(0)
  const [transitionPhase, setTransitionPhase] =
    useState<TransitionData>({ phaseIndex: 0, phasePercentage: 0})


  useScrollPosition(
    ({ currPos }) => {

      const calculatedPhase = scrollTransitionPoints.findIndex((transitionHeight: number) => {
        return transitionHeight > currPos.y
      })

      if (calculatedPhase === -1) {
        setTransitionPhase({ phaseIndex: scrollTransitionPoints.length, phasePercentage: 1 })
      } else {
        let phasePercentage: number
      if (scrollTransitionPoints[calculatedPhase - 1]) {
        phasePercentage =
          1 - ((scrollTransitionPoints[calculatedPhase] - currPos.y) /
          (scrollTransitionPoints[calculatedPhase] - scrollTransitionPoints[calculatedPhase - 1]))  
        } else {
          phasePercentage = 1
        }

        scrollPosition.current = currPos.y
        
        setTransitionPhase({ phaseIndex: calculatedPhase, phasePercentage: Math.min(1, phasePercentage) })
      }
    }, [], null, true, 10
  )

  return { transitionPhase, scrollTop: scrollPosition.current }
}
