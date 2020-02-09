import React, { useState, useMemo, useEffect } from 'react'
import { Dropdown, Input, DropdownProps, Button, Icon, Dimmer, Loader, Segment } from 'semantic-ui-react'

import { LogisticRegression } from '../TensforFlow/logisticRegression'
import { processData } from '../Utils/process_data'
import { housingData, HouseData } from '../data'
import { CostHistoryPlot } from './costHistoryPlot'



interface CustomModelProps {
  height: number
  width: number
  data: HouseData[]
  logisticModel: LogisticRegression
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

  const [iterations, setIterations] = useState<number>(10)
  const [batchSize, setBatchSize] = useState<number>(20)
  const [learningRate, setLearningRate] = useState<number>(0.1)
  const [features, setFeatures] = useState<(keyof HouseData)[]>(['elevation'])
  const [isTraining, setTraining] = useState<boolean>(false)
  const [costHistory, setCostHistory] = useState<number[]>(props.logisticModel.costHistory)

  let iterationsText = 'Iterations - 1 to 100'
  let learningRateText = 'Learning Rate - 0 to 1'
  let batchSizeText = 'Batch Size - 1 to 50'

  useEffect(() => {
    if (isTraining) {
      const featureNames = features
      const { features: featuresProcessed, labels } = processData(housingData, {
        labelColumns: ['in_sf'],
        dataColumns: featureNames,
        splitTest: 100,
        shuffle: true
      })
  
      const logisticModel = new LogisticRegression(featuresProcessed, labels, { batchSize, learningRate, iterations })
      logisticModel.train()
      console.log('ran model');
      console.log(logisticModel.costHistory);
      setCostHistory(logisticModel.costHistory)
      setTraining(false)
    }
  }, [isTraining])

  const iterationsInputHandler = (event: React.ChangeEvent, data: { value: string }) => {
    const value = parseInt(data.value)
    if (isNaN(value) || value < 1 || value > 100) {

      iterationsText = 'Iteration value must be between 1 and 100'
      setIterations(isNaN(value) ? undefined : value)
    } else {
      setIterations(value)
    }
  }

  const batchSizeInputHandler = (event: React.ChangeEvent, data: { value: string }) => {
    const value = parseInt(data.value)
    if (isNaN(value) || value < 1 || value > 50) {

      batchSizeText = 'Batch size must be between 1 and 50'
      setBatchSize(isNaN(value) ? undefined : value)
    } else {
      setBatchSize(value)
    }
  }

  const learningRateInputHandler = (event: React.ChangeEvent, data: { value: string }) => {
    const value = parseInt(data.value)
    if (isNaN(value) || value < 0 || value > 1) {

      learningRateText = 'Learning rate must be between 0 and 1'
      setLearningRate(isNaN(value) ? undefined : value)
    } else {
      setLearningRate(value)
    }
  }

  function featuresInputHandler(event: React.SyntheticEvent, data: DropdownProps) {
    setFeatures(data.value as (keyof HouseData)[])
  }

  const runModel = () => {
    setTraining(true)
  }

  const costHistoryPlot = useMemo(() => {
    return (
      <CostHistoryPlot costValues={costHistory} width={400} height ={400} top={0}/>
    )
  }, [costHistory])
  
  return (
    <Segment>
      <Dimmer active={isTraining} inverted>
        <Loader>Trainging Model</Loader>
      </Dimmer>
      <div style={{ height: props.height, width: '100vw' }} className={'custom-model'}>
        <div className="custom-model-top">
          <div className="custom-model-parameters">
            <div className="custom-model-label">
              {'Features'}
            </div>
            <Dropdown
              placeholder='Features'
              fluid
              multiple
              selection
              options={options}
              onChange={featuresInputHandler}
              value={features}
            />
            <div className="custom-model-label">
              {batchSizeText}
            </div>
            <Input
              onChange={batchSizeInputHandler}
              value={batchSize}
              placeholder='Batch Size...'
            />
            <div className="custom-model-label">
              {iterationsText}
            </div>
            <Input
              value={iterations}
              placeholder='Iterations...'
              onChange={iterationsInputHandler}
            />
            <div className="custom-model-label">
              {learningRateText}
            </div>
            <Input
              placeholder='Learning Rate...'
              value={learningRate}
              onChange={learningRateInputHandler}
            />
            <div className="custom-model-run">
              <Button icon labelPosition='right' onClick={runModel}>
                  Run Model
                <Icon name='arrow right' />
              </Button>
            </div>
          </div>
          { costHistoryPlot }
        </div>
      </div>
    </Segment>
  )
}