# NSL-KDD Network Intrusion Detection — Presentation Blueprint

This document is a complete, self-contained slide blueprint for building a presentation. Every slide includes exact layout, design, and on-slide content instructions so it can be handed directly to a PPT creation agent.
Source notebook for all charts and metrics: `correlation_analysis.ipynb`.

## Global Deck Rules (apply to all slides)
- Slide size: 16:9 widescreen.
- Theme: clean technical style, white background, dark text.
- Font family: Calibri or Aptos only.
- Title font: 38 pt bold.
- Body font: 24 pt regular.
- Caption font: 16 pt gray.
- Color palette:
  - Primary blue: `#1f77b4`
  - Secondary teal: `#2ca02c`
  - Alert red: `#d62728`
  - Neutral gray: `#6b7280`
- Keep all charts with axis labels and units.
- Do not use vague placeholders; all bullets and labels must be exactly as written below.

---

## Slide 1 — Title Slide
**Slide objective:** Introduce project scope and audience context.

**Layout:**
- Full-width title at top-left.
- Subtitle block below title.
- Footer row with author/project/date.

**On-slide text:**
- Title: `Network Intrusion Detection using NSL-KDD`
- Subtitle: `Data Preprocessing, Trend Analysis, Feature Selection, and Model Comparison`
- Footer left: `Repository: Mvishere/Network-Intrusion-Detection`
- Footer center: `Dataset: NSL-KDD (KDDTrain+)`
- Footer right: `Prepared on: 2026-04-19`

**Visual design details:**
- Add a thin blue line under title.
- Add small shield/network icon on top-right.

---

## Slide 2 — Problem Statement and Goals
**Slide objective:** Define why the project exists and what success means.

**Layout:** Two-column.
- Left column: “Problem”
- Right column: “Goals”

**On-slide text:**
- Left title: `Problem`
- Left bullets:
  1. `Modern networks generate massive traffic with mixed normal and malicious behavior.`
  2. `Manual threat identification is slow and error-prone.`
  3. `We need a repeatable ML workflow for intrusion detection.`
- Right title: `Project Goals`
- Right bullets:
  1. `Load and profile NSL-KDD data reliably.`
  2. `Apply preprocessing and confirm data quality.`
  3. `Visualize traffic and attack trends.`
  4. `Select high-value features.`
  5. `Compare classifiers on accuracy, F1, and training time.`

---

## Slide 3 — Dataset Overview
**Slide objective:** Explain source and schema at a glance.

**Layout:**
- Top: short dataset description.
- Bottom: 3 KPI cards side-by-side.

**On-slide text:**
- Header: `Dataset Overview (NSL-KDD KDDTrain+)`
- Description paragraph:
  `The workflow uses the NSL-KDD training dataset downloaded from the official public source. Columns are assigned using the provided field-name file, with added labels for attack_type and difficulty_level.`
- KPI card 1 title: `Rows`
- KPI card 1 value: `125,973`
- KPI card 2 title: `Columns`
- KPI card 2 value: `43`
- KPI card 3 title: `Target`
- KPI card 3 value: `attack_type`

**Visual design details:**
- Card background light gray (`#f3f4f6`), rounded corners.

---

## Slide 4 — Data Preprocessing Pipeline
**Slide objective:** Show the exact preprocessing sequence.

**Layout:** Horizontal step-flow with 6 boxes and arrows.

**On-slide text (exact box order):**
1. `Load raw dataset and field names`
2. `Assign column headers`
3. `Check missing values and duplicates`
4. `Convert difficulty_level to numeric`
5. `One-hot encode categorical features`
6. `Scale numeric features with StandardScaler`

**Footer text:**
`Preprocessing is performed before model training; train-test split uses stratification on target labels.`

---

## Slide 5 — Data Quality Results
**Slide objective:** Report preprocessing outcomes explicitly.

**Layout:**
- Left: table.
- Right: short interpretation bullets.

**On-slide table (2 columns):**
- `Metric | Result`
- `Total missing values after preprocessing | 0`
- `Imputation action | Not required (logic exists in notebook if nulls appear)`
- `Duplicate rows | Removed if detected`
- `Categorical columns | Encoded via one-hot`
- `Numerical columns | Standardized`
- `Target label handling | LabelEncoder applied`

