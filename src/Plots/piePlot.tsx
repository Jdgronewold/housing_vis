import React, { useEffect, useRef } from 'react'
import * as d3 from 'd3'
import { arc } from 'd3';

interface PieDataPoint {
  name: string
  value: number
  label: string
}
interface PiePlotProps {
  data:  PieDataPoint[]
  pieOuterRadius: number
  width: number
  height: number
}

export const PiePlot: React.FC<PiePlotProps> = (props: PiePlotProps) => {
  const svgRef = useRef(null)
  const cache = useRef(props.data);

  const createPie = d3
    .pie<PieDataPoint>()
    .value(d => d.value)
    .sort(null)

    const createArc = d3
      .arc<any>()
      .innerRadius(0)
      .outerRadius(props.pieOuterRadius);


  useEffect(() => {
    if (svgRef && svgRef.current) {
      const svgElement = d3.select(svgRef.current)
      svgElement.attr('width', props.width).attr('height', props.height)

      const containerElement = svgElement
      .select('g')
      .attr('class', 'container')
      .attr('transform', `translate(${props.width/2}, ${props.height/2})`)

      const arcs = createPie(props.data)

      const prevArcs = createPie(cache.current);

      const arcTween = (d, i) => {
        const interpolator = d3.interpolate(prevArcs[i], d);

        return t => createArc(interpolator(t));
      };
      const textTween = (d, i, nodes) => {
        const interpolator = d3.interpolate(cache.current[i].value, d.data.value);

        return t => d3.select(nodes[i]).text(d.data.label + interpolator(t));
      }

      containerElement
        .selectAll('g')
        .data(arcs, (datum: PieDataPoint) => datum.name)
        .join((enter) => {
          return enter.append('path')
                      .attr('d', createArc)
                      .attr('fill',(datum: any) => {
                        const isSF = (datum.data.name === 'positiveSF' || datum.data.name === 'negativeNY')
                        return isSF? 'green' : 'blue'
                      })
                      .attr('stroke', 'white')
                      .attr('stroke-width', '3px')
                      .call(enter => enter.transition().attrTween("d", arcTween))
                    },
              (update) => {
                return update.call(update => update.transition().attrTween("d", arcTween))
              })

      containerElement.selectAll('text')
          .data(arcs, (datum: PieDataPoint) => datum.name)
          .join((enter) => {
            return enter.append('text')
              .style('text-anchor', 'middle')
              .style('alignment-baseline', 'middle')
              .style('font-size', '16px')
              .attr('transform', (d, i) => `translate(0, ${15 + props.pieOuterRadius + 20 * i})`)        
              .style('font-weight', 'bold')
              .call(enter => enter.transition().tween("text", textTween))
          },
          (update) => {
            return update.call(update => update.transition().tween("text", textTween))
          }
          )
          
      cache.current = props.data
    }
  }, [props.data, props.width, props.height])

  return (
    <div className="pie-plot">
      <svg ref={svgRef}>
        <g />
      </svg>
    </div>
  )
}