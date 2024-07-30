# Using the Model Control Plane 👷‍♂️

If you are a [ZenML Cloud](https://zenml.io/cloud) user, you can see all of this visualized in the dashboard:

<img src="/zenmlQuickstart/assets/cloud_mcp_screenshot.png" width="70%" alt="Model Control Plane">

There is a lot more you can do with ZenML models, including the ability to
track metrics by adding metadata to it, or having them persist in a model
registry. However, these topics can be explored more in the
[ZenML docs](https://docs.zenml.io).

For now, we will use the ZenML model control plane to promote our best
model to `production`. You can do this by simply setting the `stage` of
your chosen model version to the `production` tag.

# Set our best classifier to production

```python
rf_zenml_model_version.set_stage("production", force=True)
```

Of course, normally one would only promote the model by comparing to all other model
versions and doing some other tests. But that's a bit more advanced use-case. See the
[e2e_batch example](https://github.com/zenml-io/zenml/tree/main/examples/e2e) to get
more insight into that sort of flow!

Once the model is promoted, we can now consume the right model version in our
batch inference pipeline directly. Let's see how that works.
