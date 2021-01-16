import { isNumber } from 'lodash'
import shuffleSeed from 'shuffle-seed'
import { HouseData } from '../data';


export interface SplitHouseData {
  SFData: HouseData[]
  NYData: HouseData[]
}

export function splitData(data: HouseData[]): SplitHouseData {
  const SFData: HouseData[] = []
  const NYData: HouseData[] = []

  data.forEach((houseData: HouseData) => {
    if (houseData.in_sf) {
      SFData.push(houseData)
    } else {
      NYData.push(houseData)
    }
  })

  return {
    SFData,
    NYData
  }
}

export function extractColumns(data: HouseData[], columnNames: (keyof HouseData)[]): number[][] {
  
  return data.map((d: HouseData) => {
    const dataArray: number[] = []
    columnNames.forEach((columnName: string) => {
      dataArray.push(d[columnName])
    })

    return dataArray
  })
}

export interface ProcessDataParameters {
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

enum HousingPredictions {
  POSITIVE_SF,
  NEGATIVE_SF,
  POSITIVE_NY,
  NEGATIVE_NY
}

export interface HousingSums {
  positiveSF: number
  negativeSF: number
  positiveNY: number
  negativeNY: number
}

export interface TrainedResults {
  predictions: HousingPredictions[],
  sums: HousingSums
}

export function processTrainedResults(predictions: number[], correctFeatures: number[][]): TrainedResults {
  const predictionArray: HousingPredictions[] = []
  const sums: HousingSums = {
    positiveSF: 0,
    negativeSF: 0,
    positiveNY: 0,
    negativeNY: 0
  }

   correctFeatures.forEach((feature, index) => {
    if (feature[0] === 1) {
      if (predictions[index] === 1) {
        sums.positiveSF += 1
        predictionArray.push(HousingPredictions.POSITIVE_SF)
      } else {
        predictionArray.push(HousingPredictions.NEGATIVE_SF)
        sums.negativeSF += 1
      }
    } else {
      if (predictions[index] === 0) {
        sums.positiveNY += 1
        predictionArray.push(HousingPredictions.POSITIVE_NY)
      } else {
        predictionArray.push(HousingPredictions.NEGATIVE_NY)
        sums.negativeNY += 1
      }
    }
  })

  return {
    predictions: predictionArray,
    sums
  }

}
