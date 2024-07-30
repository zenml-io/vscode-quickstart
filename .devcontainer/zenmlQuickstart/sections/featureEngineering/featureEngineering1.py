from zenml import pipeline
from zenml.client import Client

from typing import Optional, List

from zenml import pipeline

from steps import (
    data_loader,
    data_preprocessor,
    data_splitter
)

# Initialize the ZenML client to fetch objects from the ZenML Server
client = Client()
# as in Notion Doc
@pipeline
def feature_engineering(
    test_size: float = 0.3,
    drop_na: Optional[bool] = None,
    normalize: Optional[bool] = None,
    drop_columns: Optional[List[str]] = None,
    target: Optional[str] = "target",
    random_state: int = 17
):
    """Feature engineering pipeline."""
    # Link all the steps together by calling them and passing the output
    # of one step as the input of the next step.
    raw_data = data_loader(random_state=random_state, target=target)
    dataset_trn, dataset_tst = data_splitter(
        dataset=raw_data,
        test_size=test_size,
    )
    dataset_trn, dataset_tst, _ = data_preprocessor(
        dataset_trn=dataset_trn,
        dataset_tst=dataset_tst,
        drop_na=drop_na,
        normalize=normalize,
        drop_columns=drop_columns,
        target=target,
        random_state=random_state,
    )
    
feature_engineering()
