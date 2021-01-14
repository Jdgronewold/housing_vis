import React from 'react'


interface TextComponentProps {
  textValues: string[] // should match transition height length ideally
  transitionHeights: number[]
  lastTransition: number
  height?: number
  width: number
  color: string
  top: number
}

export const TextComponent: React.FC<TextComponentProps> = ({
  textValues,
  transitionHeights,
  lastTransition,
  height,
  width,
  color,
  top
}: TextComponentProps) => {

  return (
    <div style={{
      position: 'absolute',
      top: 0,
      border: `1px solid ${color}`,
      height: lastTransition - top + height,
      width: width,
      left: width
      }}>
        <div style={{ position: 'relative', height: '100%', width: '100%'}}>
          {
            textValues.map((text, index) => {
              const nextBreakpoint = (index + 1) > transitionHeights.length ? lastTransition + height : transitionHeights[index + 1]
              const containerHeight = nextBreakpoint - transitionHeights[index] - 100
              return (
                <div
                  key={index}
                  style={{
                    position: 'absolute',
                    top: transitionHeights[index],
                    height: containerHeight,
                    width: '100%',
                  }}
                >
                  <div
                    style={{
                      position: 'sticky',
                      top: 80,
                      fontSize: 20,
                      marginRight: 20,
                    }}
                  >
                    { text }
                  </div>
                </div>
              )
            })
          }
        </div>
    </div>
  )
}