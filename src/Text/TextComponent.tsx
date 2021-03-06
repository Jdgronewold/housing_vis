import React from 'react'


interface TextComponentProps {
  textValues: string[] // should match transition height length ideally
  transitionHeights: number[]
  lastTransition: number
  height?: number
  width: number
  top: number
}

export const TextComponent: React.FC<TextComponentProps> = ({
  textValues,
  transitionHeights,
  lastTransition,
  height,
  width,
  top
}: TextComponentProps) => {

  return (
    <div style={{
      position: 'absolute',
      top: 0,
      height: lastTransition - top + height,
      width: width - 25,
      left: width + 25
      }}>
        <div style={{ position: 'relative', height: '100%', width: '100%'}}>
          {
            textValues.map((text, index) => {
           
              const nextBreakpoint = (index + 1) >= transitionHeights.length ? transitionHeights[index] + height : transitionHeights[index + 1]             
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