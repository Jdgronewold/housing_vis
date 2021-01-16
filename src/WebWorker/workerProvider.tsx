import React, { useState, useEffect, useReducer, useRef } from 'react'
import { RegressionOptions } from '../TensforFlow/logisticRegression'
import { ProcessDataParameters, TrainedResults } from '../Utils/process_data'
// eslint-disable-next-line import/no-webpack-loader-syntax
const worker = require('workerize-loader!./model.worker')

interface WorkerState {
  inputData: ProcessDataParameters
  options: RegressionOptions
  trainedResults: TrainedResults
}

interface ChangeOptionsAction {
  type: 'CHANGE_OPTION',
  payload: Partial<RegressionOptions>
}

interface ChangeInputDataAction {
  type: 'CHANGE_INPUT_DATA',
  payload: Partial<ProcessDataParameters>
}

interface ChangeTrainedResultsAction {
  type: 'CHANGE_TRAINED_RESULTS',
  payload: TrainedResults
}

export const changeOptions = (payload: Partial<RegressionOptions>): ChangeOptionsAction => {
  return {
    type: 'CHANGE_OPTION',
    payload
  }
}

export const changeInputData = (payload: Partial<ProcessDataParameters>): ChangeInputDataAction => {
  return {
    type: 'CHANGE_INPUT_DATA',
    payload
  }
}

export const changeTrainedResults = (payload: TrainedResults): ChangeTrainedResultsAction => {
  return {
    type: 'CHANGE_TRAINED_RESULTS',
    payload
  }
}

type WorkerActions = ChangeInputDataAction |  ChangeOptionsAction | ChangeTrainedResultsAction

interface WorkerContextState extends WorkerState{
  workerDispatch: React.Dispatch<WorkerActions>
}
const workerInstance = worker()

function workerReducer(state: WorkerState, action: WorkerActions): WorkerState {
  switch(action.type) {
    case 'CHANGE_OPTION': {
      return {
        ...state,
        options: {
          ...state.options,
          ...action.payload
        }
      }
    }
    case 'CHANGE_INPUT_DATA': {
      return {
        ...state,
        inputData: {
          ...state.inputData,
          ...action.payload
        }
      }
    }
    case 'CHANGE_TRAINED_RESULTS': {
      return {
        ...state,
        trainedResults: action.payload
      }
    }
    default:
      return state
  }
}

export const WorkerContext = React.createContext<WorkerContextState>(null)

export const WorkerProvider: React.FC = ({ children }) => {
  // const workerInstance = useRef(worker())
  const [ { inputData, options, trainedResults }, workerDispatch] = useReducer(workerReducer, {
    inputData: {
      labelColumns: ['in_sf'],
      dataColumns: ['elevation'],
      splitTest: 100,
      shuffle: true
    },
    options:  { batchSize: 20, iterations: 20, learningRate: 0.05 },
    trainedResults: null
  })
  const [workerState, setWorkerState] = useState<WorkerContextState>({
    inputData,
    options,
    trainedResults: null,
    workerDispatch
  })

  useEffect(() => {
    console.log('ran this');
    
    workerInstance.addEventListener('message', () => {
      debugger
    })
  }, [])



  useEffect(() => {

    const trainModel = async () => {
    
      console.log(workerInstance);
      
      debugger
      const trainedResults = await workerInstance.train(inputData, options)
      debugger
      setWorkerState({
        ...workerState,
        inputData,
        options,
        trainedResults
      })
    }

    trainModel()
    
  }, [inputData, options])

  return (
    <WorkerContext.Provider value={workerState}>
      { children }
    </WorkerContext.Provider>
  )
}