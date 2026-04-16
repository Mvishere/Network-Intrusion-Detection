# NSL-KDD Pipeline (Standalone)

This project contains a standalone training pipeline extracted from the notebook workflow.

## What the pipeline does

- Loads NSL-KDD training data from GitHub
- Assigns proper column names
- Prints class counts before balancing
- Applies one-hot encoding to categorical features (once)
- Applies `StandardScaler` to numerical columns
- Splits train/test with stratification
- Balances training classes with random oversampling
- Performs feature selection with `ExtraTreesClassifier`
- Selects top 30 features (configurable)
- Trains and compares models:
  - Decision Tree
  - AdaBoost
  - Random Forest
- Saves the best model and artifacts

## Files

- `nsl_kdd_pipeline.py`: End-to-end training and comparison script
- `requirements.txt`: Python dependencies
- `Dockerfile`: Containerized execution

## Run locally

1. Create and activate a Python environment.
2. Install dependencies:

```bash
pip install -r requirements.txt
```

3. Run pipeline:

```bash
python nsl_kdd_pipeline.py --top-n-features 30 --output-dir artifacts
```

## Run with Docker

1. Build image:

```bash
docker build -t nsl-kdd-pipeline .
```

2. Run container:

```bash
docker run --rm -v "${PWD}/artifacts:/app/artifacts" nsl-kdd-pipeline
```

On Windows PowerShell, use:

```powershell
docker run --rm -v "${PWD}\artifacts:/app/artifacts" nsl-kdd-pipeline
```

## Output artifacts

The script writes these files to `artifacts/`:

- `best_model.joblib`
- `scaler.joblib`
- `label_encoder.joblib`
- `metadata.json`
- `model_comparison.csv`
- `feature_importances.csv`

## Notes

- The script downloads data from GitHub at runtime, so internet access is required.
- Class balancing is applied to the training split only.
- Evaluation metrics are computed on the untouched test split.
