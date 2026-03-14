import { useTranslation } from 'react-i18next'
import {
  Battery,
  ChevronRight,
  ChevronLeft,
  Sparkles,
  Activity,
  ListChecks,
  Target,
  Info,
  CheckCircle2,
} from 'lucide-react'
import { Button } from '@wise-body/ui/components/button'
import {
  useEnergyOnboarding,
  type AbilityRating,
  type OnboardingStep,
} from './useEnergyOnboarding'

const BELL_LEVELS = [
  { value: 80, emoji: '🟢' },
  { value: 60, emoji: '🟡' },
  { value: 40, emoji: '🟠' },
  { value: 20, emoji: '🔴' },
  { value: 10, emoji: '🔴' },
] as const

const DAY_ACTIVITY_IDS = [
  'morning',
  'household',
  'work',
  'social',
  'physical',
  'errands',
] as const

const ABILITY_OPTIONS: { value: AbilityRating; shortKey: string }[] = [
  { value: 'easy',           shortKey: 'ability_easy_short' },
  { value: 'manageable',     shortKey: 'ability_manageable_short' },
  { value: 'difficult',      shortKey: 'ability_difficult_short' },
  { value: 'very_difficult', shortKey: 'ability_very_difficult_short' },
  { value: 'impossible',     shortKey: 'ability_impossible_short' },
]

const ANCHOR_POINTS = [1, 2, 3, 4, 5] as const

function getBudgetExamples(budget: number) {
  if (budget <= 8) {
    return [
      { name: 'Enkel morgenrutine', cost: -2 },
      { name: 'Hvile', cost: 1 },
      { name: 'Lett måltid', cost: -1 },
      { name: 'Kort gåtur (10 min)', cost: -2 },
      { name: 'Power nap', cost: 2 },
      { name: 'Middag (enkel)', cost: -1 },
      { name: 'Kveldshvile', cost: 1 },
    ]
  } else if (budget <= 15) {
    return [
      { name: 'Morgenrutine + frokost', cost: -3 },
      { name: 'Konsentrasjonsarbeid (kort)', cost: -3 },
      { name: 'Hvile', cost: 2 },
      { name: 'Handle mat', cost: -3 },
      { name: 'Lage middag', cost: -2 },
      { name: 'Gåtur (20 min)', cost: -2 },
      { name: 'Rolig kveld', cost: 1 },
    ]
  } else if (budget <= 25) {
    return [
      { name: 'Morgenrutine', cost: -2 },
      { name: 'Jobb (halv dag)', cost: -6 },
      { name: 'Hvile / lunsj', cost: 2 },
      { name: 'Husarbeid', cost: -3 },
      { name: 'Gåtur', cost: -3 },
      { name: 'Sosial middag', cost: -3 },
      { name: 'Avslapping', cost: 1 },
    ]
  }
  return [
    { name: 'Morgenrutine', cost: -2 },
    { name: 'Jobb (full dag)', cost: -10 },
    { name: 'Lunsjpause', cost: 2 },
    { name: 'Trening', cost: -4 },
    { name: 'Lage middag', cost: -2 },
    { name: 'Sosialt', cost: -3 },
    { name: 'Kveldshvile', cost: 1 },
  ]
}

