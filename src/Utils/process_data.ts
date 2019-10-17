import { isNumber } from 'lodash'
import shuffleSeed from 'shuffle-seed'
import { HouseData } from '../data';

function extractColumns(data: HouseData[], columnNames: (keyof HouseData)[]): number[][] {
  
  return data.map((d: HouseData) => {
    const dataArray: number[] = []
    columnNames.forEach((columnName: string) => {
      dataArray.push(d[columnName])
    })

    return dataArray
  })
}

interface ProcessDataParameters {
  dataColumns?: (keyof HouseData)[]
  labelColumns?: (keyof HouseData)[]
  converters?: { [key: string]: Function }
  shuffle?: boolean
  splitTest?: number
}

interface ProcessedData {
  features: number[][]
  labels: number[][]
  testFeatures?: number[][]
  testLabels?: number[][]
}

export function processData(
  data: HouseData[],
  {
    labelColumns = [],
    dataColumns = [],
    converters = {},
    shuffle = false,
    splitTest = 0
  }: ProcessDataParameters
): ProcessedData {

  let labels = extractColumns(data, labelColumns);
  let features = extractColumns(data, dataColumns);

  if (shuffle) {
    features = shuffleSeed.shuffle(features, 'phrase');
    labels = shuffleSeed.shuffle(labels, 'phrase');
  }

  if (splitTest) {
    const trainSize = isNumber(splitTest)
      ? splitTest
      : Math.floor(data.length / 2);

    return {
      features: features.slice(trainSize),
      labels: labels.slice(trainSize),
      testFeatures: features.slice(0, trainSize),
      testLabels: labels.slice(0, trainSize)
    };
  } else {
    return { features, labels };
  }
};
