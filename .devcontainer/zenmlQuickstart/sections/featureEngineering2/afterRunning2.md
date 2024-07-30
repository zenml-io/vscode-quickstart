# Feature Engineering with Cache 🧪

Notice the second time around, the data loader step was **cached**, while the rest of the pipeline was rerun.
This is because ZenML automatically determined that nothing had changed in the data loader step,
so it didn't need to rerun it.