export function EnergyOnboardingWizard() {
  const { t } = useTranslation('energy')
  const {
    step, goToStep, bellValue, setBellValue,
    dayRatings, setDayRatings, finalBudget, setFinalBudget,
    bellBudget, dayBudget, progress, isSeeding, completeOnboarding,
  } = useEnergyOnboarding()

  return (
    <div className="min-h-screen bg-background">
      {step !== 'welcome' && (
        <div className="fixed top-0 left-0 right-0 z-50 h-1 bg-muted">
          <div
            className="h-full bg-primary transition-all duration-500 ease-out"
            style={{ width: `${progress}%` }}
          />
        </div>
      )}

      <div className="max-w-lg mx-auto px-5 py-8 min-h-screen flex flex-col">
        {/* ─── Welcome ─── */}
        {step === 'welcome' && (
          <div className="flex-1 flex flex-col items-center justify-center gap-8">
            <div className="w-20 h-20 rounded-2xl bg-primary/10 flex items-center justify-center">
              <Battery size={40} className="text-primary" />
            </div>
            <div className="text-center space-y-3">
              <h1 className="text-3xl font-bold tracking-tight">
                {t('onboarding.welcome.title')}
              </h1>
              <p className="text-muted-foreground leading-relaxed max-w-sm">
                {t('onboarding.welcome.description')}
              </p>
            </div>
            <div className="w-full space-y-3 max-w-xs">
              {[
                { icon: Activity, key: 'feature_bell', subKey: 'feature_bell_sub' },
                { icon: ListChecks, key: 'feature_day', subKey: 'feature_day_sub' },
                { icon: Target, key: 'feature_anchors', subKey: 'feature_anchors_sub' },
              ].map(({ icon: Icon, key, subKey }) => (
                <div key={key} className="flex items-start gap-3 text-sm">
                  <Icon size={18} className="text-primary mt-0.5 shrink-0" />
                  <div>
                    <span className="font-medium">{t(`onboarding.welcome.${key}` as Parameters<typeof t>[0])}</span>
                    <p className="text-muted-foreground text-xs">{t(`onboarding.welcome.${subKey}` as Parameters<typeof t>[0])}</p>
                  </div>
                </div>
              ))}
            </div>
            <Button onClick={() => goToStep('bell')} size="lg" className="w-full max-w-xs">
              {t('onboarding.welcome.start_button')} <ChevronRight size={20} />
            </Button>
            <p className="text-xs text-muted-foreground text-center max-w-xs">
              {t('onboarding.welcome.duration_note')}
            </p>
          </div>
        )}

        {/* ─── Bell Scale ─── */}
        {step === 'bell' && (
          <div className="flex-1 flex flex-col">
            <StepHeader
              icon={<Activity size={20} />}
              title={t('onboarding.bell.title')}
              description={t('onboarding.bell.description')}
              onBack={() => goToStep('welcome')}
            />
            <div className="flex-1 space-y-3 mt-6">
              {BELL_LEVELS.map((level) => (
                <button
                  key={level.value}
                  onClick={() => setBellValue(level.value)}
                  className={`w-full text-left p-4 rounded-xl border transition-all ${
                    bellValue === level.value
                      ? 'border-primary bg-primary/5 ring-2 ring-primary/20'
                      : 'border-border bg-card hover:border-primary/30'
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <span className="text-xl mt-0.5">{level.emoji}</span>
                    <div className="flex-1 min-w-0">
                      <span className="font-semibold text-sm">
                        {t(`onboarding.bell.level_${level.value}_label` as Parameters<typeof t>[0])}
                      </span>
                      <p className="text-xs text-muted-foreground mt-1 leading-relaxed">
                        {t(`onboarding.bell.level_${level.value}_desc` as Parameters<typeof t>[0])}
                      </p>
                    </div>
                    {bellValue === level.value && (
                      <CheckCircle2 size={20} className="text-primary shrink-0 mt-0.5" />
                    )}
                  </div>
                </button>
              ))}
            </div>
            <p className="text-xs text-muted-foreground text-center mt-4 leading-relaxed">
              {t('onboarding.bell.note')}
            </p>
            <div className="mt-4">
              <Button
                onClick={() => goToStep('typical_day')}
                disabled={bellValue === null}
                className="w-full"
              >
                {t('actions.next', { ns: 'common' })} <ChevronRight size={18} />
              </Button>
            </div>
          </div>
        )}

        {/* ─── Typical Day ─── */}
        {step === 'typical_day' && (
          <div className="flex-1 flex flex-col">
            <StepHeader
              icon={<ListChecks size={20} />}
              title={t('onboarding.typical_day.title')}
              description={t('onboarding.typical_day.description')}
              onBack={() => goToStep('bell')}
            />
            <div className="flex-1 space-y-5 mt-6">
              {DAY_ACTIVITY_IDS.map((id) => (
                <div key={id} className="space-y-2">
                  <div>
                    <span className="font-medium text-sm">
                      {t(`onboarding.typical_day.${id}_name` as Parameters<typeof t>[0])}
                    </span>
                    <p className="text-xs text-muted-foreground">
                      {t(`onboarding.typical_day.${id}_desc` as Parameters<typeof t>[0])}
                    </p>
                    <p className="text-xs text-muted-foreground/60 italic">
                      {t(`onboarding.typical_day.${id}_baseline` as Parameters<typeof t>[0])}
                    </p>
                  </div>
                  <div className="flex gap-1.5 flex-wrap">
                    {ABILITY_OPTIONS.map((opt) => (
                      <button
                        key={opt.value}
                        onClick={() => setDayRatings((prev) => ({ ...prev, [id]: opt.value }))}
                        className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                          dayRatings[id] === opt.value
                            ? 'bg-primary text-primary-foreground'
                            : 'bg-secondary text-secondary-foreground hover:bg-accent'
                        }`}
                      >
                        {t(`onboarding.typical_day.${opt.shortKey}` as Parameters<typeof t>[0])}
                      </button>
                    ))}
                  </div>
                </div>
              ))}
            </div>
            <InfoBox>{t('onboarding.typical_day.info')}</InfoBox>
            <div className="mt-6">
              <Button onClick={() => goToStep('energy_anchors')} className="w-full">
                {t('actions.next', { ns: 'common' })} <ChevronRight size={18} />
              </Button>
            </div>
          </div>
        )}

        {/* ─── Energy Anchors ─── */}
        {step === 'energy_anchors' && (
          <div className="flex-1 flex flex-col">
            <StepHeader
              icon={<Target size={20} />}
              title={t('onboarding.energy_anchors.title')}
              description={t('onboarding.energy_anchors.description')}
              onBack={() => goToStep('typical_day')}
            />
            <div className="flex-1 space-y-3 mt-6">
              {ANCHOR_POINTS.map((points) => (
                <div key={points} className="p-4 rounded-xl border border-border bg-card">
                  <div className="flex items-center gap-3 mb-2">
                    <span
                      className="w-9 h-9 rounded-lg flex items-center justify-center font-bold text-sm text-white"
                      style={{
                        backgroundColor: `oklch(${0.45 + points * 0.05} 0.14 ${165 - points * 20})`,
                      }}
                    >
                      {points}
                    </span>
                    <span className="font-semibold text-sm">
                      {t(`onboarding.energy_anchors.anchor_${points}_label` as Parameters<typeof t>[0])}
                    </span>
                  </div>
                  <div className="ml-12 flex flex-wrap gap-1.5">
                    {([1, 2, 3, 4] as const).map((ex) => (
                      <span key={ex} className="text-xs px-2 py-1 rounded-md bg-muted text-muted-foreground">
                        {t(`onboarding.energy_anchors.anchor_${points}_ex${ex}` as Parameters<typeof t>[0])}
                      </span>
                    ))}
                  </div>
                </div>
              ))}
            </div>
            <InfoBox>{t('onboarding.energy_anchors.info')}</InfoBox>
            <div className="mt-6">
              <Button onClick={() => goToStep('budget_result')} className="w-full">
                {t('onboarding.energy_anchors.see_budget_button')} <ChevronRight size={18} />
              </Button>
            </div>
          </div>
        )}

        {/* ─── Budget Result ─── */}
        {step === 'budget_result' && (
          <div className="flex-1 flex flex-col">
            <StepHeader
              icon={<Sparkles size={20} />}
              title={t('onboarding.budget_result.title')}
              description={t('onboarding.budget_result.description')}
              onBack={() => goToStep('energy_anchors')}
            />
            <div className="flex-1 flex flex-col items-center justify-center gap-8 my-8">
              <div className="text-center space-y-2">
                <div className="flex items-center justify-center gap-6">
                  <Button
                    variant="secondary"
                    size="icon-lg"
                    onClick={() => setFinalBudget(Math.max(1, finalBudget - 1))}
                    className="rounded-full text-2xl font-bold"
                  >
                    −
                  </Button>
                  <div>
                    <span className="text-6xl font-bold tabular-nums text-primary">{finalBudget}</span>
                    <span className="block text-sm text-muted-foreground mt-1">
                      {t('onboarding.budget_result.unit')}
                    </span>
                  </div>
                  <Button
                    variant="secondary"
                    size="icon-lg"
                    onClick={() => setFinalBudget(finalBudget + 1)}
                    className="rounded-full text-2xl font-bold"
                  >
                    +
                  </Button>
                </div>
              </div>
              <div className="w-full space-y-2 max-w-sm">
                <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                  {t('onboarding.budget_result.based_on')}
                </p>
                {bellBudget !== null && (
                  <div className="flex items-center justify-between p-3 rounded-lg bg-muted/50 text-sm">
                    <span className="text-muted-foreground">{t('onboarding.budget_result.bell_label')}</span>
                    <span className="font-medium">{bellBudget} {t('onboarding.budget_result.unit')}</span>
                  </div>
                )}
                {dayBudget !== null && (
                  <div className="flex items-center justify-between p-3 rounded-lg bg-muted/50 text-sm">
                    <span className="text-muted-foreground">{t('onboarding.budget_result.day_label')}</span>
                    <span className="font-medium">{dayBudget} {t('onboarding.budget_result.unit')}</span>
                  </div>
                )}
              </div>
              <div className="bg-card border rounded-xl p-4 max-w-sm">
                <p className="text-xs text-muted-foreground leading-relaxed">
                  {t('onboarding.budget_result.advice')}
                </p>
              </div>
              <div className="w-full max-w-sm space-y-2">
                <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                  {t('onboarding.budget_result.example_header', { budget: finalBudget })}
                </p>
                <BudgetExamples budget={finalBudget} />
              </div>
            </div>
            <Button onClick={() => goToStep('confirm')} size="lg" className="w-full">
              {t('onboarding.budget_result.use_budget_button')} <ChevronRight size={18} />
            </Button>
          </div>
        )}

        {/* ─── Confirm ─── */}
        {step === 'confirm' && (
          <div className="flex-1 flex flex-col items-center justify-center gap-6">
            <div className="w-16 h-16 rounded-full bg-energy-full/10 flex items-center justify-center">
              <CheckCircle2 size={32} className="text-energy-full" />
            </div>
            <div className="text-center space-y-2 max-w-sm">
              <h2 className="text-2xl font-bold">{t('onboarding.confirm.title')}</h2>
              <p
                className="text-muted-foreground text-sm leading-relaxed"
                dangerouslySetInnerHTML={{
                  __html: t('onboarding.confirm.description', { budget: finalBudget }),
                }}
              />
            </div>
            <div className="w-full max-w-sm space-y-3">
              {([1, 2, 3] as const).map((n) => (
                <TipCard
                  key={n}
                  title={t(`onboarding.confirm.tip${n}_title` as Parameters<typeof t>[0])}
                  text={t(`onboarding.confirm.tip${n}_text` as Parameters<typeof t>[0])}
                />
              ))}
            </div>
            <Button
              onClick={completeOnboarding}
              disabled={isSeeding}
              size="lg"
              className="w-full max-w-sm"
            >
              {isSeeding ? '…' : t('onboarding.confirm.start_button')}
            </Button>
          </div>
        )}
      </div>
    </div>
  )
}

