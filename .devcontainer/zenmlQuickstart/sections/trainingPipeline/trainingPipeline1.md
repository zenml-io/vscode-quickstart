# Training Pipelines ⌚

Now that we have our data it makes sense to train some models to get a sense of
how difficult the task is. The Breast Cancer dataset is sufficiently large and complex
that it's unlikely we'll be able to train a model that behaves perfectly since the problem
is inherently complex, but we can get a sense of what a reasonable baseline looks like.

We'll start with two simple models, a SGD Classifier and a Random Forest
Classifier, both batteries-included from `sklearn`. We'll train them both on the
same data and then compare their performance.

<img src="/zenmlQuickstart/assets/training_pipeline.png" width="75%" alt="Training pipeline">

Our two training steps both return different kinds of `sklearn` classifier
models, so we use the generic `ClassifierMixin` type hint for the return type.

ZenML allows you to load any version of any dataset that is tracked by the framework
directly into a pipeline using the `Client().get_artifact_version` interface. This is very convenient
in this case, as we'd like to send our preprocessed dataset from the older pipeline directly
into the training pipeline.

The end goal of this quick baseline evaluation is to understand which of the two
models performs better. We'll use the `evaluator` step to compare the two
models. This step takes in the model from the trainer step, and computes its score
over the testing set.
