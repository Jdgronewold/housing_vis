import React from 'react';

import { SmallScatterPlot } from './Plots/smallScatterPlot'
import { InitialVariablePlot } from './Plots/InitialVariablePlot'
import { housingData } from './data'
import { processData } from './Utils/process_data'
import { LogisticRegression } from './TensforFlow/logisticRegression'

import './App.css'

const App: React.FC = () => {
  const { features, labels, testFeatures, testLabels } = processData(housingData, {
    labelColumns: ['in_sf'],
    dataColumns: ['elevation', 'price_per_sqft']
  })

  const test = new LogisticRegression(features, labels)
  test.train();
  console.log(test.test(testFeatures, testLabels))
  
  return (
    <div className="App" style={{ height: 10000 }}>
      <RenderSmallPlots />
      <InitialVariablePlot
        data={housingData}
        transitionHeights={[600, 1200, 3000, 5000, 7200]}
        height={Math.max(document.body.getBoundingClientRect().height, 800)}
        width={600}
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
