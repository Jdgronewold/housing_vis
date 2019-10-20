import React from 'react';

import { SmallScatterPlot } from './Plots/smallScatterPlot'
import { InitialVariablePlot } from './Plots/InitialVariablePlot'
import { housingData, HouseData } from './data'
import { processData } from './Utils/process_data'
import { LogisticRegression } from './TensforFlow/logisticRegression'
import { RadialLinePlot } from './Plots/RadialLinePlot'

import './App.css'

// const { features, labels, testFeatures, testLabels } = processData(housingData, {
//   labelColumns: ['in_sf'],
//   dataColumns: ['elevation', 'price_per_sqft'],
//   splitTest: 100,
//   shuffle: true
// })

// const test = new LogisticRegression(features, labels)
// test.train();
// const percentageRight = test.test(testFeatures, testLabels)
// console.log('precentage right = ', percentageRight * 100, "%");
  

const App: React.FC = () => {
  console.log('data length', housingData.length)
  console.log(housingData.reduce((accum: number, data: HouseData) => {
    return accum += data.in_sf
  }, 0))
  
  return (
    <div className="App" style={{ height: 10000 }}>
      {/* <RenderSmallPlots />
      <InitialVariablePlot
        data={housingData}
        transitionHeights={[600, 1200, 3000, 5000, 7200, 7500]}
        height={Math.max(document.body.getBoundingClientRect().height, 800)}
        width={600}
        />
      <SmallScatterPlot data={housingData} yDataKey={"in_sf"} xDataKey={"elevation"} width={600} height={600} /> */}
      <RadialLinePlot
        data={housingData}
        yDataKey={"in_sf"}
        xDataKey={"elevation"}
        width={600}
        height={600}
        transitionHeights={[600, 1200, 3000, 5000, 7200, 7500]}
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
