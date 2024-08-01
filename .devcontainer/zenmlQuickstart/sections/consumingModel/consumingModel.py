from typing_extensions import Annotated
import pandas as pd
from zenml import step, pipeline, Model, get_step_context
from zenml.client import Client
from uuid import UUID
from zenml import pipeline
from steps import (
    data_loader,
    inference_preprocessor
)

client = Client()
preprocessing_pipeline_artifact_version = client.get_artifact_version("preprocess_pipeline")

@step
def inference_predict(dataset_inf: pd.DataFrame) -> Annotated[pd.Series, "predictions"]:
    """Predictions step"""
    # Get the model
    model = get_step_context().model

    # run prediction from memory
    predictor = model.load_artifact("sklearn_classifier")
    predictions = predictor.predict(dataset_inf)

    predictions = pd.Series(predictions, name="predicted")

    return predictions

@pipeline
def inference(preprocess_pipeline_id: UUID):
    """Model batch inference pipeline"""
    # random_state = client.get_artifact_version(name_id_or_prefix=preprocess_pipeline_id).metadata["random_state"].value
    # target = client.get_artifact_version(name_id_or_prefix=preprocess_pipeline_id).run_metadata['target'].value
    random_state = 42
    target = "target"

    df_inference = data_loader(
        random_state=random_state, is_inference=True
    )
    df_inference = inference_preprocessor(
        dataset_inf=df_inference,
        # We use the preprocess pipeline from the feature engineering pipeline
        preprocess_pipeline=client.get_artifact_version(name_id_or_prefix=preprocess_pipeline_id),
        target=target,
    )
    inference_predict(
        dataset_inf=df_inference,
    )

pipeline_settings = {"enable_cache": False}

# Lets add some metadata to the model to make it identifiable
pipeline_settings["model"] = Model(
    name="breast_cancer_classifier",
    version="production", # We can pass in the stage name here!
    license="Apache 2.0",
    description="A breast cancer classifier",
    tags=["breast_cancer", "classifier"],
)

# the `with_options` method allows us to pass in pipeline settings
#  and returns a configured pipeline
inference_configured = inference.with_options(**pipeline_settings)

# Let's run it again to make sure we have two versions
# We need to pass in the ID of the preprocessing done in the feature engineering pipeline
# in order to avoid training-serving skew

inference_configured(
    preprocess_pipeline_id=preprocessing_pipeline_artifact_version.id
)
