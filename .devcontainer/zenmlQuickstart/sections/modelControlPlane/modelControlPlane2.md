# Using the Model Control Plane 👷‍♂️

This time, running both pipelines has created two associated **model versions**.

The interesting part is that ZenML went ahead and linked all artifacts produced by the
pipelines to that model version, including the two pickle files that represent our
SGD and RandomForest classifier. We can see all artifacts directly from the model
version object:
