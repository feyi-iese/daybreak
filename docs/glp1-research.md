# GLP-1 / Tirzepatide Clinical Reference

> **Web verification: YES.** Every quantitative claim below was checked against a primary or authoritative source (WHO, NEJM, The Lancet, the FDA prescribing label, ADA) during research and carries an inline citation (source name + URL). Figures that could not be attributed to such a source are marked `[UNVERIFIED]`. This document **summarizes published data only**. It is **not medical advice** and contains **no dosing or treatment recommendations**.

---

## 1. BMI categories (adults, WHO)

WHO defines overweight and obesity in adults using a **single set of numeric BMI cut-offs (kg/m²)**. The principal international classification:

| Category | BMI (kg/m²) |
|---|---|
| Underweight | < 18.5 |
| Normal (healthy) weight | 18.5 – 24.9 |
| Overweight (pre-obese) | 25.0 – 29.9 |
| Obese — Class I | 30.0 – 34.9 |
| Obese — Class II | 35.0 – 39.9 |
| Obese — Class III | ≥ 40.0 |

- WHO obesity fact sheet (adults): overweight = BMI ≥ 25; obesity = BMI ≥ 30 — WHO, *Obesity and overweight* (8 Dec 2025), https://www.who.int/news-room/fact-sheets/detail/obesity-and-overweight
- Full sub-classification (Underweight < 18.5; Normal 18.5–24.9; Pre-obese 25–29.9; Obese Class I 30–34.9, Class II 35–39.9, Class III ≥ 40) — WHO, *Obesity: preventing and managing the global epidemic* (WHO Technical Report Series 894), international classification of adult underweight/overweight/obesity, https://iris.who.int/handle/10665/42330

**For the MVP dashboard, the four headline buckets are:** Underweight (< 18.5), Normal (18.5–24.9), Overweight (25.0–29.9), Obese (≥ 30.0).

### Do the standard adult BMI cut-offs differ by gender? — No.
The WHO adult cut-offs (18.5 / 25 / 30 / 35 / 40) are applied **identically to men and women**. WHO's long-standing position is that BMI "is the same for both sexes and for all ages of adults," and the WHO obesity fact sheet lists single adult thresholds (overweight ≥ 25, obesity ≥ 30) with **no sex-specific values** — WHO, *Obesity and overweight* (https://www.who.int/news-room/fact-sheets/detail/obesity-and-overweight) and WHO TRS 894 (https://iris.who.int/handle/10665/42330). Sex- and age-specific BMI references exist **only for children and adolescents** (BMI-for-age, scored by sex against the WHO growth reference), not for adults — WHO, *Obesity and overweight*.

### Known limitations of BMI
- BMI is a **surrogate marker of fatness**, not a direct measure of body fat; WHO recommends additional measures such as **waist circumference** to help diagnose obesity — WHO, *Obesity and overweight*, https://www.who.int/news-room/fact-sheets/detail/obesity-and-overweight
- Because it is computed only from weight and height, BMI **does not distinguish fat mass from muscle/lean mass or bone**, and the same BMI may correspond to **different degrees of fatness** across individuals, sexes and ages — i.e. it can misclassify very muscular people as "overweight/obese" and can under-detect excess adiposity in others (WHO frames BMI as a population-level screening tool, not an individual diagnosis) — WHO TRS 894, https://iris.who.int/handle/10665/42330

### Lower cut-offs for Asian populations (informational)
A WHO Expert Consultation found increased type 2 diabetes / cardiovascular risk at **lower BMI** in Asian adults (higher central/body-fat % at a given BMI). It **retained the international cut-offs as the global classification** but identified additional **public-health action points at 23, 27.5, 32.5 and 37.5 kg/m²**, with **≥ 23 = "increased risk"** and **≥ 27.5 = "high risk."** — WHO Expert Consultation, *Appropriate body-mass index for Asian populations and its implications for policy and intervention strategies*, **The Lancet** 2004;363:157–163, https://www.thelancet.com/journals/lancet/article/PIIS0140-6736(03)15268-3/abstract

---

## 2. Time-to-target weight-loss benchmarks (tirzepatide, SURMOUNT trials)

> **Caveat (must surface in any projection):** these are **trial averages over fixed timeframes**, not guarantees. Weight loss is **non-linear** (faster early, plateauing later) and **individual results vary widely**. Any in-app "time to target" estimate must be presented as a **rough range** with the label **"individual results vary — not medical advice."**

