from zenml import pipeline, step

@step
def first_step() -> int:
	return 1
	
@step
def second_step(some_value: int) -> int:
	return some_value * 2
	
@pipeline
def my_first_pipeline():
	int_val = first_step()
	second_step(int_val)
	
my_first_pipeline()
