import { useState } from 'react';
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
} from 'lucide-react';

interface OnboardingWizardProps {
  onComplete: (budget: number) => void;
}

// ─── Step types ───

type Step =
  | 'welcome'
  | 'bell'
  | 'typical_day'
  | 'energy_anchors'
  | 'budget_result'
  | 'confirm';

// ─── Bell Scale data ───
// Based on Dr. David Bell's CFIDS Disability Scale (Bell, 1995)
// Simplified to 5 levels for usability, mapped from the 0-100 original

interface BellLevel {
  value: number;
  label: string;
  description: string;
  budgetRange: [number, number];
  emoji: string;
}

const BELL_LEVELS: BellLevel[] = [
  {
    value: 80,
    label: 'Lett påvirket',
    description:
      'Milde symptomer ved anstrengelse. Kan jobbe fulltid, men merker at det koster mer enn før. Normal hverdag med noen begrensninger ved krevende aktiviteter.',
    budgetRange: [25, 35],
    emoji: '🟢',
  },
  {
    value: 60,
    label: 'Moderat påvirket',
    description:
      'Milde til moderate symptomer i hvile. Tydelige daglige begrensninger. Kan jobbe fulltid med lett arbeid hvis timeplanen er fleksibel, eller deltid med tyngre arbeid.',
    budgetRange: [18, 25],
    emoji: '🟡',
  },
  {
    value: 40,
    label: 'Betydelig påvirket',
    description:
      'Moderate symptomer i hvile, verre ved aktivitet. Klarer 3–4 timer lett aktivitet per dag med pauser. Ikke bundet til hjemmet, men trenger mye hvile.',
    budgetRange: [12, 18],
    emoji: '🟠',
  },
  {
    value: 20,
    label: 'Alvorlig påvirket',
    description:
      'Moderate til alvorlige symptomer i hvile. Bundet til hjemmet mesteparten av tiden. Klarer 1–2 timer lett aktivitet per dag. Vansker med konsentrasjon.',
    budgetRange: [6, 12],
    emoji: '🔴',
  },
  {
    value: 10,
    label: 'Svært alvorlig påvirket',
    description:
      'Alvorlige symptomer i hvile. Sengeliggende mesteparten av dagen. Svært begrenset kapasitet til aktivitet og konsentrasjon.',
    budgetRange: [3, 6],
    emoji: '🔴',
  },
];

// ─── Typical day activities for calibration ───
// Inspired by the DSQ energy items and spoon theory calibration worksheets

interface DayActivity {
  id: string;
  name: string;
  description: string;
  icon: string;
  /** How many activities like this a healthy person does easily */
  healthyBaseline: string;
}

const DAY_ACTIVITIES: DayActivity[] = [
  {
    id: 'morning_routine',
    name: 'Morgenrutine',
    description: 'Stå opp, dusje, kle på seg, frokost',
    icon: '🌅',
    healthyBaseline: '~1 time, gjøres uten å tenke over det',
  },
  {
    id: 'household',
    name: 'Husarbeid',
    description: 'Støvsuge, vaske, rydde, lage mat',
    icon: '🏠',
    healthyBaseline: 'Flere oppgaver etter hverandre',
  },
  {
    id: 'focused_work',
    name: 'Konsentrasjonsarbeid',
    description: 'Jobb, studier, administrasjon, eller krevende samtaler',
    icon: '💼',
    healthyBaseline: '6–8 timer med pauser',
  },
  {
    id: 'social',
    name: 'Sosialt',
    description: 'Besøk, telefon, sosiale aktiviteter',
    icon: '👥',
    healthyBaseline: 'Flere timer uten behov for hvile',
  },
  {
    id: 'physical',
    name: 'Fysisk aktivitet',
    description: 'Gåtur, trening, hagearbeid',
    icon: '🚶',
    healthyBaseline: '30-60 min moderat aktivitet',
  },
  {
    id: 'errands',
    name: 'Ærender',
    description: 'Handle, kjøre, post, lege',
    icon: '🛒',
    healthyBaseline: 'Flere stopp på rad',
  },
];

type AbilityRating =
  | 'easy'
  | 'manageable'
  | 'difficult'
  | 'very_difficult'
  | 'impossible';

