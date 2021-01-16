import React from 'react';

import { SmallScatterPlot } from './Plots/smallScatterPlot'
import { InitialVariablePlot } from './Plots/InitialVariablePlot'
import { housingData } from './data'
import { processData, processTrainedResults } from './Utils/process_data'
import { LogisticRegression } from './TensforFlow/logisticRegression'
import { RadialLinePlot } from './Plots/RadialLinePlot'
import { CustomModelPlot } from './Plots/customModel'
import { TextComponent } from './Text/TextComponent'

import './App.css'
import './Plots/plots.css'

const { features, labels, testFeatures, testLabels } = processData(housingData, {
  labelColumns: ['in_sf'],
  dataColumns: ['elevation'],
  splitTest: 100,
  shuffle: true
})
const initialDefaults = { batchSize: 20, iterations: 20, learningRate: 0.05 }
export { features, labels, initialDefaults }

const logisticModel = new LogisticRegression(features, labels, initialDefaults)
logisticModel.train();
const predictionResults = logisticModel.test(testFeatures, testLabels)
const trainedResults = processTrainedResults(predictionResults.predictions, testLabels)
console.log('precentage right = ', predictionResults.percentageCorrect * 100, "%");


const App: React.FC = () => {
  const height = Math.max(document.body.getBoundingClientRect().height - 100, 800)
  const width = Math.max(document.body.getBoundingClientRect().width - 50, 800)/2
  return (
    <div className="App" style={{ height: 25000 }}>
      
      <RenderSmallPlots />
      <div style={{ position: 'relative' }}>
        <InitialVariablePlot
          data={housingData}
          transitionHeights={[600, 1200, 2000, 3000, 4500, 6500, 8700, 9000]}
          height={height}
          width={width}
          top={height}
        />
        <TextComponent
          textValues={['hello', "its meee", 'Some more text', 'boopee da poo', 'softy soft', 'wompppp']}
          top={height}
          transitionHeights={[200, 1200, 1800, 2600, 3600, 5100, 8700, 9000]}
          lastTransition={9000}
          height={height}
          width={width}
          color='red'
        />
      </div>
      <div style={{ position: 'relative' }}>
        <RadialLinePlot
            sigmoidWeights={Array.from(logisticModel.getWeights().dataSync<"int32">())}
            costValues={logisticModel.costHistory}
            data={housingData}
            yDataKey={"in_sf"}
            xDataKey={"elevation"}
            width={width}
            height={height}
            top={7500}
            transitionHeights={[7500, 7800, 7801, 9000, 12800, 14000, 16000, 18000, 22000, 24000].map( transition => transition + height)}
        />
        <TextComponent
          textValues={['hello']}
          top={7500}
          lastTransition={2400 + height}
          // lol don't do this in the future
          transitionHeights={[7500, 7800, 7801, 9000, 12800, 14000, 16000, 18000, 22000, 24000].map( transition => transition + height)}
          height={height}
          width={width}
          color='green'
        />
      </div>
      
      <CustomModelPlot
        height={800}
        width={width}
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
      
        <div className={'first-graphic-row-3-text title-text'}> <span>My very poor</span> </div>
        <SmallScatterPlot class={'first-graphic-row-3'} data={housingData} yDataKey={"year_built"} xDataKey={"sqft"} />
        <SmallScatterPlot data={housingData} yDataKey={"year_built"} xDataKey={"beds"} />
        <SmallScatterPlot data={housingData} yDataKey={"year_built"} xDataKey={"bath"} />
        <SmallScatterPlot data={housingData} yDataKey={"year_built"} xDataKey={"price_per_sqft"} />
      
        <div className={'first-graphic-row-4-text title-text'}> <span> explanation of logistic </span></div>
        <SmallScatterPlot class={'first-graphic-row-4'} data={housingData} yDataKey={"sqft"} xDataKey={"beds"} />
        <SmallScatterPlot data={housingData} yDataKey={"sqft"} xDataKey={"bath"} />
        <SmallScatterPlot data={housingData} yDataKey={"sqft"} xDataKey={"price_per_sqft"} />
      
        <div className={'first-graphic-row-5-text title-text'}> <span>regression (and mostly an</span> </div>
        <SmallScatterPlot class={'first-graphic-row-5'} data={housingData} yDataKey={"beds"} xDataKey={"bath"} />
        <SmallScatterPlot data={housingData} yDataKey={"beds"} xDataKey={"price_per_sqft"} />
      
        <div className={'first-graphic-row-6-text title-text'}> <span> excuse to relearn D3 for the 14th time)</span> </div>
        <SmallScatterPlot class={'first-graphic-row-6'} data={housingData} yDataKey={"bath"} xDataKey={"price_per_sqft"} />
      </div>
  )
}

export default App;
