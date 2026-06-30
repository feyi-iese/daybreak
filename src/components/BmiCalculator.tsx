import { useCallback, useEffect, useMemo, useState, type CSSProperties } from 'react';
import type { Profile } from '../db/db';
import { BMI_THRESHOLDS, classifyBmi, computeBmi, weightForBmi } from '../lib/bmi';
import { formatHeight, formatWeight, kgToLb, lbToKg } from '../lib/units';
import { getBmiChipClassName } from '../lib/bmiStyles';

interface BmiCalculatorProps {
  profile: Profile;
  currentWeightKg: number;
}

export default function BmiCalculator({ profile, currentWeightKg }: BmiCalculatorProps) {
  const unit = profile.weightUnit ?? 'kg';
  const heightUnit = profile.heightUnit ?? 'cm';

  const [simulatedWeightKg, setSimulatedWeightKg] = useState(currentWeightKg);

  useEffect(() => {
    setSimulatedWeightKg(currentWeightKg);
  }, [currentWeightKg, profile.heightCm]);

  const { normalMinKg, normalMaxKg, obeseMinKg, sliderMinKg, sliderMaxKg } = useMemo(() => {
    const normalMinKg = weightForBmi(BMI_THRESHOLDS.normal, profile.heightCm);
    const normalMaxKg = weightForBmi(BMI_THRESHOLDS.overweight, profile.heightCm);
    const obeseMinKg = weightForBmi(BMI_THRESHOLDS.obese, profile.heightCm);
    const anchors = [
      profile.startingWeightKg,
      currentWeightKg,
      profile.targetWeightKg,
      normalMinKg,
      normalMaxKg,
      obeseMinKg,
    ];
    return {
      normalMinKg,
      normalMaxKg,
      obeseMinKg,
      sliderMinKg: Math.max(30, Math.floor((Math.min(...anchors) - 10) * 2) / 2),
      sliderMaxKg: Math.min(300, Math.ceil((Math.max(...anchors) + 10) * 2) / 2),
    };
  }, [currentWeightKg, profile.heightCm, profile.startingWeightKg, profile.targetWeightKg]);

  const underweightMax = formatWeight(normalMinKg, unit);
  const normalMax = formatWeight(normalMaxKg, unit);
  const overweightMax = formatWeight(obeseMinKg, unit);

  const clampWeightKg = (weightKg: number) => Math.min(sliderMaxKg, Math.max(sliderMinKg, weightKg));

  const sliderSpanKg = sliderMaxKg - sliderMinKg;
  const sliderProgressPercent = sliderSpanKg > 0
    ? Math.min(100, Math.max(0, ((simulatedWeightKg - sliderMinKg) / sliderSpanKg) * 100))
    : 0;

  const simulatedBmi = computeBmi(simulatedWeightKg, profile.heightCm);
  const simulatedCategory = classifyBmi(simulatedBmi);
  const cardClasses = {
    Underweight: simulatedCategory === 'Underweight'
      ? 'border-tone-sky-edge bg-tone-sky-soft/40 shadow-sm ring-1 ring-tone-sky-edge'
      : 'border-cream-200 bg-cream-50/30 dark:bg-cream-100/60',
    Normal: simulatedCategory === 'Normal'
      ? 'border-tone-mint-edge bg-tone-mint-soft/40 shadow-sm ring-1 ring-tone-mint-edge'
      : 'border-cream-200 bg-cream-50/30 dark:bg-cream-100/60',
    Overweight: simulatedCategory === 'Overweight'
      ? 'border-tone-sun-edge bg-tone-sun-soft/40 shadow-sm ring-1 ring-tone-sun-edge'
      : 'border-cream-200 bg-cream-50/30 dark:bg-cream-100/60',
    Obese: simulatedCategory === 'Obese'
      ? 'border-tone-rose-edge bg-tone-rose-soft/40 shadow-sm ring-1 ring-tone-rose-edge'
      : 'border-cream-200 bg-cream-50/30 dark:bg-cream-100/60',
  };
  const currentBmi = computeBmi(currentWeightKg, profile.heightCm);

  // Sync direct simulated weight input string
  const formatInputWeight = useCallback((weightKg: number) => {
    return unit === 'kg' ? weightKg.toFixed(1) : kgToLb(weightKg).toFixed(1);
  }, [unit]);

  const [inputValue, setInputValue] = useState(() => formatInputWeight(simulatedWeightKg));
  const [isFocused, setIsFocused] = useState(false);

  useEffect(() => {
    if (isFocused) return;
    setInputValue(formatInputWeight(simulatedWeightKg));
  }, [simulatedWeightKg, isFocused, formatInputWeight]);

  const handleInputChange = (val: string) => {
    setInputValue(val);
    const parsed = parseFloat(val);
    if (!isNaN(parsed) && isFinite(parsed)) {
      if (unit === 'kg') {
        setSimulatedWeightKg(clampWeightKg(parsed));
      } else {
        setSimulatedWeightKg(clampWeightKg(lbToKg(parsed)));
      }
    }
  };

  const handleInputBlur = () => {
    setIsFocused(false);
    setInputValue(formatInputWeight(simulatedWeightKg));
  };
  // Range scale math
  const BMI_SCALE_MIN = 15;
  const BMI_SCALE_MAX = 40;
  const markerPercent = Math.min(
    100,
    Math.max(0, ((simulatedBmi - BMI_SCALE_MIN) / (BMI_SCALE_MAX - BMI_SCALE_MIN)) * 100)
  );

  // Category explanation text
  const getExplanation = () => {
    switch (simulatedCategory) {
      case 'Underweight':
        return 'This sits below the general adult BMI range. Consider checking in with a clinician before aiming lower.';
      case 'Normal':
        return 'This sits in the general adult BMI range often associated with lower weight-related risk.';
      case 'Overweight':
        return 'This sits above the general adult BMI range. Small, steady changes can still meaningfully reduce risk.';
      case 'Obese':
        return 'This sits in the BMI range linked with higher metabolic and cardiovascular risk. Steady progress matters.';
    }
  };

  const resultCardClass = `stat transition-all duration-300 ease-out hover:-translate-y-0.5 ${
    simulatedCategory === 'Normal'
      ? 'shadow-glow-primary ring-2 ring-primary-200'
      : 'shadow-card'
  }`;

  return (
    <section className="card animate-fade-rise">
      <div className="text-left">
        <p className="hero-eyebrow">Interactive Simulator</p>
        {/* <h2 className="hero-title mt-2">Explore your BMI horizon</h2> */}
        <p className="hero-sub max-w-[48ch]">
          Adjust your weight to see how BMI categories shift at your saved height.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-8 md:grid-cols-12 mt-8">
        {/* Left Column: Controls & Category Bands */}
        <div className="order-1 md:col-span-7 space-y-6">
          {/* Height card */}
          {/* <div className="card-quiet flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.1em] text-ink-muted">Fixed height</p>
              <p className="font-display text-xl font-bold text-ink mt-1">
                {formatHeight(profile.heightCm, heightUnit)}
              </p>
            </div>
            <p className="footnote max-w-[24ch] text-right text-ink-soft">
              BMI changes here only when simulated weight changes.
            </p>
          </div> */}

          {/* Slider Control */}
          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <span id="bmi-simulated-weight-label" className="field-label">
                Simulated weight
              </span>
              <label className="inline-flex items-center gap-1 rounded-full border border-primary-200 bg-primary-50 px-3 py-1 text-primary-700 shadow-sm transition focus-within:ring-4 focus-within:ring-primary-300/40">
                <input
                  type="number"
                  inputMode="decimal"
                  step="0.1"
                  value={inputValue}
                  onChange={(e) => handleInputChange(e.target.value)}
                  onFocus={(e) => {
                    setIsFocused(true);
                    e.currentTarget.select();
                  }}
                  onBlur={handleInputBlur}
                  aria-labelledby="bmi-simulated-weight-label"
                  className="no-spinner w-[5.5ch] bg-transparent text-right font-mono text-sm font-semibold tabular-nums text-primary-700 outline-none"
                />
                <span className="font-mono text-sm font-semibold text-primary-700">{unit}</span>
              </label>
            </div>
            <input
              id="bmi-weight-slider"
              type="range"
              min={sliderMinKg}
              max={sliderMaxKg}
              step={0.5}
              value={simulatedWeightKg}
              onChange={(e) => setSimulatedWeightKg(clampWeightKg(parseFloat(e.target.value)))}
              aria-label="Simulated weight slider"
              aria-valuetext={`${formatWeight(simulatedWeightKg, unit)}, BMI ${simulatedBmi.toFixed(1)}, ${simulatedCategory}`}
              className="range-touch mt-3"
              style={{ '--range-progress': `${sliderProgressPercent}%` } as CSSProperties}
            />
          </div>

          {/* Quick presets — mirrors the slider row's label-left / control-right rhythm */}
          <div className="flex flex-wrap items-center justify-between gap-3">
            <span className="field-label">Preset weights</span>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => setSimulatedWeightKg(clampWeightKg(profile.startingWeightKg))}
                className="btn btn-ghost px-3 py-2 text-xs"
              >
                Start
              </button>
              <button
                type="button"
                onClick={() => setSimulatedWeightKg(clampWeightKg(currentWeightKg))}
                className="btn btn-ghost px-3 py-2 text-xs"
              >
                Current
              </button>
              <button
                type="button"
                onClick={() => setSimulatedWeightKg(clampWeightKg(profile.targetWeightKg))}
                className="btn btn-ghost px-3 py-2 text-xs"
              >
                Goal
              </button>
            </div>
          </div>
          <div className="flex flex-wrap items-center justify-between gap-3">
                  <span className="field-label">Your height</span>
            <p className="font-display text-xl font-bold text-ink mt-1">
                {formatHeight(profile.heightCm, heightUnit)}
              </p>
        </div>
        </div>
        
        <div className="order-2 md:order-3 md:col-span-12">
          {/* Range Band */}
          <div className="relative pt-8 pb-2">
            {/* Live marker on top of the track */}
            <div
              className="absolute top-0 -translate-x-1/2 flex flex-col items-center transition-all duration-150 ease-out"
              style={{ left: `${markerPercent}%` }}
            >
              <span className="font-mono text-xs font-bold text-primary-700 bg-primary-50 px-1 rounded border border-primary-200 shadow-sm">
                {simulatedBmi.toFixed(1)}
              </span>
              <div className="w-1.5 h-1.5 bg-primary-600 rotate-45 mt-0.5" />
            </div>

            {/* Track with segments */}
            <div className="h-3 w-full rounded-full overflow-hidden flex bg-cream-100 border border-cream-200 dark:bg-cream-100 dark:border-cream-300">
              <div style={{ width: '14%' }} className="h-full bg-tone-sky-soft" />
              <div style={{ width: '26%' }} className="h-full bg-tone-mint-soft" />
              <div style={{ width: '20%' }} className="h-full bg-tone-sun-soft" />
              <div style={{ width: '40%' }} className="h-full bg-tone-rose-soft" />
            </div>

            {/* Category Range stacked rows (Solves overlap issues on all screens) */}
            <div role="list" aria-label="BMI category ranges" className="mt-6 grid grid-cols-2 gap-2.5 sm:grid-cols-1">
              {/* Underweight Row */}
              <div role="listitem" className={`grid grid-cols-[1fr_auto] items-center gap-x-2 gap-y-1 rounded-xl border px-3 py-3 transition-all duration-300 sm:grid-cols-[minmax(8.5rem,1fr)_6.75rem_9.5rem] sm:gap-x-4 sm:px-4 ${cardClasses.Underweight}`}>
                <div className="flex items-center gap-2.5">
                  <span className="hidden sm:inline-block w-2 h-2 rounded-full bg-tone-sky-edge border border-tone-sky-ink/30 shrink-0" />
                  <span className="text-[10px] font-bold uppercase tracking-wider text-tone-sky-ink whitespace-nowrap">Underweight</span>
                </div>
                <span className="font-mono text-xs font-semibold text-ink-soft text-right tabular-nums whitespace-nowrap tracking-tighter sm:tracking-normal">&lt; 18.5</span>
                <span className="col-span-2 font-mono text-xs text-ink-muted text-right tabular-nums whitespace-nowrap tracking-tighter sm:tracking-normal sm:col-span-1">&lt; {underweightMax}</span>
              </div>

              {/* Normal Row */}
              <div role="listitem" className={`grid grid-cols-[1fr_auto] items-center gap-x-2 gap-y-1 rounded-xl border px-3 py-3 transition-all duration-300 sm:grid-cols-[minmax(8.5rem,1fr)_6.75rem_9.5rem] sm:gap-x-4 sm:px-4 ${cardClasses.Normal}`}>
                <div className="flex items-center gap-2.5">
                  <span className="hidden sm:inline-block w-2 h-2 rounded-full bg-tone-mint-edge border border-tone-mint-ink/30 shrink-0" />
                  <span className="text-[10px] font-bold uppercase tracking-wider text-tone-mint-ink whitespace-nowrap">Normal</span>
                </div>
                <span className="font-mono text-xs font-semibold text-ink-soft text-right tabular-nums whitespace-nowrap tracking-tighter sm:tracking-normal">18.5 - 25</span>
                <span className="col-span-2 font-mono text-xs text-ink-muted text-right tabular-nums whitespace-nowrap tracking-tighter sm:tracking-normal sm:col-span-1">{underweightMax} - {normalMax}</span>
              </div>

              {/* Overweight Row */}
              <div role="listitem" className={`grid grid-cols-[1fr_auto] items-center gap-x-2 gap-y-1 rounded-xl border px-3 py-3 transition-all duration-300 sm:grid-cols-[minmax(8.5rem,1fr)_6.75rem_9.5rem] sm:gap-x-4 sm:px-4 ${cardClasses.Overweight}`}>
                <div className="flex items-center gap-2.5">
                  <span className="hidden sm:inline-block w-2 h-2 rounded-full bg-tone-sun-edge border border-tone-sun-ink/30 shrink-0" />
                  <span className="text-[10px] font-bold uppercase tracking-wider text-tone-sun-ink whitespace-nowrap">Overweight</span>
                </div>
                <span className="font-mono text-xs font-semibold text-ink-soft text-right tabular-nums whitespace-nowrap tracking-tighter sm:tracking-normal">25 - 30</span>
                <span className="col-span-2 font-mono text-xs text-ink-muted text-right tabular-nums whitespace-nowrap tracking-tighter sm:tracking-normal sm:col-span-1">{normalMax} - {overweightMax}</span>
              </div>

              {/* Obese Row */}
              <div role="listitem" className={`grid grid-cols-[1fr_auto] items-center gap-x-2 gap-y-1 rounded-xl border px-3 py-3 transition-all duration-300 sm:grid-cols-[minmax(8.5rem,1fr)_6.75rem_9.5rem] sm:gap-x-4 sm:px-4 ${cardClasses.Obese}`}>
                <div className="flex items-center gap-2.5">
                  <span className="hidden sm:inline-block w-2 h-2 rounded-full bg-tone-rose-edge border border-tone-rose-ink/30 shrink-0" />
                  <span className="text-[10px] font-bold uppercase tracking-wider text-tone-rose-ink whitespace-nowrap">Obese</span>
                </div>
                <span className="font-mono text-xs font-semibold text-ink-soft text-right tabular-nums whitespace-nowrap tracking-tighter sm:tracking-normal">≥ 30</span>
                <span className="col-span-2 font-mono text-xs text-ink-muted text-right tabular-nums whitespace-nowrap tracking-tighter sm:tracking-normal sm:col-span-1">≥ {overweightMax}</span>
              </div>
            </div>
          </div>

          {/* Healthy range summary */}
          <p className="footnote text-ink-soft">
            At your height, the normal BMI range is roughly {formatWeight(normalMinKg, unit)} - {formatWeight(normalMaxKg, unit)}.
          </p>
        </div>

        {/* Right Column: Live Result Card */}
        <div className="order-3 md:order-2 md:col-span-5">
          <div
            role="group"
            aria-label="BMI simulation result"
            aria-live="polite"
            className={`md:sticky md:top-6 ${resultCardClass}`}
          >
            <p className="stat-label">Simulated BMI</p>
            <p className="stat-value mt-2 font-display text-5xl font-extrabold tracking-tight text-ink sm:text-6xl">
              <span className="font-mono tabular-nums">{simulatedBmi.toFixed(1)}</span>
            </p>
            <div className="mt-4">
              <span className={getBmiChipClassName(simulatedCategory, 'px-2.5 py-1 text-xs font-semibold')}>
                {simulatedCategory}
              </span>
            </div>
            <p className="footnote mt-4 border-t border-cream-200/60 pt-3">
              Current BMI: {currentBmi.toFixed(1)} at {formatWeight(currentWeightKg, unit)}
            </p>
            <p className="text-xs leading-relaxed text-ink-soft mt-3 bg-cream-50/50 dark:bg-cream-100/80 p-3 rounded-xl border border-cream-100 dark:border-cream-300/60">
              {getExplanation()}
            </p>
          </div>
        </div>
      </div>

      {/* Disclaimer / Caveat */}
      <p className="caveat mt-8">
        BMI is a general screening measure, not a diagnosis. It does not account for muscle mass, bone density, pregnancy, age, or individual body composition. This is not medical advice.
      </p>
    </section>
  );
}
