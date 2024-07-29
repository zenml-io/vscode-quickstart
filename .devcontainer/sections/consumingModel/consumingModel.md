# Consuming the Model in Production 🚀

The batch inference pipeline simply takes the model marked as `production` and runs inference on it
with `live data`. The critical step here is the `inference_predict` step, where we load the model in memory
and generate predictions:

<img src="/zenmlQuickstart/assets/inference_pipeline.png" alt="Inference pipeline">

Apart from the loading the model, we must also load the preprocessing pipeline that we ran in feature engineering,
so that we can do the exact steps that we did on training time, in inference time.

The way to load the right model is to pass in the `production` stage into the `Model` config this time.
This will ensure to always load the production model, decoupled from all other pipelines.
