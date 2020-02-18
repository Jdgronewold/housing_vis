import React, { useState, useMemo, useEffect } from 'react'
import { Dropdown, Input, DropdownProps, Button, Icon, Dimmer, Loader, Segment } from 'semantic-ui-react'

import { LogisticRegression, PredictionResults } from '../TensforFlow/logisticRegression'
import { processData, HousingSums, TrainedResults } from '../Utils/process_data'
import { housingData, HouseData } from '../data'
import { CostHistoryPlot } from './costHistoryPlot'
import { processTrainedResults } from '../Utils/process_data'
import { PiePlot } from './piePlot'

interface CustomModelProps {
  height: number
  width: number
  data: HouseData[]
  logisticModel: LogisticRegression
  initialCorrectPercentage: number
  trainedResults: TrainedResults
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

  const [iterations, setIterations] = useState<string>('40')
  const [batchSize, setBatchSize] = useState<string>('20')
  const [learningRate, setLearningRate] = useState<string>('0.05')
  const [features, setFeatures] = useState<(keyof HouseData)[]>(['elevation'])
  const [isTraining, setTraining] = useState<boolean>(false)
  const [costHistory, setCostHistory] = useState<number[]>(props.logisticModel.costHistory)
  const [errors, setErrors] = useState<string[]>([])
  const [percentageCorrect, setPercentageCorrect] = useState<number>(props.initialCorrectPercentage)
  const [pieData, setPieData] = useState<TrainedResults>(props.trainedResults)

  let iterationsText = 'Iterations - 1 to 100'
  let learningRateText = 'Learning Rate - 0 to 5'
  let batchSizeText = 'Batch Size - 1 to 50'

  useEffect(() => {
    if (isTraining) {
      const featureNames = features
      debugger
      const { features: featuresProcessed, labels, testFeatures, testLabels } = processData(housingData, {
        labelColumns: ['in_sf'],
        dataColumns: featureNames,
        splitTest: 100,
        shuffle: true
      })
      
  
      const logisticModel = new LogisticRegression(
        featuresProcessed,
        labels,
        { batchSize: parseInt(batchSize), learningRate: parseFloat(learningRate), iterations: parseInt(iterations) }
      )

      logisticModel.train()

      const predictionResults: PredictionResults = logisticModel.test(testFeatures, testLabels)
      
      const processedResults = processTrainedResults(predictionResults.predictions, testLabels)
      console.log(processedResults);
      
      setPieData(processedResults)
      setPercentageCorrect(predictionResults.percentageCorrect)
      setCostHistory(logisticModel.costHistory)
      setTraining(false)
    }
  }, [isTraining])

  const iterationsInputHandler = (event: React.ChangeEvent, data: { value: string }) => {
    setIterations(data.value)
  }

  const batchSizeInputHandler = (event: React.ChangeEvent, data: { value: string }) => {
    setBatchSize(data.value)
  }

  const learningRateInputHandler = (event: React.ChangeEvent, data: { value: string }) => {
    setLearningRate(data.value)
  }

  function featuresInputHandler(event: React.SyntheticEvent, data: DropdownProps) {
    setFeatures(data.value as (keyof HouseData)[])
  }

  const runModel = () => {
    const errors: string[] = []
    const iterationsNumber = parseInt(iterations)
    const batchSizeNumber = parseInt(batchSize)
    const learningRateNumber = parseFloat(learningRate)

    if (!Number.isInteger(iterationsNumber) || iterationsNumber < 1 || iterationsNumber > 100) {
      errors.push('Iterations must be between 1 and 100')
    }

    if (!Number.isInteger(batchSizeNumber) || batchSizeNumber < 1 || batchSizeNumber > 50) {
      errors.push('Batch Size must be between 1 and 50')
    }

    if (!Number.isFinite(learningRateNumber) || learningRateNumber < 0 || learningRateNumber > 5) {
      errors.push('Learning Rate must be between 0 and 5')
    }

    if (errors.length) {
      setErrors(errors)
    } else {
      setErrors([])
      setTraining(true)
    }
  }

  const pieDataSF = useMemo(() => {
    return ['positiveSF', 'negativeSF'].map(key => {
      const value = pieData.sums[key]
      const label = (key === 'positiveSF') ? `Correctly predicted SF homes: ` : `Incorrectly predicted NY homes: `
      return { name: key, value, label }
    })
  }, [pieData])

  const pieDataNY = useMemo(() => {
    return ['positiveNY', 'negativeNY'].map(key => {
      const value = pieData.sums[key]
      const label = (key === 'positiveNY') ? `Correctly predicted NY homes: ` : `Incorrectly predicted SF homes: `
      return { name: key, value, label }
    })
  }, [pieData])

  const costHistoryPlot = useMemo(() => {
    return (
      <CostHistoryPlot costValues={costHistory} width={400} height ={400} top={0}/>
    )
  }, [costHistory])
  
  return (
    <Segment className="custom-model-wrapper">
      <Dimmer active={isTraining} inverted>
        <Loader>Training Model</Loader>
      </Dimmer>
      <div style={{ height: props.height, width: '100vw' }} className={'custom-model'}>
        <div className="custom-model-top">
          <div className="custom-model-parameters">
            <div className="custom-model-prediction">
              { `Current model predicts ${percentageCorrect * 100}% of the houses correctly`}
            </div>
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
              type="number"
            />
            <div className="custom-model-label">
              {iterationsText}
            </div>
            <Input
              value={iterations}
              placeholder='Iterations...'
              onChange={iterationsInputHandler}
              type="number"
            />
            <div className="custom-model-label">
              {learningRateText}
            </div>
            <Input
              placeholder='Learning Rate...'
              value={learningRate}
              onChange={learningRateInputHandler}
              type="number"
            />
            <div className="custom-model-errors">
              {
                errors.map((error: string) => {
                  return (
                    <div key={error}>
                      { error }
                    </div>
                  )
                })
              }
            </div>
            <div className="custom-model-run">
              <Button icon labelPosition='right' onClick={runModel}>
                  Run Model
                <Icon name='arrow right' />
              </Button>
            </div>
          </div>
          { costHistoryPlot }
        </div>
        <div className="custom-model-bottom">
          <PiePlot data={pieDataSF} pieOuterRadius={100} width={300} height={300}/>
          <PiePlot data={pieDataNY} pieOuterRadius={100} width={300} height={300}/>
        </div>
      </div>
    </Segment>
  )
}