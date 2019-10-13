import * as tf from '@tensorflow/tfjs'
import {} from 'lodash'

interface RegressionOptions {
  learningRate: number
  iterations: number
  decisionBoundary: number
  batchSize: number
}
export class LogisticRegression {
  private features: tf.Tensor
  private labels: tf.Tensor
  private costHistory: number[]
  private options: RegressionOptions
  private weights: tf.Tensor
  private mean: tf.Tensor
  private variance: tf.Tensor

  constructor(features: number[][], labels: number[][], options?: RegressionOptions) {
    this.features = this.processFeatures(features);
    this.labels = tf.tensor(labels);
    this.costHistory = [];

    this.options = {
      ...{ learningRate: 0.1, iterations: 100, decisionBoundary: 0.5, batchSize: 1 },
      ...options
    };

    this.weights = tf.zeros([this.features.shape[1], 1]);
  }

  public gradientDescent(features, labels) {
    const currentGuesses = features.matMul(this.weights).sigmoid();
    const differences = currentGuesses.sub(labels);

    const slopes = features
      .transpose()
      .matMul(differences)
      .div(features.shape[0]);

    this.weights = this.weights.sub(slopes.mul(this.options.learningRate));
  }

  public train() {
    const batchQuantity = Math.floor(
      this.features.shape[0] / this.options.batchSize
    );

    for (let i = 0; i < this.options.iterations; i++) {
      for (let j = 0; j < batchQuantity; j++) {
        const startIndex = j * this.options.batchSize;
        const { batchSize } = this.options;

        const featureSlice = this.features.slice(
          [startIndex, 0],
          [batchSize, -1]
        );
        const labelSlice = this.labels.slice([startIndex, 0], [batchSize, -1]);

        this.gradientDescent(featureSlice, labelSlice);
      }
    }
  }

  private processFeatures(features: number[][]): tf.Tensor {
    let featuresTensor = tf.tensor(features);
    
    // normalize using the mean and std dev
    if (this.mean && this.variance) {
      featuresTensor = featuresTensor.sub(this.mean).div(this.variance.pow(0.5));
    } else {
      featuresTensor = this.standardize(featuresTensor);
    }

    // add on the first columns for the weights
    featuresTensor = tf.ones([featuresTensor.shape[0], 1]).concat(featuresTensor, 1);

    return featuresTensor;
  }

  private standardize(featuresTensor: tf.Tensor) {
    const { mean, variance } = tf.moments(featuresTensor, 0);

    this.mean = mean;
    this.variance = variance;

    // actual - average / std dev
    return featuresTensor.sub(mean).div(variance.pow(0.5));
  }

  public predict(observations: number[][]) {
    // process, the features, multiply by the weights, apply the sigmoid function
    return this.processFeatures(observations)
      .matMul(this.weights)
      .sigmoid()
      .greater(this.options.decisionBoundary)
      .cast('float32');
  }

  public test(testFeatures, testLabels) {
    const predictions = this.predict(testFeatures);
    testLabels = tf.tensor(testLabels);

    const incorrect = predictions
      .sub(testLabels)
      .abs()
      .sum()
      .dataSync<"int32">()[0];

    return (predictions.shape[0] - incorrect) / predictions.shape[0];
  }
}

