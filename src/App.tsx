import React from 'react';

import { SmallScatterPlot } from './Plots/smallScatterPlot'
import { InitialVariablePlot } from './Plots/InitialVariablePlot'
import { housingData } from './data'
import { processData, processTrainedResults } from './Utils/process_data'
import { LogisticRegression } from './TensforFlow/logisticRegression'
import { RadialLinePlot } from './Plots/RadialLinePlot'
import { CustomModelPlot } from './Plots/customModel'

import './App.css'
import './Plots/plots.css'

const { features, labels, testFeatures, testLabels } = processData(housingData, {
  labelColumns: ['in_sf'],
  dataColumns: ['elevation'],
  splitTest: 100,
  shuffle: true
})
const initialDefaults = { batchSize: 20, iterations: 40, learningRate: 0.05 }
export { features, labels, initialDefaults }

const logisticModel = new LogisticRegression(features, labels, initialDefaults)
logisticModel.train();
const predictionResults = logisticModel.test(testFeatures, testLabels)
const trainedResults = processTrainedResults(predictionResults.predictions, testLabels)
console.log('precentage right = ', predictionResults.percentageCorrect * 100, "%");


const App: React.FC = () => {
  const height = Math.max(document.body.getBoundingClientRect().height - 100, 800)
  return (
    <div className="App" style={{ height: 25000 }}>
      
      <RenderSmallPlots />
      <InitialVariablePlot
        data={housingData}
        transitionHeights={[600, 1200, 3000, 5000, 7200, 7500]}
        height={height}
        width={600}
        top={height}
        />
      {/* <SmallScatterPlot data={housingData} yDataKey={"in_sf"} xDataKey={"elevation"} width={600} height={600} /> */}
      <RadialLinePlot
        sigmoidWeights={Array.from(logisticModel.getWeights().dataSync<"int32">())}
        costValues={logisticModel.costHistory}
        data={housingData}
        yDataKey={"in_sf"}
        xDataKey={"elevation"}
        width={600}
        height={height}
        top={7500}
        transitionHeights={[7500, 7800, 7801, 9000, 12800, 14000, 16000, 18000, 22000, 24000].map( transition => transition + height)}
      />
      <CustomModelPlot
        height={800}
        width={600}
        data={housingData}
        logisticModel={logisticModel}
        initialCorrectPercentage={predictionResults.percentageCorrect}
        trainedResults={trainedResults}
        />
    </div>
  );
}

const RenderSmallPlots: React.FC = () => {
  return (
    <div className="first-graphic">
        <SmallScatterPlot class={'first-graphic-row-1'} data={housingData} yDataKey={"price"} xDataKey={"year_built"} />
        <SmallScatterPlot data={housingData} yDataKey={"price"} xDataKey={"sqft"} />
        <SmallScatterPlot data={housingData} yDataKey={"price"} xDataKey={"beds"} />
        <SmallScatterPlot data={housingData} yDataKey={"price"} xDataKey={"bath"} />
        <SmallScatterPlot data={housingData} yDataKey={"price"} xDataKey={"price_per_sqft"} />
        <SmallScatterPlot data={housingData} yDataKey={"price"} xDataKey={"elevation"} />

        <SmallScatterPlot class={'first-graphic-row-2'} data={housingData} yDataKey={"elevation"} xDataKey={"year_built"} />
        <SmallScatterPlot data={housingData} yDataKey={"elevation"} xDataKey={"sqft"} />
        <SmallScatterPlot data={housingData} yDataKey={"elevation"} xDataKey={"beds"} />
        <SmallScatterPlot data={housingData} yDataKey={"elevation"} xDataKey={"bath"} />
        <SmallScatterPlot data={housingData} yDataKey={"elevation"} xDataKey={"price_per_sqft"} />
      
        <SmallScatterPlot class={'first-graphic-row-3'} data={housingData} yDataKey={"year_built"} xDataKey={"sqft"} />
        <SmallScatterPlot data={housingData} yDataKey={"year_built"} xDataKey={"beds"} />
        <SmallScatterPlot data={housingData} yDataKey={"year_built"} xDataKey={"bath"} />
        <SmallScatterPlot data={housingData} yDataKey={"year_built"} xDataKey={"price_per_sqft"} />
      
        <SmallScatterPlot class={'first-graphic-row-4'} data={housingData} yDataKey={"sqft"} xDataKey={"beds"} />
        <SmallScatterPlot data={housingData} yDataKey={"sqft"} xDataKey={"bath"} />
        <SmallScatterPlot data={housingData} yDataKey={"sqft"} xDataKey={"price_per_sqft"} />
      
        <SmallScatterPlot class={'first-graphic-row-5'} data={housingData} yDataKey={"beds"} xDataKey={"bath"} />
        <SmallScatterPlot data={housingData} yDataKey={"beds"} xDataKey={"price_per_sqft"} />
      
        <SmallScatterPlot class={'first-graphic-row-6'} data={housingData} yDataKey={"bath"} xDataKey={"price_per_sqft"} />
      </div>
  )
}

export default App;
