## 🥇 Step 2: Load your data and execute feature engineering

We'll start off by importing our data. In this quickstart we'll be working with
[the Breast Cancer](https://archive.ics.uci.edu/dataset/17/breast+cancer+wisconsin+diagnostic) dataset
which is publicly available on the UCI Machine Learning Repository. The task is a classification
problem, to predict whether a patient is diagnosed with breast cancer or not.

When you're getting started with a machine learning problem you'll want to do
something similar to this: import your data and get it in the right shape for
your training. ZenML mostly gets out of your way when you're writing your Python
code, as you'll see from when you run this code.

<img src=".assets/feature_engineering_pipeline.png" width="50%" alt="Feature engineering pipeline" />

The whole function is decorated with the `@step` decorator, which
tells ZenML to track this function as a step in the pipeline. This means that
ZenML will automatically version, track, and cache the data that is produced by
this function as an `artifact`. This is a very powerful feature, as it means that you can
reproduce your data at any point in the future, even if the original data source
changes or disappears.

Note the use of the `typing` module's `Annotated` type hint in the output of the
step. We're using this to give a name to the output of the step, which will make
it possible to access it via a keyword later on.

You'll also notice that we have included type hints for the outputs
to the function. These are not only useful for anyone reading your code, but
help ZenML process your data in a way appropriate to the specific data types.

ZenML is built in a way that allows you to experiment with your data and build
your pipelines as you work, so if you want to call this function to see how it
works, you can just call it directly. Here we take a look at the first few rows
of your training dataset.
