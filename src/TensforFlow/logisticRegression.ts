import tf from '@tensorflow/tfjs'
import {} from 'lodash'

interface RegressionOptions {
  learningRate: number
  iterations: number
  decisionBoundary: number
}
export class LogisticRegression {
  private features: tf.Tensor
  private labels: tf.Tensor
  private costHistory: number[]
  private options: RegressionOptions
  private weights: tf.Tensor
  private mean: tf.Tensor
  private variance: tf.Tensor

  constructor(features: number[][], labels: number[][], options: RegressionOptions) {
    this.features = this.processFeatures(features);
    this.labels = tf.tensor(labels);
    this.costHistory = [];

    this.options = {
      ...{ learningRate: 0.1, iterations: 1000, decisionBoundary: 0.5 },
      ...options
    };

    this.weights = tf.zeros([this.features.shape[1], 1]);
  }

  private processFeatures(features: number[][]) {
    let featuresTensor = tf.tensor(features);
    
    if (this.mean && this.variance) {
      featuresTensor = featuresTensor.sub(this.mean).div(this.variance.pow(0.5));
    } else {
      featuresTensor = this.standardize(featuresTensor);
    }

    featuresTensor = tf.ones([featuresTensor.shape[0], 1]).concat(featuresTensor, 1);

    return featuresTensor;
  }

  private standardize(featuresTensor: tf.Tensor) {
    const { mean, variance } = tf.moments(featuresTensor, 0);

    this.mean = mean;
    this.variance = variance;

    return featuresTensor.sub(mean).div(variance.pow(0.5));
  }
}