### SURMOUNT-1 — adults *without* type 2 diabetes (primary benchmark)
Phase 3, double-blind, placebo-controlled; **N = 2,539**; BMI ≥ 30, or ≥ 27 with a weight-related complication; **72 weeks** including a **20-week dose-escalation** period; adjunct to reduced-calorie diet + activity. Mean baseline weight 104.8 kg, mean BMI 38.0 — Jastreboff et al., NEJM 2022;387:205–216, https://www.nejm.org/doi/full/10.1056/NEJMoa2206038

Mean % body-weight change at **week 72**, by maintenance dose (NEJM, same source):

| Dose | Treatment-regimen estimand* | Efficacy estimand** (≈ as-treated) |
|---|---|---|
| 5 mg | −15.0% | −16.0% (≈ 16.1 kg) |
| 10 mg | −19.5% | −21.4% (≈ 22.2 kg) |
| 15 mg | −20.9% | −22.5% (≈ 23.6 kg) |
| Placebo | −3.1% | −2.4% (≈ 2.4 kg) |

\* all randomized participants regardless of discontinuation; \*\* effect if treatment taken as intended. (NEJM 2022, https://www.nejm.org/doi/full/10.1056/NEJMoa2206038)

Proportion reaching weight-loss thresholds at week 72 (5 / 10 / 15 mg vs placebo; treatment-regimen estimand):

| Threshold | 5 mg | 10 mg | 15 mg | Placebo |
|---|---|---|---|---|
| ≥ 5% | 85.1% | 88.9% | 90.9% | 34.5% |
| ≥ 10% | 68.5% | 78.1% | 83.5% | 18.8% |
| ≥ 15% | 48.0% | 66.6% | 70.6% | 8.8% |
| ≥ 20% | 30.0% | 50.1% | 56.7% | 3.1% |
| ≥ 25% | 15.3% | 32.3% | 36.2% | 1.5% |

— all from NEJM 2022 Table 2, https://www.nejm.org/doi/full/10.1056/NEJMoa2206038

**Trajectory / timepoints useful for a rough projection** (NEJM 2022, same source):
- Interim: at **week 20** (end of escalation), pooled tirzepatide groups had lost **−12.8 kg** vs **−2.7 kg** placebo — so a large share of total loss accrues during/just after escalation.
- The **5-mg group reached a plateau** by week 72; **10- and 15-mg groups were near-plateau** — i.e. loss decelerates over the second half of the 72-week period rather than continuing linearly. A linear extrapolation will **over-predict**; a front-loaded curve flattening toward a dose-dependent asymptote (~15–21% by ~72 weeks) is more realistic for range estimates.

### SURMOUNT-2 — adults *with* type 2 diabetes (supplementary)
Phase 3, double-blind, placebo-controlled; **N = 938** (10 mg n=312, 15 mg n=311, placebo n=315); BMI ≥ 27 and type 2 diabetes (HbA1c 7–10%); **72 weeks** — Garvey et al., **The Lancet** 2023, https://www.thelancet.com/journals/lancet/article/PIIS0140-6736(23)01200-X/abstract

Mean % body-weight change at week 72 (Lancet 2023 / Lilly results release, https://investor.lilly.com/news-releases/news-release-details/lillys-tirzepatide-achieved-157-weight-loss-adults-obesity-or):

| Dose | Treatment-regimen estimand | Efficacy estimand |
|---|---|---|
| 10 mg | −12.8% | −13.4% |
| 15 mg | −14.7% | −15.7% |
| Placebo | −3.2% | −3.3% |

- ≥ 5% weight loss: **79.2%** (10 mg), **82.7%** (15 mg), 32.5% (placebo); ≥ 15%: 39.7% / 48.0% / 2.7% (Lilly results release, link above).
- Glycemic effect: mean HbA1c fell from **8.0% → 5.9%** at week 72 — SURMOUNT-2, https://www.patientcareonline.com/view/surmount-2-tirzepatide-treatment-leads-to-average-15-weight-loss-in-adults-with-t2d-obesity
- **Note:** weight loss is **smaller in the type-2-diabetes population** (~13–15%) than in non-diabetic obesity (~15–21%); a projection should account for which cohort a user resembles.

---

## 3. Common side effects of tirzepatide

Adverse effects are **predominantly gastrointestinal**, mostly **mild–moderate**, **transient**, and concentrated during **dose escalation** — NEJM 2022 (https://www.nejm.org/doi/full/10.1056/NEJMoa2206038) and FDA Zepbound label (https://zepbound.lilly.com/hcp/clinical-data-weight).

**SURMOUNT-1 trial — events in ≥ 5% of any tirzepatide group, by dose (5 / 10 / 15 mg vs placebo)** — NEJM 2022 Table 4, https://www.nejm.org/doi/full/10.1056/NEJMoa2206038:

| Adverse event | 5 mg | 10 mg | 15 mg | Placebo |
|---|---|---|---|---|
| Nausea | 24.6% | 33.3% | 31.0% | 9.5% |
| Diarrhea | 18.7% | 21.2% | 23.0% | 7.3% |
| Constipation | 16.8% | 17.1% | 11.7% | 5.8% |
| Vomiting | 8.3% | 10.7% | 12.2% | 1.7% |
| Dyspepsia (indigestion) | 8.9% | 9.7% | 11.3% | 4.2% |
| Decreased appetite | 9.4% | 11.5% | 8.6% | 3.3% |
| Abdominal pain | 4.9% | 5.3% | 4.9% | 3.3% |
| Eructation (burping) | 3.8% | 5.2% | 5.6% | 0.6% |
| Injection-site reaction | 2.9% | 5.7% | 4.6% | 0.3% |
| Dizziness | 4.1% | 5.5% | 4.1% | 2.3% |
| Alopecia (hair loss) | 5.1% | 4.9% | 5.7% | 0.9% |
| Headache | 6.5% | 6.8% | 6.5% | 6.5% |

Discontinuation due to adverse events: **4.3% / 7.1% / 6.2%** (5/10/15 mg) vs **2.6%** placebo (NEJM 2022, same source).

**FDA Zepbound label — pooled Studies 1 & 2 (corroboration):**
- Any GI adverse reaction: **~56%** at each dose vs **30%** placebo — FDA Zepbound prescribing information / Lilly clinical data, https://zepbound.lilly.com/hcp/clinical-data-weight
- Nausea **25 / 29 / 28%**, diarrhea **19 / 21 / 23%**, vomiting **8 / 11 / 13%**, constipation **17 / 14 / 11%** (5/10/15 mg) — same source.
- Discontinuation due to GI events: **1.9 / 3.3 / 4.3%** vs 0.5% placebo; most nausea/vomiting/diarrhea occurred during escalation and decreased over time — FDA Zepbound label, https://www.accessdata.fda.gov/drugsatfda_docs/label/2023/217806s000lbl.pdf
- Label's ≥ 5% list also includes **abdominal pain, GERD/reflux, fatigue, hypersensitivity reactions, injection-site reactions, hair loss, eructation**; decreased appetite ~9.5% and injection-site reactions ~8.2% reported — FDA Zepbound prescribing information, https://www.accessdata.fda.gov/drugsatfda_docs/label/2023/217806s000lbl.pdf
- Cardiovascular: mean **heart-rate increase of 1–3 bpm** vs no increase on placebo — FDA Zepbound label, https://www.accessdata.fda.gov/drugsatfda_docs/label/2024/217806s003lbl.pdf

**Less common but label-flagged (not "common"):** gallbladder events (cholecystitis), pancreatitis, acute kidney injury from dehydration, hypoglycemia (mainly with insulin/sulfonylureas) — incidences low (≤ ~1–3%) in SURMOUNT-1 (NEJM 2022, https://www.nejm.org/doi/full/10.1056/NEJMoa2206038). **Suggested seed list for side-effect logging:** nausea, vomiting, diarrhea, constipation, abdominal pain, indigestion/reflux, decreased appetite, burping, fatigue, dizziness, headache, hair loss, injection-site reaction.

---

## 4. Key health vitals/metrics to track on GLP-1s (informational)

Suggested metrics for a future vitals feature, each with a one-line rationale and source where a specific claim is made:

| Metric | Why track it |
|---|---|
| **Body weight / BMI** | Primary efficacy signal; measure consistently (e.g. same time of day). WHO defines weight/BMI as the basis of overweight/obesity status — WHO, https://www.who.int/news-room/fact-sheets/detail/obesity-and-overweight |
| **Waist circumference** | Complements BMI for central adiposity; WHO recommends it as an adjunct to diagnose obesity. SURMOUNT-1 reduced waist circumference by **14.0–18.5 cm** (5–15 mg) — WHO (link above) & NEJM 2022, https://www.nejm.org/doi/full/10.1056/NEJMoa2206038 |
| **HbA1c / blood glucose** | Tracks glycemic effect; ADA HbA1c goal is **< 7%** for many non-pregnant adults. In SURMOUNT-2 mean HbA1c fell **8.0% → 5.9%**; watch for hypoglycemia if combined with insulin/sulfonylureas — ADA Standards of Care, https://pmc.ncbi.nlm.nih.gov/articles/PMC12690185/ & SURMOUNT-2, https://www.patientcareonline.com/view/surmount-2-tirzepatide-treatment-leads-to-average-15-weight-loss-in-adults-with-t2d-obesity |
| **Blood pressure** | Often falls with weight loss; SURMOUNT-1 lowered systolic BP by **~7.2 mmHg** (pooled), which may prompt antihypertensive review by a clinician — NEJM 2022, https://www.nejm.org/doi/full/10.1056/NEJMoa2206038 |
| **Heart rate / pulse** | GLP-1/GIP agonists can raise resting HR; FDA Zepbound label reports a mean increase of **1–3 bpm** (and a SURMOUNT-1 ambulatory substudy showed up to ~+5 bpm at 15 mg) — FDA label (https://www.accessdata.fda.gov/drugsatfda_docs/label/2024/217806s003lbl.pdf) & AHA *Hypertension* substudy (https://www.ahajournals.org/doi/10.1161/HYPERTENSIONAHA.123.22022) |
| **Lipids (triglycerides, LDL, HDL)** | Cardiometabolic risk markers; SURMOUNT-1 improved triglycerides (~−24.8%) and other lipids vs placebo — NEJM 2022, https://www.nejm.org/doi/full/10.1056/NEJMoa2206038 |
| **Body composition / lean mass (optional)** | Substantial weight loss includes some lean mass; SURMOUNT-1 reduced total fat mass ~**33.9%** with an improved fat-to-lean ratio (DXA subgroup) — NEJM 2022, https://www.nejm.org/doi/full/10.1056/NEJMoa2206038 |
| **Hydration / renal symptoms (optional)** | GI fluid loss can cause volume depletion; the FDA label advises monitoring renal function when such adverse reactions occur — FDA Zepbound label, https://www.accessdata.fda.gov/drugsatfda_docs/label/2024/217806s003lbl.pdf |

WHO likewise advises clinicians managing obesity to monitor **blood glucose, lipids and blood pressure** and screen for comorbidities — WHO, *Obesity and overweight*, https://www.who.int/news-room/fact-sheets/detail/obesity-and-overweight

---

## Sources

1. WHO — *Obesity and overweight* fact sheet (8 Dec 2025): https://www.who.int/news-room/fact-sheets/detail/obesity-and-overweight
2. WHO — *Obesity: preventing and managing the global epidemic* (Technical Report Series 894; international BMI classification): https://iris.who.int/handle/10665/42330
3. WHO Expert Consultation — *Appropriate body-mass index for Asian populations…*, The Lancet 2004;363:157–163: https://www.thelancet.com/journals/lancet/article/PIIS0140-6736(03)15268-3/abstract
4. Jastreboff et al. — *Tirzepatide Once Weekly for the Treatment of Obesity* (SURMOUNT-1), NEJM 2022;387:205–216: https://www.nejm.org/doi/full/10.1056/NEJMoa2206038
5. Garvey et al. — *Tirzepatide once weekly for the treatment of obesity in people with type 2 diabetes* (SURMOUNT-2), The Lancet 2023: https://www.thelancet.com/journals/lancet/article/PIIS0140-6736(23)01200-X/abstract
6. Eli Lilly — SURMOUNT-2 results release (per-dose %, ≥5%/≥15% responders): https://investor.lilly.com/news-releases/news-release-details/lillys-tirzepatide-achieved-157-weight-loss-adults-obesity-or
7. SURMOUNT-2 summary (HbA1c 8.0%→5.9%, ~14.8 kg): https://www.patientcareonline.com/view/surmount-2-tirzepatide-treatment-leads-to-average-15-weight-loss-in-adults-with-t2d-obesity
8. FDA — ZEPBOUND (tirzepatide) Prescribing Information (2023 approval): https://www.accessdata.fda.gov/drugsatfda_docs/label/2023/217806s000lbl.pdf
9. FDA — ZEPBOUND Prescribing Information (2024; heart-rate & renal-monitoring statements): https://www.accessdata.fda.gov/drugsatfda_docs/label/2024/217806s003lbl.pdf
10. Eli Lilly — Zepbound HCP clinical data (reproduces FDA-label adverse-reaction table): https://zepbound.lilly.com/hcp/clinical-data-weight
11. ADA — *Pharmacologic Approaches to Glycemic Treatment: Standards of Care in Diabetes* (HbA1c goal < 7%): https://pmc.ncbi.nlm.nih.gov/articles/PMC12690185/
12. SURMOUNT-1 Ambulatory Blood Pressure Monitoring substudy, *Hypertension* (AHA) 2024: https://www.ahajournals.org/doi/10.1161/HYPERTENSIONAHA.123.22022

*Reminder: this reference summarizes published trial and guideline data. It is informational only, gives no dosing or treatment advice, and any app feature derived from it (especially weight-loss projections) must display ranges with an "individual results vary — not medical advice" disclaimer.*
