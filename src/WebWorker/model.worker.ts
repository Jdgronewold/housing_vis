import { LogisticRegression, PredictionResults, RegressionOptions } from '../TensforFlow/logisticRegression'
import { housingData } from '../data'
import { processData, processTrainedResults, ProcessDataParameters, TrainedResults } from '../Utils/process_data'



export function train(data: ProcessDataParameters, options: RegressionOptions) {
  debugger
  const { features, labels, testFeatures, testLabels } = processData(housingData, data)
  console.log('HELLO');
  debugger
  const logisticModel = new LogisticRegression(features, labels, options)
  logisticModel.train();

  const predictionResults: PredictionResults = logisticModel.test(testFeatures, testLabels)
  const processedResults = processTrainedResults(predictionResults.predictions, testLabels)

   return processedResults
}