// ─── Sub-components ───────────────────────────────────────────────────────────

function StepHeader({
  icon, title, description, onBack,
}: {
  icon: React.ReactNode
  title: string
  description: string
  onBack: () => void
}) {
  const { t } = useTranslation('common')
  return (
    <div>
      <button
        onClick={onBack}
        className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground transition-colors mb-4"
      >
        <ChevronLeft size={16} /> {t('actions.back')}
      </button>
      <div className="flex items-start gap-3">
        <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center shrink-0 text-primary">
          {icon}
        </div>
        <div>
          <h2 className="text-lg font-bold">{title}</h2>
          <p className="text-sm text-muted-foreground leading-relaxed mt-1">{description}</p>
        </div>
      </div>
    </div>
  )
}

function InfoBox({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex items-start gap-2 p-3 rounded-lg bg-primary/5 border border-primary/10 mt-4">
      <Info size={14} className="text-primary mt-0.5 shrink-0" />
      <p className="text-xs text-muted-foreground leading-relaxed">{children}</p>
    </div>
  )
}

function TipCard({ title, text }: { title: string; text: string }) {
  return (
    <div className="p-4 rounded-xl border border-border bg-card">
      <p className="font-medium text-sm">{title}</p>
      <p className="text-xs text-muted-foreground mt-1 leading-relaxed">{text}</p>
    </div>
  )
}

function BudgetExamples({ budget }: { budget: number }) {
  const examples = getBudgetExamples(budget)
  let running = budget
  return (
    <div className="space-y-1">
      {examples.map((ex, i) => {
        const isGain = ex.cost > 0
        running += ex.cost
        return (
          <div key={i} className="flex items-center gap-2 text-xs py-1.5 px-2 rounded-md bg-muted/30">
            <span className="flex-1 truncate text-muted-foreground">{ex.name}</span>
            <span className={`font-medium tabular-nums ${isGain ? 'text-energy-full' : 'text-energy-low'}`}>
              {isGain ? '+' : '−'}{Math.abs(ex.cost)}
            </span>
            <span className="text-muted-foreground/60 tabular-nums w-8 text-right">{running}</span>
          </div>
        )
      })}
    </div>
  )
}
