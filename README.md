This is a project mostly centered around re-learning how to use D3 with React, especially once hooks were involved. The project is hosted at https://housing-vis.vercel.app/ and is modeled after the work done here http://www.r2d3.us/visual-intro-to-machine-learning-part-1/, although this project uses logistic regression instead of the decision trees used by R2D3. Ultimately the majority of the graphics allow D3 to fully control the animation within a React useEffect hook while react itself renders the initial html for D3 to grab onto and manipulate. There certainly are more optimizations that can be made and code clean up to be done, but generally the scroll functionality works and is built from transition phases provided by a custom hook. The logistic regression model uses gradient descent and cross entropy to minimize the losses involved in predicted housing locations. The data can be found here https://github.com/jadeyee/r2d3-part-1-data/blob/master/part_1_data.csv if you want to play with it yourself!