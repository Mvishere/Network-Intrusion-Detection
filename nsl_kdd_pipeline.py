import argparse
import json
from pathlib import Path

import joblib
import numpy as np
import pandas as pd
from sklearn.ensemble import AdaBoostClassifier, ExtraTreesClassifier, RandomForestClassifier
from sklearn.metrics import accuracy_score, f1_score, precision_score, recall_score
from sklearn.model_selection import train_test_split
from sklearn.preprocessing import LabelEncoder, StandardScaler
from sklearn.tree import DecisionTreeClassifier
from sklearn.utils import resample


DATA_URL = "https://raw.githubusercontent.com/defcom17/NSL_KDD/master/KDDTrain+.txt"
FIELDS_URL = "https://raw.githubusercontent.com/defcom17/NSL_KDD/master/Field%20Names.csv"


def load_dataset() -> pd.DataFrame:
    df = pd.read_csv(DATA_URL, header=None)
    field_names_df = pd.read_csv(FIELDS_URL, header=None)
    column_names = field_names_df[0].tolist()

    if df.shape[1] > len(column_names):
        column_names.extend(["attack_type", "difficulty_level"])

    df.columns = column_names
    return df


def random_oversample_train(X_train: pd.DataFrame, y_train: np.ndarray, random_state: int = 42):
    train_df = X_train.copy()
    train_df["target"] = y_train

    max_class_size = train_df["target"].value_counts().max()
    balanced_parts = []

    for cls_label, cls_count in train_df["target"].value_counts().items():
        cls_df = train_df[train_df["target"] == cls_label]
        if cls_count < max_class_size:
            cls_df = resample(
                cls_df,
                replace=True,
                n_samples=max_class_size,
                random_state=random_state,
            )
        balanced_parts.append(cls_df)

    train_balanced = (
        pd.concat(balanced_parts, axis=0)
        .sample(frac=1, random_state=random_state)
        .reset_index(drop=True)
    )

    X_bal = train_balanced.drop(columns=["target"])
    y_bal = train_balanced["target"].values
    return X_bal, y_bal


def evaluate_models(X_train, X_test, y_train, y_test, feature_set_name: str) -> pd.DataFrame:
    model_builders = {
        "Decision Tree": lambda: DecisionTreeClassifier(max_depth=20, random_state=42),
        "AdaBoost": lambda: AdaBoostClassifier(n_estimators=100, random_state=42),
        "Random Forest": lambda: RandomForestClassifier(
            n_estimators=200, max_depth=20, random_state=42, n_jobs=-1
        ),
    }

    rows = []
    for model_name, build in model_builders.items():
        model = build()
        model.fit(X_train, y_train)

        y_pred_train = model.predict(X_train)
        y_pred_test = model.predict(X_test)

        rows.append(
            {
                "Feature Set": feature_set_name,
                "Classifier": model_name,
                "Train Accuracy": accuracy_score(y_train, y_pred_train),
                "Test Accuracy": accuracy_score(y_test, y_pred_test),
                "Precision": precision_score(y_test, y_pred_test, average="weighted", zero_division=0),
                "Recall": recall_score(y_test, y_pred_test, average="weighted", zero_division=0),
                "F1 Score": f1_score(y_test, y_pred_test, average="weighted", zero_division=0),
            }
        )

    return pd.DataFrame(rows)