**Right-side bullets:**
1. `Data quality checks are integrated into notebook execution.`
2. `Cleaning operations are deterministic and reproducible.`
3. `Processed data is ready for feature selection and model evaluation.`

---

## Slide 6 — Traffic Trend: Normal vs Attack
**Slide objective:** Show class composition trend.

**Layout:**
- Left: pie chart.
- Right: 3 key takeaways.

**Chart instructions:**
- Use notebook figure from `Traffic Composition: Normal vs Attack`.
- Colors: normal=`#4daf4a`, attack=`#e41a1c`.
- Show percentages with one decimal.

**Right-side text:**
1. `Attack traffic occupies a substantial share of records.`
2. `Class imbalance risk is present for multi-class modeling.`
3. `Balancing strategy is required on training split.`

---

## Slide 7 — Trend: Most Frequent Attack Types
**Slide objective:** Show dominant attack categories.

**Layout:** Single large horizontal bar chart.

**Chart instructions:**
- Use notebook chart `Top 12 Attack Types by Frequency`.
- Y-axis: attack_type.
- X-axis: record count.
- Keep descending sort.

**Caption text:**
`Long-tail behavior is visible: a few attack types dominate while several classes are rare.`

---

## Slide 8 — Trend: Protocol Behavior by Traffic Class
**Slide objective:** Compare protocol mix between normal and attack traffic.

**Layout:**
- Top: stacked bar chart.
- Bottom: interpretation strip.

**Chart instructions:**
- Use notebook chart `Protocol Mix by Traffic Class (Row %)`.
- Show normalized proportions (0–1 y-axis).
- Legend order: normal, attack.

**Bottom interpretation text:**
`Protocol composition differs between normal and malicious traffic, indicating protocol_type carries predictive signal.`

---

## Slide 9 — Feature Engineering and Selection
**Slide objective:** Explain how features were reduced.

**Layout:** Two-column.
- Left: process bullets.
- Right: top-feature-importance chart snapshot.

**Left column text:**
1. `All categorical variables encoded once.`
2. `Feature space expanded after encoding.`
3. `ExtraTreesClassifier computed importance scores.`
4. `Top 30 features selected for compact model variant.`

**Right chart instructions:**
- Use notebook figure `Top 30 Features from ExtraTrees`.
- Keep feature names readable; reduce font only if needed.

---

## Slide 10 — Model Comparison Results
**Slide objective:** Show classifier performance across feature sets.

**Layout:** 2x2 chart grid.

**Charts to include (from notebook):**
1. `Test Accuracy: All Features vs Top 30`
2. `F1 Score: All Features vs Top 30`
3. `Training Time: All Features vs Top 30`
4. `Precision & Recall Comparison`

**Mandatory annotation text box:**
`Each classifier is trained twice: once on all encoded features and once on top 30 selected features.`

---

## Slide 11 — Impact Analysis (Top 30 vs All Features)
**Slide objective:** Present performance deltas clearly.

**Layout:**
- Left chart: `ΔF1 Score`
- Right chart: `ΔTraining Time`
- Bottom: verdict box

**On-slide verdict text:**
`Top-30 feature modeling is preferred when F1 remains stable and training time decreases. Use all features if meaningful F1 degradation appears.`

**Design details:**
- Positive deltas in green, negative in red.
- Include exact delta values above bars.

---

## Slide 12 — Final Conclusions and Next Steps
**Slide objective:** Close with actionable outcomes.

**Layout:**
- Left: conclusions (numbered).
- Right: next steps checklist.

**Left conclusions text:**
1. `Notebook now includes explicit preprocessing checks and cleaning logic.`
2. `Trend visualizations reveal class, attack-type, and protocol behavior patterns.`
3. `Feature selection provides a compact alternative to full encoded feature space.`
4. `Model comparison framework supports data-driven deployment choice.`

**Right next steps text:**
- `[ ] Validate on KDDTest+ split`
- `[ ] Add confusion matrix per class`
- `[ ] Add ROC-AUC for one-vs-rest attack classes`
- `[ ] Package best model artifacts for inference API`

**Closing footer text:**
`End of presentation — all plots and metrics are reproducible from correlation_analysis.ipynb.`
