import React, { useMemo, useState } from 'react'
import { Dropdown } from 'semantic-ui-react'
import * as d3 from 'd3'

import { LogisticRegression } from '../TensforFlow/logisticRegression'
import { processData } from '../Utils/process_data'
import { HouseData } from '../data'


interface CustomModelProps {
  height: number
  data: HouseData[]
}

const runRegression = (housingData, featureNames: (keyof HouseData)[], labelNames: (keyof HouseData)[], batchSize = 20, iterations = 70, learningRate = 0.05 ) => {

  const { features, labels, testFeatures, testLabels } = processData(housingData, {
    labelColumns: labelNames,
    dataColumns: featureNames,
    splitTest: 100,
    shuffle: true
  })

  const regression = new LogisticRegression(features, labels, { batchSize, iterations, learningRate })
  regression.train()
  return regression
}

const options = [
   {key: "beds", value: "beds", text: "Bedrooms"},
   {key: "bath", value: "bath", text: "Bathrooms"},
   {key: "price", value: "price", text: "Price"},
   {key: "year_built", value: "year_built", text: "Year Built"},
   {key: "sqft", value: "sqft", text: "Square Feet"},
   {key: "price_per_sqft", value: "price_per_sqft", text: " Price Per Square Foot"},
   {key: "elevation", value: "elevation", text: "Elevation"}
  ]

export const CustomModelPlot: React.FC<CustomModelProps> = (props: CustomModelProps) => {
  return (
    <div style={{ height: props.height }}>
        <Dropdown placeholder='Features' fluid multiple selection options={options} />
    </div>
  )
}