def train_and_compare(top_n_features: int, output_dir: Path):
    print("Loading dataset...")
    df = load_dataset()

    target_col = "attack_type"
    X_raw = df.drop(columns=[target_col])
    y_raw = df[target_col]

    print("\nClass distribution before balancing:")
    print(y_raw.value_counts().sort_values(ascending=False).to_string())

    categorical_features = X_raw.select_dtypes(include=["object"]).columns.tolist()
    numerical_features = X_raw.select_dtypes(include=[np.number]).columns.tolist()

    X_encoded = pd.get_dummies(X_raw, columns=categorical_features, drop_first=False)

    label_encoder = LabelEncoder()
    y = label_encoder.fit_transform(y_raw)

    X_train_full, X_test_full, y_train, y_test = train_test_split(
        X_encoded, y, test_size=0.2, random_state=42, stratify=y
    )

    scaler = StandardScaler()
    X_train_full = X_train_full.copy()
    X_test_full = X_test_full.copy()
    X_train_full[numerical_features] = scaler.fit_transform(X_train_full[numerical_features])
    X_test_full[numerical_features] = scaler.transform(X_test_full[numerical_features])

    X_train_bal, y_train_bal = random_oversample_train(X_train_full, y_train, random_state=42)

    print("\nClass distribution after balancing (training set):")
    balanced_counts = pd.Series(y_train_bal).value_counts().sort_index()
    for idx, count in balanced_counts.items():
        print(f"{label_encoder.classes_[idx]}: {count}")

    selector = ExtraTreesClassifier(n_estimators=200, random_state=42, n_jobs=-1)
    selector.fit(X_train_bal, y_train_bal)

    feature_importances = pd.DataFrame(
        {
            "Feature": X_train_bal.columns,
            "Importance": selector.feature_importances_,
        }
    ).sort_values("Importance", ascending=False)

    top_features = feature_importances.head(top_n_features)["Feature"].tolist()

    X_train_top = X_train_bal[top_features]
    X_test_top = X_test_full[top_features]

    results_all = evaluate_models(
        X_train_bal, X_test_full, y_train_bal, y_test, "All Encoded Features"
    )
    results_top = evaluate_models(
        X_train_top, X_test_top, y_train_bal, y_test, f"Top {top_n_features} Features"
    )

    comparison = pd.concat([results_all, results_top], ignore_index=True)
    comparison = comparison.sort_values(["F1 Score", "Test Accuracy"], ascending=False)

    print("\nModel comparison:")
    print(comparison.to_string(index=False))

    best_row = comparison.iloc[0]
    best_feature_set = best_row["Feature Set"]
    best_model_name = best_row["Classifier"]

    if best_model_name == "Decision Tree":
        best_model = DecisionTreeClassifier(max_depth=20, random_state=42)
    elif best_model_name == "AdaBoost":
        best_model = AdaBoostClassifier(n_estimators=100, random_state=42)
    else:
        best_model = RandomForestClassifier(n_estimators=200, max_depth=20, random_state=42, n_jobs=-1)

    if best_feature_set.startswith("Top"):
        best_X_train = X_train_top
        selected_features = top_features
    else:
        best_X_train = X_train_bal
        selected_features = X_train_bal.columns.tolist()

    best_model.fit(best_X_train, y_train_bal)

    output_dir.mkdir(parents=True, exist_ok=True)
    joblib.dump(best_model, output_dir / "best_model.joblib")
    joblib.dump(scaler, output_dir / "scaler.joblib")
    joblib.dump(label_encoder, output_dir / "label_encoder.joblib")

    metadata = {
        "target_column": target_col,
        "categorical_features": categorical_features,
        "numerical_features": numerical_features,
        "all_encoded_columns": X_encoded.columns.tolist(),
        "top_features": top_features,
        "selected_features_for_best_model": selected_features,
        "best_model": best_model_name,
        "best_feature_set": best_feature_set,
        "top_n_features": top_n_features,
    }

    with open(output_dir / "metadata.json", "w", encoding="utf-8") as f:
        json.dump(metadata, f, indent=2)

    comparison.to_csv(output_dir / "model_comparison.csv", index=False)
    feature_importances.to_csv(output_dir / "feature_importances.csv", index=False)

    print("\nSaved artifacts:")
    print(f"- {output_dir / 'best_model.joblib'}")
    print(f"- {output_dir / 'scaler.joblib'}")
    print(f"- {output_dir / 'label_encoder.joblib'}")
    print(f"- {output_dir / 'metadata.json'}")
    print(f"- {output_dir / 'model_comparison.csv'}")
    print(f"- {output_dir / 'feature_importances.csv'}")


def main():
    parser = argparse.ArgumentParser(description="NSL-KDD training pipeline")
    parser.add_argument("--top-n-features", type=int, default=30)
    parser.add_argument("--output-dir", type=Path, default=Path("artifacts"))
    args = parser.parse_args()

    train_and_compare(top_n_features=args.top_n_features, output_dir=args.output_dir)


if __name__ == "__main__":
    main()