interface AbilityOption {
  value: AbilityRating;
  label: string;
  short: string;
  weight: number;
}

const ABILITY_OPTIONS: AbilityOption[] = [
  { value: 'easy', label: 'Går fint, koster lite', short: 'Lett', weight: 1.0 },
  {
    value: 'manageable',
    label: 'Klarer det, men merker det etterpå',
    short: 'OK',
    weight: 0.7,
  },
  {
    value: 'difficult',
    label: 'Krevende, trenger lang hvile etterpå',
    short: 'Tungt',
    weight: 0.4,
  },
  {
    value: 'very_difficult',
    label: 'Svært krevende, risikerer krasj/PEM',
    short: 'V. tungt',
    weight: 0.2,
  },
  {
    value: 'impossible',
    label: 'Klarer ikke dette for tiden',
    short: 'Nei',
    weight: 0.0,
  },
];

// ─── Energy anchor descriptions ───
// Based on energy envelope research: what does each "point" represent?

interface EnergyAnchor {
  points: number;
  label: string;
  examples: string[];
}

const ENERGY_ANCHORS: EnergyAnchor[] = [
  {
    points: 1,
    label: 'Minimal anstrengelse',
    examples: [
      'Sitte stille og lytte til musikk',
      'Pusse tenner',
      'Kort telefonsamtale (5 min)',
      'Ligge og lese noen sider',
    ],
  },
  {
    points: 2,
    label: 'Lett aktivitet',
    examples: [
      'Dusje',
      'Lage enkel frokost',
      'Kort rolig gåtur (10–15 min)',
      'Lese eller se TV (30 min)',
    ],
  },
  {
    points: 3,
    label: 'Moderat aktivitet',
    examples: [
      'Lage et fullstendig måltid',
      'Støvsuge ett rom',
      'Møte/samtale (30 min)',
      '30 min konsentrasjonsarbeid',
    ],
  },
  {
    points: 4,
    label: 'Krevende aktivitet',
    examples: [
      'Handle mat (stor handel)',
      'Sosialt besøk (1–2 timer)',
      'Lengre gåtur (30+ min)',
      'Flere timer konsentrasjonsarbeid',
    ],
  },
  {
    points: 5,
    label: 'Svært krevende',
    examples: [
      'Full dag med jobb/aktivitet',
      'Intens trening',
      'Sosialt arrangement (flere timer)',
      'Reise / lang biltur',
    ],
  },
];

// ─── Calculation logic ───

function calculateBudgetFromBell(bellValue: number): number {
  const level = BELL_LEVELS.find((l) => l.value === bellValue);
  if (!level) return 20;
  return Math.round((level.budgetRange[0] + level.budgetRange[1]) / 2);
}

function calculateBudgetFromTypicalDay(
  ratings: Record<string, AbilityRating>
): number {
  const entries = Object.values(ratings);
  if (entries.length === 0) return 20;

  const avgWeight =
    entries.reduce((sum, rating) => {
      const opt = ABILITY_OPTIONS.find((o) => o.value === rating);
      return sum + (opt?.weight ?? 0.5);
    }, 0) / entries.length;

  // Map avg weight (0-1) to budget range (3-35)
  return Math.round(3 + avgWeight * 32);
}

function combinedBudget(
  bellBudget: number | null,
  dayBudget: number | null
): number {
  if (bellBudget !== null && dayBudget !== null) {
    // Weighted average: bell scale is more validated, so weight it slightly more
    return Math.round(bellBudget * 0.55 + dayBudget * 0.45);
  }
  return bellBudget ?? dayBudget ?? 20;
}

// ─── Component ───

