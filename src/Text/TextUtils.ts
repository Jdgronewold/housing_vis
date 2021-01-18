export const initialPlotText: string[] = [
  'Logistic regression is, at the heart of it, a means of classification. In this example we are attempting to predict whether a house is located in either New York (blue data points) or San Francisco (green data points) given other qualifying data such as elevation, price per square foot, or number of bedrooms. In the figure on the left individual houses are plotted by their elevation - it is relatively easy to see that if a house is located higher than 73 meters above sea level it is almost certainly in San Francisco.',
  'In this instance, we are using elevation as a feature. If we add more features, to our model then we are able to generate better predictions (within reason - including too many features may lead to problems of overfitting or confounding variables among other issues).',
  'Once we add another feature, in this case price per square foot, it is easy to see how many of the houses in New York and San Francisco begin to separate even more.',
  "At this point, given the two features it is fairly easy to see that any houses in the blue box are houses in New York, while any houses in the green box are in San Francisco. The goal of logistic regression is to predict those houses programatically. To do this we want to build a model that can give us the probability of a house belonging to a particular location. To begin talking about how to do that, let's go back to just looking at elevation data."
]