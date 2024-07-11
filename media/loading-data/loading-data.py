# Do the imports at the top
from typing_extensions import Annotated
from sklearn.datasets import load_breast_cancer

import random
import pandas as pd
from rich import print
from zenml import step, pipeline, Model, get_step_context
from zenml.client import Client
from zenml.logger import get_logger
from uuid import UUID

from typing import Optional, List

from zenml import pipeline

from steps import (
    data_loader,
    data_preprocessor,
    data_splitter,
    model_evaluator,
    inference_preprocessor
)

from zenml.logger import get_logger

logger = get_logger(__name__)

# Initialize the ZenML client to fetch objects from the ZenML Server
client = Client()

@step
def data_loader_simplified(
    random_state: int, is_inference: bool = False, target: str = "target"
) -> Annotated[pd.DataFrame, "dataset"]:  # We name the dataset 
    """Dataset reader step."""
    dataset = load_breast_cancer(as_frame=True)
    inference_size = int(len(dataset.target) * 0.05)
    dataset: pd.DataFrame = dataset.frame
    inference_subset = dataset.sample(inference_size, random_state=random_state)
    if is_inference:
        dataset = inference_subset
        dataset.drop(columns=target, inplace=True)
    else:
        dataset.drop(inference_subset.index, inplace=True)
    dataset.reset_index(drop=True, inplace=True)
    logger.info(f"Dataset with {len(dataset)} records loaded!")
    return dataset

df = data_loader_simplified(random_state=42)
print(df.head())