export function OnboardingWizard({ onComplete }: OnboardingWizardProps) {
  const [step, setStep] = useState<Step>('welcome');
  const [bellValue, setBellValue] = useState<number | null>(null);
  const [dayRatings, setDayRatings] = useState<Record<string, AbilityRating>>(
    {}
  );
  const [finalBudget, setFinalBudget] = useState(20);

  const bellBudget =
    bellValue !== null ? calculateBudgetFromBell(bellValue) : null;
  const dayBudget =
    Object.keys(dayRatings).length > 0
      ? calculateBudgetFromTypicalDay(dayRatings)
      : null;

  const goToStep = (next: Step) => {
    if (next === 'budget_result') {
      setFinalBudget(combinedBudget(bellBudget, dayBudget));
    }
    setStep(next);
  };

  const stepOrder: Step[] = [
    'welcome',
    'bell',
    'typical_day',
    'energy_anchors',
    'budget_result',
    'confirm',
  ];
  const currentIndex = stepOrder.indexOf(step);
  const progress = (currentIndex / (stepOrder.length - 1)) * 100;

  return (
    <div className="min-h-screen bg-background">
      {/* Progress bar */}
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
                Energiregnskap
              </h1>
              <p className="text-muted-foreground leading-relaxed max-w-sm">
                Vi hjelper deg med å finne ditt personlige energibudsjett.
                Gjennom noen korte spørsmål kartlegger vi ditt nåværende
                funksjonsnivå og lager et skreddersydd utgangspunkt.
              </p>
            </div>

            <div className="w-full space-y-3 max-w-xs">
              <div className="flex items-start gap-3 text-sm">
                <Activity size={18} className="text-primary mt-0.5 shrink-0" />
                <div>
                  <span className="font-medium">Funksjonsvurdering</span>
                  <p className="text-muted-foreground text-xs">
                    Basert på Bell Disability Scale (Bell, 1995)
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-3 text-sm">
                <ListChecks
                  size={18}
                  className="text-primary mt-0.5 shrink-0"
                />
                <div>
                  <span className="font-medium">Typisk dag-kartlegging</span>
                  <p className="text-muted-foreground text-xs">
                    Basert på DePaul Energy Envelope (Jason et al.)
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-3 text-sm">
                <Target size={18} className="text-primary mt-0.5 shrink-0" />
                <div>
                  <span className="font-medium">Kalibrerte energiankre</span>
                  <p className="text-muted-foreground text-xs">
                    Konkrete eksempler på hva hvert poeng betyr
                  </p>
                </div>
              </div>
            </div>

            <button
              onClick={() => goToStep('bell')}
              className="w-full max-w-xs py-4 rounded-xl bg-primary text-primary-foreground font-semibold text-lg hover:opacity-90 transition-opacity flex items-center justify-center gap-2"
            >
              Kom i gang <ChevronRight size={20} />
            </button>

            <p className="text-xs text-muted-foreground text-center max-w-xs">
              Tar ca. 3–5 minutter. Du kan justere budsjettet når som helst
              etterpå.
            </p>
          </div>
        )}

        {/* ─── Bell Scale Step ─── */}
        {step === 'bell' && (
          <div className="flex-1 flex flex-col">
            <StepHeader
              icon={<Activity size={20} />}
              title="Ditt funksjonsnivå"
              description="Velg beskrivelsen som best passer din nåværende situasjon i en typisk uke. Basert på Dr. David Bells funksjonsskala, et validert verktøy brukt i ME/CFS-forskning siden 1995."
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
                        {level.label}
                      </span>
                      <p className="text-xs text-muted-foreground mt-1 leading-relaxed">
                        {level.description}
                      </p>
                    </div>
                    {bellValue === level.value && (
                      <CheckCircle2
                        size={20}
                        className="text-primary shrink-0 mt-0.5"
                      />
                    )}
                  </div>
                </button>
              ))}
            </div>

            <div className="mt-6">
              <button
                onClick={() => goToStep('typical_day')}
                disabled={bellValue === null}
                className="w-full py-4 rounded-xl bg-primary text-primary-foreground font-medium hover:opacity-90 transition-opacity disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                Neste <ChevronRight size={18} />
              </button>
            </div>
          </div>
        )}

        {/* ─── Typical Day Step ─── */}
        {step === 'typical_day' && (
          <div className="flex-1 flex flex-col">
            <StepHeader
              icon={<ListChecks size={20} />}
              title="Hvordan klarer du vanlige aktiviteter?"
              description="Tenk på en typisk dag den siste uken. Hvor mye koster disse aktivitetene deg? Denne kartleggingen er inspirert av DePaul-gruppens energikonvolutt-forskning, der du vurderer opplevd tilgjengelig vs. brukt energi."
              onBack={() => goToStep('bell')}
            />

            <div className="flex-1 space-y-5 mt-6">
              {DAY_ACTIVITIES.map((activity) => (
                <div key={activity.id} className="space-y-2">
                  <div className="flex items-center gap-2">
                    <span className="text-lg">{activity.icon}</span>
                    <div>
                      <span className="font-medium text-sm">
                        {activity.name}
                      </span>
                      <p className="text-xs text-muted-foreground">
                        {activity.description}
                      </p>
                    </div>
                  </div>
                  <div className="flex gap-1.5 flex-wrap">
                    {ABILITY_OPTIONS.map((opt) => (
                      <button
                        key={opt.value}
                        onClick={() =>
                          setDayRatings((prev) => ({
                            ...prev,
                            [activity.id]: opt.value,
                          }))
                        }
                        className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                          dayRatings[activity.id] === opt.value
                            ? 'bg-primary text-primary-foreground'
                            : 'bg-secondary text-secondary-foreground hover:bg-accent'
                        }`}
                      >
                        {opt.short}
                      </button>
                    ))}
                  </div>
                </div>
              ))}
            </div>

            <InfoBox>
              Du trenger ikke svare på alle — svar på de som er relevante for
              deg. Det viktigste er å gi et ærlig bilde av hvordan du opplever
              det, ikke hvordan du «burde» klare det.
            </InfoBox>

            <div className="mt-6">
              <button
                onClick={() => goToStep('energy_anchors')}
                className="w-full py-4 rounded-xl bg-primary text-primary-foreground font-medium hover:opacity-90 transition-opacity flex items-center justify-center gap-2"
              >
                Neste <ChevronRight size={18} />
              </button>
            </div>
          </div>
        )}

        {/* ─── Energy Anchors Step ─── */}
        {step === 'energy_anchors' && (
          <div className="flex-1 flex flex-col">
            <StepHeader
              icon={<Target size={20} />}
              title="Hva betyr poengene?"
              description="For at energibudsjettet skal være nyttig, trenger du konkrete referansepunkter. Her er forslag til hva hvert poengnivå representerer. Du kan tilpasse disse til din egen opplevelse."
              onBack={() => goToStep('typical_day')}
            />

            <div className="flex-1 space-y-3 mt-6">
              {ENERGY_ANCHORS.map((anchor) => (
                <div
                  key={anchor.points}
                  className="p-4 rounded-xl border border-border bg-card"
                >
                  <div className="flex items-center gap-3 mb-2">
                    <span
                      className="w-9 h-9 rounded-lg flex items-center justify-center font-bold text-sm text-primary-foreground"
                      style={{
                        backgroundColor: `oklch(${0.45 + anchor.points * 0.05} 0.14 ${165 - anchor.points * 20})`,
                      }}
                    >
                      {anchor.points}
                    </span>
                    <span className="font-semibold text-sm">
                      {anchor.label}
                    </span>
                  </div>
                  <div className="ml-12 flex flex-wrap gap-1.5">
                    {anchor.examples.map((ex, i) => (
                      <span
                        key={i}
                        className="text-xs px-2 py-1 rounded-md bg-muted text-muted-foreground"
                      >
                        {ex}
                      </span>
                    ))}
                  </div>
                </div>
              ))}
            </div>

            <InfoBox>
              Disse eksemplene er utgangspunkt. Energikostnaden for en aktivitet
              varierer fra person til person. Over tid vil du kalibrere dine
              egne verdier basert på erfaring.
            </InfoBox>

            <div className="mt-6">
              <button
                onClick={() => goToStep('budget_result')}
                className="w-full py-4 rounded-xl bg-primary text-primary-foreground font-medium hover:opacity-90 transition-opacity flex items-center justify-center gap-2"
              >
                Se mitt foreslåtte budsjett <ChevronRight size={18} />
              </button>
            </div>
          </div>
        )}

        {/* ─── Budget Result Step ─── */}
        {step === 'budget_result' && (
          <div className="flex-1 flex flex-col">
            <StepHeader
              icon={<Sparkles size={20} />}
              title="Ditt energibudsjett"
              description="Basert på dine svar har vi beregnet et forslag til daglig energibudsjett. Du kan justere det opp eller ned."
              onBack={() => goToStep('energy_anchors')}
            />

            <div className="flex-1 flex flex-col items-center justify-center gap-8 my-8">
              {/* Budget display with adjustor */}
              <div className="text-center space-y-2">
                <div className="flex items-center justify-center gap-6">
                  <button
                    onClick={() => setFinalBudget(Math.max(1, finalBudget - 1))}
                    className="w-14 h-14 rounded-full bg-secondary flex items-center justify-center text-2xl font-bold hover:bg-accent transition-colors"
                  >
                    −
                  </button>
                  <div>
                    <span className="text-6xl font-bold tabular-nums text-primary">
                      {finalBudget}
                    </span>
                    <span className="block text-sm text-muted-foreground mt-1">
                      poeng per dag
                    </span>
                  </div>
                  <button
                    onClick={() => setFinalBudget(finalBudget + 1)}
                    className="w-14 h-14 rounded-full bg-secondary flex items-center justify-center text-2xl font-bold hover:bg-accent transition-colors"
                  >
                    +
                  </button>
                </div>
              </div>

              {/* How it was calculated */}
              <div className="w-full space-y-2 max-w-sm">
                <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                  Basert på
                </p>
                {bellBudget !== null && (
                  <div className="flex items-center justify-between p-3 rounded-lg bg-muted/50 text-sm">
                    <span className="text-muted-foreground">
                      Funksjonsnivå (Bell-skala)
                    </span>
                    <span className="font-medium">{bellBudget} poeng</span>
                  </div>
                )}
                {dayBudget !== null && (
                  <div className="flex items-center justify-between p-3 rounded-lg bg-muted/50 text-sm">
                    <span className="text-muted-foreground">
                      Typisk dag-vurdering
                    </span>
                    <span className="font-medium">{dayBudget} poeng</span>
                  </div>
                )}
              </div>

              {/* Explanation */}
              <div className="bg-card border rounded-xl p-4 max-w-sm">
                <p className="text-xs text-muted-foreground leading-relaxed">
                  <strong className="text-foreground">Husk:</strong> Dette er et
                  utgangspunkt, ikke en fasit. Forskningen anbefaler å starte
                  konservativt og justere over 1–2 uker basert på om du opplever
                  PEM/krasj. Målet er å finne et nivå der du kan være konsekvent
                  aktiv uten å overbelaste kroppen.
                </p>
              </div>

              {/* What budget means in practice */}
              <div className="w-full max-w-sm space-y-2">
                <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                  Med {finalBudget} poeng kan en dag se slik ut
                </p>
                <BudgetExamples budget={finalBudget} />
              </div>
            </div>

            <div className="mt-6">
              <button
                onClick={() => goToStep('confirm')}
                className="w-full py-4 rounded-xl bg-primary text-primary-foreground font-semibold text-lg hover:opacity-90 transition-opacity flex items-center justify-center gap-2"
              >
                Bruk dette budsjettet <ChevronRight size={18} />
              </button>
            </div>
          </div>
        )}

        {/* ─── Confirm / Tips ─── */}
        {step === 'confirm' && (
          <div className="flex-1 flex flex-col items-center justify-center gap-6">
            <div className="w-16 h-16 rounded-full bg-energy-full/10 flex items-center justify-center">
              <CheckCircle2 size={32} className="text-energy-full" />
            </div>

            <div className="text-center space-y-2 max-w-sm">
              <h2 className="text-2xl font-bold">Alt klart!</h2>
              <p className="text-muted-foreground text-sm leading-relaxed">
                Ditt daglige budsjett er satt til{' '}
                <strong className="text-primary">{finalBudget} poeng</strong>.
              </p>
            </div>

            <div className="w-full max-w-sm space-y-3">
              <TipCard
                title="Start med å observere"
                text="Bruk den første uken til å logge uten å endre rutiner. Det gir verdifull data om ditt faktiske forbruksmønster."
              />
              <TipCard
                title="Juster underveis"
                text="Opplever du jevnlig krasj/PEM? Reduser budsjettet. Har du overskudd? Da kan du forsiktig øke."
              />
              <TipCard
                title="Husk energigiverne"
                text="Hvile, natur og meditasjon legger energi tilbake. Planlegg disse inn som en del av dagen."
              />
            </div>

            <button
              onClick={() => onComplete(finalBudget)}
              className="w-full max-w-sm py-4 rounded-xl bg-primary text-primary-foreground font-semibold text-lg hover:opacity-90 transition-opacity"
            >
              Start energiregnskapet
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

// ─── Sub-components ───

function StepHeader({
  icon,
  title,
  description,
  onBack,
}: {
  icon: React.ReactNode;
  title: string;
  description: string;
  onBack: () => void;
}) {
  return (
    <div>
      <button
        onClick={onBack}
        className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground transition-colors mb-4"
      >
        <ChevronLeft size={16} /> Tilbake
      </button>
      <div className="flex items-start gap-3">
        <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center shrink-0 text-primary">
          {icon}
        </div>
        <div>
          <h2 className="text-lg font-bold">{title}</h2>
          <p className="text-sm text-muted-foreground leading-relaxed mt-1">
            {description}
          </p>
        </div>
      </div>
    </div>
  );
}

function InfoBox({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex items-start gap-2 p-3 rounded-lg bg-primary/5 border border-primary/10 mt-4">
      <Info size={14} className="text-primary mt-0.5 shrink-0" />
      <p className="text-xs text-muted-foreground leading-relaxed">
        {children}
      </p>
    </div>
  );
}

function TipCard({ title, text }: { title: string; text: string }) {
  return (
    <div className="p-4 rounded-xl border border-border bg-card">
      <p className="font-medium text-sm">{title}</p>
      <p className="text-xs text-muted-foreground mt-1 leading-relaxed">
        {text}
      </p>
    </div>
  );
}

function BudgetExamples({ budget }: { budget: number }) {
  // Generate a realistic example day based on budget
  type Example = { name: string; cost: number };

  let examples: Example[] = [];

  if (budget <= 8) {
    examples = [
      { name: 'Morgenrutine (enkel)', cost: 2 },
      { name: 'Hvile', cost: -1 },
      { name: 'Lett måltid', cost: 1 },
      { name: 'Kort gåtur (10 min)', cost: 2 },
      { name: 'Hvile/power nap', cost: -2 },
      { name: 'Middag (enkel)', cost: 1 },
      { name: 'Kveldshvile', cost: -1 },
    ];
  } else if (budget <= 15) {
    examples = [
      { name: 'Morgenrutine + frokost', cost: 3 },
      { name: 'Kort konsentrasjonsarbeid', cost: 3 },
      { name: 'Hvile', cost: -2 },
      { name: 'Handle mat', cost: 3 },
      { name: 'Lage middag', cost: 2 },
      { name: 'Gåtur (20 min)', cost: 2 },
      { name: 'Rolig kveld', cost: -1 },
    ];
  } else if (budget <= 25) {
    examples = [
      { name: 'Morgenrutine', cost: 2 },
      { name: 'Jobb (halv dag)', cost: 6 },
      { name: 'Hvile / lunsj', cost: -2 },
      { name: 'Husarbeid', cost: 3 },
      { name: 'Gåtur', cost: 3 },
      { name: 'Sosial middag', cost: 3 },
      { name: 'Avslapping', cost: -1 },
    ];
  } else {
    examples = [
      { name: 'Morgenrutine', cost: 2 },
      { name: 'Jobb (full dag)', cost: 10 },
      { name: 'Lunsjpause', cost: -2 },
      { name: 'Trening', cost: 4 },
      { name: 'Lage middag', cost: 2 },
      { name: 'Sosialt', cost: 3 },
      { name: 'Kveldshvile', cost: -1 },
    ];
  }

  let running = budget;
  return (
    <div className="space-y-1">
      {examples.map((ex, i) => {
        const isGain = ex.cost < 0;
        running -= ex.cost;
        return (
          <div
            key={i}
            className="flex items-center gap-2 text-xs py-1.5 px-2 rounded-md bg-muted/30"
          >
            <span className="flex-1 truncate text-muted-foreground">
              {ex.name}
            </span>
            <span
              className={`font-medium tabular-nums ${
                isGain ? 'text-energy-full' : 'text-energy-low'
              }`}
            >
              {isGain ? '+' : '−'}
              {Math.abs(ex.cost)}
            </span>
            <span className="text-muted-foreground/60 tabular-nums w-8 text-right">
              {running}
            </span>
          </div>
        );
      })}
    </div>
  );
}
