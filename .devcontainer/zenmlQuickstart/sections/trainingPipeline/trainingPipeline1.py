import pandas as pd
from sklearn.base import ClassifierMixin
from sklearn.ensemble import RandomForestClassifier
from sklearn.linear_model import SGDClassifier
from typing_extensions import Annotated
from zenml import ArtifactConfig, step, pipeline
from zenml.logger import get_logger
from typing import Optional, List
from uuid import UUID
logger = get_logger(__name__)

from pipelines import feature_engineering 
from steps import model_evaluator
from zenml.client import Client

# Initialize the ZenML client to fetch objects from the ZenML Server
client = Client()
dataset_trn_artifact_version = client.get_artifact_version("dataset_trn")
dataset_tst_artifact_version = client.get_artifact_version("dataset_tst")
@step
def model_trainer(
    dataset_trn: pd.DataFrame,
    model_type: str = "sgd",
) -> Annotated[ClassifierMixin, ArtifactConfig(name="sklearn_classifier", is_model_artifact=True)]:
    """Configure and train a model on the training dataset."""
    target = "target"
    if model_type == "sgd":
        model = SGDClassifier()
    elif model_type == "rf":
        model = RandomForestClassifier()
    else:
        raise ValueError(f"Unknown model type {model_type}")   

    logger.info(f"Training model {model}...")

    model.fit(
        dataset_trn.drop(columns=[target]),
        dataset_trn[target],
    )
    return model

@pipeline
def training(
    train_dataset_id: Optional[UUID] = None,
    test_dataset_id: Optional[UUID] = None,
    model_type: str = "sgd",
    min_train_accuracy: float = 0.0,
    min_test_accuracy: float = 0.0,
):
    
    
    """Model training pipeline.""" 
    if train_dataset_id is None or test_dataset_id is None:
        # If we dont pass the IDs, this will run the feature engineering pipeline   
        dataset_trn, dataset_tst = feature_engineering()
    else:
        # Load the datasets from an older pipeline
        dataset_trn = client.get_artifact_version(name_id_or_prefix=train_dataset_id)
        dataset_tst = client.get_artifact_version(name_id_or_prefix=test_dataset_id) 

    trained_model = model_trainer(
        dataset_trn=dataset_trn,
        model_type=model_type,
    )

    model_evaluator(
        model=trained_model,
        dataset_trn=dataset_trn,
        dataset_tst=dataset_tst,
        min_train_accuracy=min_train_accuracy,
        min_test_accuracy=min_test_accuracy,
    )
    

# Use a random forest model with the chosen datasets.
# We need to pass the ID's of the datasets into the function
training(
    model_type="rf",
    train_dataset_id=dataset_trn_artifact_version.id,
    test_dataset_id=dataset_tst_artifact_version.id
)

rf_run = client.get_pipeline("training").last_run
# Use a SGD classifier
sgd_run = training(
    model_type="sgd",
    train_dataset_id=dataset_trn_artifact_version.id,
    test_dataset_id=dataset_tst_artifact_version.id
)

sgd_run = client.get_pipeline("training").last_run

# The evaluator returns a float value with the accuracy

print(rf_run.steps["model_evaluator"].output.load() > sgd_run.steps["model_evaluator"].output.load())
