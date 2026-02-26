import { useState } from 'react';
import {
  Battery,
  ChevronRight,
  ChevronLeft,
  Sparkles,
  Activity,
  AlertTriangle,
  CheckCircle2,
  Circle,
  Clock,
  BedDouble,
  Briefcase,
  Home,
  Users,
  Dumbbell,
} from 'lucide-react';

interface OnboardingProps {
  onComplete: (budget: number) => void;
}

// ─── Step types ───

type WizardStep =
  | 'welcome'
  | 'bell_scale'
  | 'typical_day'
  | 'crash_pattern'
  | 'energy_anchors'
  | 'budget_result';

// ─── Bell scale (adapted) ───
// Based on Dr. David Bell's CFIDS Disability Scale, validated in ME/CFS research.
// Simplified to 5 tiers with Norwegian descriptions and concrete anchors.

interface BellLevel {
  value: number;
  label: string;
  description: string;
  icon: React.ReactNode;
  budgetRange: [number, number];
}

const BELL_LEVELS: BellLevel[] = [
  {
    value: 80,
    label: 'Lett redusert',
    description:
      'Du klarer det meste i hverdagen, men merker at krevende aktiviteter tar mer enn før. Du kan jobbe fulltid, men trenger kanskje ekstra hvile etterpå.',
    icon: <Activity size={20} />,
    budgetRange: [25, 35],
  },
  {
    value: 60,
    label: 'Moderat redusert',
    description:
      'Du har tydelige begrensninger i hverdagen. Kan jobbe deltid eller i lett arbeid med fleksible timer, men trenger hvilepauser gjennom dagen.',
    icon: <Clock size={20} />,
    budgetRange: [18, 25],
  },
  {
    value: 40,
    label: 'Betydelig redusert',
    description:
      'Du klarer 3–4 timer med lett aktivitet daglig. Trenger mye hvile. Kan ikke jobbe fullt, men klarer noe husarbeid og korte turer.',
    icon: <Home size={20} />,
    budgetRange: [12, 18],
  },
  {
    value: 20,
    label: 'Sterkt redusert',
    description:
      'Du er stort sett hjemme. Klarer kanskje 1–2 timer lett aktivitet på gode dager. Grunnleggende stell og enkle oppgaver er det som går.',
    icon: <BedDouble size={20} />,
    budgetRange: [6, 12],
  },
  {
    value: 10,
    label: 'Svært begrenset',
    description:
      'Du er sengeliggende det meste av tiden. Selv grunnleggende aktiviteter som å kle på seg eller spise krever betydelig energi.',
    icon: <AlertTriangle size={20} />,
    budgetRange: [3, 6],
  },
];

// ─── Typical day activities (energy audit) ───
// Based on energy expenditure mapping from OT practice (ergoterapifaglig energikartlegging)

interface DayActivity {
  id: string;
  label: string;
  icon: React.ReactNode;
  energyWeight: number; // relative energy cost
  category: string;
}

const DAY_ACTIVITIES: DayActivity[] = [
  { id: 'shower', label: 'Dusje / stell', icon: <Circle size={16} />, energyWeight: 2, category: 'Personlig' },
  { id: 'meal_prep', label: 'Lage mat', icon: <Circle size={16} />, energyWeight: 2, category: 'Personlig' },
  { id: 'housework', label: 'Husarbeid (støvsuge, vaske o.l.)', icon: <Home size={16} />, energyWeight: 3, category: 'Husarbeid' },
  { id: 'shopping', label: 'Handle / ærender ute', icon: <Circle size={16} />, energyWeight: 3, category: 'Husarbeid' },
  { id: 'work_light', label: 'Lett jobb / kontorarbeid', icon: <Briefcase size={16} />, energyWeight: 2, category: 'Jobb' },
  { id: 'work_meeting', label: 'Møter / krevende samtaler', icon: <Briefcase size={16} />, energyWeight: 3, category: 'Jobb' },
  { id: 'social_short', label: 'Kort sosialt samvær', icon: <Users size={16} />, energyWeight: 2, category: 'Sosialt' },
  { id: 'social_long', label: 'Lengre sosialt (besøk, middag)', icon: <Users size={16} />, energyWeight: 4, category: 'Sosialt' },
  { id: 'walk_short', label: 'Kort gåtur / lett bevegelse', icon: <Dumbbell size={16} />, energyWeight: 2, category: 'Fysisk' },
  { id: 'exercise', label: 'Trening / lengre tur', icon: <Dumbbell size={16} />, energyWeight: 4, category: 'Fysisk' },
];

// ─── Crash pattern ───

interface CrashOption {
  id: string;
  label: string;
  description: string;
  budgetAdjust: number; // multiplier: <1 means reduce budget (more conservative)
}

const CRASH_OPTIONS: CrashOption[] = [
  {
    id: 'frequent',
    label: 'Ofte (flere ganger i uken)',
    description: 'Du opplever regelmessig at du overskrider grensen og trenger lang restitusjonstid.',
    budgetAdjust: 0.7,
  },
  {
    id: 'sometimes',
    label: 'Av og til (ukentlig)',
    description: 'Det hender at du gjør for mye og kjenner forverring dagen(e) etter.',
    budgetAdjust: 0.85,
  },
  {
    id: 'rarely',
    label: 'Sjelden (noen ganger i måneden)',
    description: 'Du har som regel god kontroll, men det hender innimellom.',
    budgetAdjust: 1.0,
  },
  {
    id: 'unsure',
    label: 'Usikker / nytt for meg',
    description: 'Du har ikke ennå et klart bilde av dine mønstre.',
    budgetAdjust: 0.8,
  },
];

// ─── Energy anchors ───
// Inspired by DSQ energy perception items and Nijs et al.'s 50% baseline approach

function computeSuggestedBudget(
  bellLevel: number | null,
  selectedActivities: string[],
  crashPattern: string | null
): number {
  // Start from Bell scale
  const bell = BELL_LEVELS.find((b) => b.value === bellLevel);
  if (!bell) return 20;

  const [low, high] = bell.budgetRange;
  let base = Math.round((low + high) / 2);

  // Adjust based on how many activities they attempt on a typical day
  // More activities → they're likely at the higher end of their range
  const activityCount = selectedActivities.length;
  if (activityCount >= 7) {
    base = Math.round(high * 0.95);
  } else if (activityCount >= 5) {
    base = Math.round((low + high) / 2 + (high - low) * 0.2);
  } else if (activityCount <= 2) {
    base = Math.round(low * 1.1);
  }

  // Apply crash pattern adjustment (Nijs-inspired conservative start)
  const crash = CRASH_OPTIONS.find((c) => c.id === crashPattern);
  if (crash) {
    base = Math.round(base * crash.budgetAdjust);
  }

  return Math.max(3, base);
}

// ─── Main component ───

export function Onboarding({ onComplete }: OnboardingProps) {
  const [step, setStep] = useState<WizardStep>('welcome');
  const [bellLevel, setBellLevel] = useState<number | null>(null);
  const [selectedActivities, setSelectedActivities] = useState<string[]>([]);
  const [crashPattern, setCrashPattern] = useState<string | null>(null);
  const [budget, setBudget] = useState<number>(20);

  const steps: WizardStep[] = [
    'welcome',
    'bell_scale',
    'typical_day',
    'crash_pattern',
    'energy_anchors',
    'budget_result',
  ];
  const currentIdx = steps.indexOf(step);
  const progress = ((currentIdx) / (steps.length - 1)) * 100;

  const canGoNext = (): boolean => {
    switch (step) {
      case 'bell_scale': return bellLevel !== null;
      case 'typical_day': return true; // optional
      case 'crash_pattern': return crashPattern !== null;
      default: return true;
    }
  };

  const goNext = () => {
    const nextIdx = currentIdx + 1;
    if (nextIdx >= steps.length) return;
    const nextStep = steps[nextIdx];

    // Compute budget when arriving at result
    if (nextStep === 'budget_result') {
      setBudget(computeSuggestedBudget(bellLevel, selectedActivities, crashPattern));
    }
    setStep(nextStep);
  };

  const goBack = () => {
    const prevIdx = currentIdx - 1;
    if (prevIdx < 0) return;
    setStep(steps[prevIdx]);
  };

  const toggleActivity = (id: string) => {
    setSelectedActivities((prev) =>
      prev.includes(id) ? prev.filter((a) => a !== id) : [...prev, id]
    );
  };

  return (
    <div className="min-h-screen flex flex-col">
      {/* Progress bar */}
      {step !== 'welcome' && (
        <div className="h-1 bg-muted">
          <div
            className="h-full bg-primary transition-all duration-500 ease-out"
            style={{ width: `${progress}%` }}
          />
        </div>
      )}

      <div className="flex-1 flex items-center justify-center p-6">
        <div className="max-w-md w-full">
          {/* ─── Welcome ─── */}
          {step === 'welcome' && (
            <div className="space-y-6 text-center">
              <div className="w-20 h-20 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto">
                <Battery size={40} className="text-primary" />
              </div>
              <div className="space-y-3">
                <h1 className="text-2xl font-bold tracking-tight">
                  Energiregnskap
                </h1>
                <p className="text-muted-foreground text-sm leading-relaxed max-w-sm mx-auto">
                  Vi hjelper deg å finne ditt personlige energibudsjett. 
                  Gjennom noen enkle spørsmål kartlegger vi ditt nåværende 
                  funksjonsnivå og foreslår et utgangspunkt du kan justere over tid.
                </p>
              </div>

              <div className="bg-card border rounded-2xl p-5 text-left space-y-3">
                <h2 className="font-semibold text-sm">Hva skjer nå?</h2>
                <div className="space-y-2.5">
                  {[
                    'Ditt funksjonsnivå i dag',
                    'Hva du gjør på en typisk dag',
                    'Dine erfaringer med «krasj»',
                    'Personlige energiankere',
                  ].map((label, i) => (
                    <div key={i} className="flex items-center gap-3">
                      <div className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center text-xs font-bold text-primary shrink-0">
                        {i + 1}
                      </div>
                      <span className="text-sm text-muted-foreground">{label}</span>
                    </div>
                  ))}
                </div>
              </div>

              <p className="text-xs text-muted-foreground">
                Basert på Bell Disability Scale, DePaul Symptom Questionnaire
                og Energy Envelope Theory (Jason et al., DePaul University).
              </p>

              <button
                onClick={goNext}
                className="w-full py-4 rounded-xl bg-primary text-primary-foreground font-semibold text-lg hover:opacity-90 transition-opacity"
              >
                Start kartlegging
              </button>
            </div>
          )}

          {/* ─── Bell Scale ─── */}
          {step === 'bell_scale' && (
            <div className="space-y-5">
              <div className="space-y-2">
                <h2 className="text-xl font-bold">Ditt funksjonsnivå</h2>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  Hvilken beskrivelse passer best for din hverdag akkurat nå? 
                  Tenk på en typisk uke, ikke dine beste eller verste dager.
                </p>
              </div>

              <div className="space-y-3">
                {BELL_LEVELS.map((level) => (
                  <button
                    key={level.value}
                    onClick={() => setBellLevel(level.value)}
                    className={`w-full text-left p-4 rounded-xl border transition-all ${
                      bellLevel === level.value
                        ? 'border-primary bg-primary/5 ring-1 ring-primary/20'
                        : 'border-border bg-card hover:border-primary/30'
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      <div
                        className={`mt-0.5 shrink-0 ${
                          bellLevel === level.value
                            ? 'text-primary'
                            : 'text-muted-foreground'
                        }`}
                      >
                        {bellLevel === level.value ? (
                          <CheckCircle2 size={20} />
                        ) : (
                          level.icon
                        )}
                      </div>
                      <div>
                        <span className="font-semibold text-sm">
                          {level.label}
                        </span>
                        <p className="text-xs text-muted-foreground mt-1 leading-relaxed">
                          {level.description}
                        </p>
                      </div>
                    </div>
                  </button>
                ))}
              </div>

              <p className="text-xs text-muted-foreground text-center">
                Tilpasset fra Dr. David Bells CFIDS Disability Scale, 
                brukt i forskning og klinisk praksis verden over.
              </p>
            </div>
          )}

          {/* ─── Typical Day ─── */}
          {step === 'typical_day' && (
            <div className="space-y-5">
              <div className="space-y-2">
                <h2 className="text-xl font-bold">En typisk dag</h2>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  Hvilke av disse aktivitetene gjør du på en vanlig dag? 
                  Velg det som er realistisk for en gjennomsnittlig dag — 
                  ikke din beste eller verste dag.
                </p>
              </div>

              <div className="space-y-2">
                {DAY_ACTIVITIES.map((act) => {
                  const selected = selectedActivities.includes(act.id);
                  return (
                    <button
                      key={act.id}
                      onClick={() => toggleActivity(act.id)}
                      className={`w-full flex items-center gap-3 p-3 rounded-xl border transition-all ${
                        selected
                          ? 'border-primary bg-primary/5'
                          : 'border-border bg-card hover:border-primary/30'
                      }`}
                    >
                      <div
                        className={`w-5 h-5 rounded-md border-2 flex items-center justify-center transition-colors shrink-0 ${
                          selected
                            ? 'border-primary bg-primary'
                            : 'border-muted-foreground/30'
                        }`}
                      >
                        {selected && (
                          <CheckCircle2 size={14} className="text-primary-foreground" />
                        )}
                      </div>
                      <span className="text-sm">{act.label}</span>
                      <span className="ml-auto text-xs text-muted-foreground shrink-0">
                        {'●'.repeat(act.energyWeight)}{'○'.repeat(5 - act.energyWeight)}
                      </span>
                    </button>
                  );
                })}
              </div>

              <p className="text-xs text-muted-foreground text-center">
                Prikkene viser relativ energikostnad. 
                Dette hjelper oss kalibrere budsjettet ditt.
              </p>
            </div>
          )}

          {/* ─── Crash Pattern ─── */}
          {step === 'crash_pattern' && (
            <div className="space-y-5">
              <div className="space-y-2">
                <h2 className="text-xl font-bold">Krasj-mønster</h2>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  Et «krasj» eller PEM (post-exertional malaise) betyr at 
                  symptomene forverres etter aktivitet — ofte med forsinkelse 
                  på timer eller dager. Hvor ofte opplever du dette?
                </p>
              </div>

              <div className="space-y-3">
                {CRASH_OPTIONS.map((option) => (
                  <button
                    key={option.id}
                    onClick={() => setCrashPattern(option.id)}
                    className={`w-full text-left p-4 rounded-xl border transition-all ${
                      crashPattern === option.id
                        ? 'border-primary bg-primary/5 ring-1 ring-primary/20'
                        : 'border-border bg-card hover:border-primary/30'
                    }`}
                  >
                    <span className="font-semibold text-sm block">
                      {option.label}
                    </span>
                    <p className="text-xs text-muted-foreground mt-1 leading-relaxed">
                      {option.description}
                    </p>
                  </button>
                ))}
              </div>

              {crashPattern === 'frequent' && (
                <div className="bg-energy-low/5 border border-energy-low/20 rounded-xl p-4">
                  <p className="text-xs text-muted-foreground leading-relaxed">
                    <span className="font-medium text-foreground">
                      Hyppige krasj betyr at vi bør starte forsiktig.
                    </span>{' '}
                    Forskning (Nijs et al.) anbefaler å starte med ca. 70% av 
                    det du tror du klarer, og heller justere opp gradvis.
                  </p>
                </div>
              )}
            </div>
          )}

          {/* ─── Energy Anchors ─── */}
          {step === 'energy_anchors' && (
            <div className="space-y-5">
              <div className="space-y-2">
                <h2 className="text-xl font-bold">Dine energi-ankere</h2>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  I energiregnskapet bruker vi en poengskala. 
                  Her er noen ankerpunkter som hjelper deg forstå hva tallene betyr:
                </p>
              </div>

              <div className="space-y-3">
                <div className="bg-card border rounded-xl p-4">
                  <div className="flex items-center gap-3 mb-2">
                    <span className="text-2xl font-bold text-energy-full">1</span>
                    <span className="font-semibold text-sm">= minimal anstrengelse</span>
                  </div>
                  <p className="text-xs text-muted-foreground leading-relaxed">
                    Noe du knapt merker: ta medisiner, sende en kort melding, 
                    lese noen sider, sitte i sofaen.
                  </p>
                </div>

                <div className="bg-card border rounded-xl p-4">
                  <div className="flex items-center gap-3 mb-2">
                    <span className="text-2xl font-bold text-energy-good">2–3</span>
                    <span className="font-semibold text-sm">= vanlige daglige gjøremål</span>
                  </div>
                  <p className="text-xs text-muted-foreground leading-relaxed">
                    Dusje, lage et enkelt måltid, en kort gåtur, 
                    en halvtime konsentrasjonsarbeid, rydde et rom.
                  </p>
                </div>

                <div className="bg-card border rounded-xl p-4">
                  <div className="flex items-center gap-3 mb-2">
                    <span className="text-2xl font-bold text-energy-medium">4–5</span>
                    <span className="font-semibold text-sm">= krevende aktiviteter</span>
                  </div>
                  <p className="text-xs text-muted-foreground leading-relaxed">
                    Lengre sosiale sammenkomster, storhandling, 
                    intens trening, lange møter, reising.
                  </p>
                </div>

                <div className="bg-card border rounded-xl p-4 border-energy-full/30">
                  <div className="flex items-center gap-3 mb-2">
                    <span className="text-2xl font-bold text-energy-full">+</span>
                    <span className="font-semibold text-sm">Energigivere legger til</span>
                  </div>
                  <p className="text-xs text-muted-foreground leading-relaxed">
                    Hvile, power nap, meditasjon, lett natur — 
                    disse gir energi tilbake til budsjettet ditt.
                  </p>
                </div>
              </div>

              <div className="bg-accent rounded-xl p-4">
                <p className="text-xs text-muted-foreground leading-relaxed">
                  <span className="font-medium text-foreground">Tips: </span>
                  Disse verdiene er utgangspunkt. Over tid vil du lære dine 
                  personlige kostnader — en dusj kan koste 1 poeng for noen 
                  og 3 for andre. Energiregnskapet tilpasses deg.
                </p>
              </div>
            </div>
          )}

          {/* ─── Budget Result ─── */}
          {step === 'budget_result' && (
            <div className="space-y-6 text-center">
              <div className="space-y-3">
                <Sparkles size={32} className="text-primary mx-auto" />
                <h2 className="text-xl font-bold">Ditt foreslåtte budsjett</h2>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  Basert på dine svar foreslår vi dette som utgangspunkt. 
                  Det er bedre å starte forsiktig og justere opp enn omvendt.
                </p>
              </div>

              {/* Big budget display */}
              <div className="bg-card border rounded-2xl p-8">
                <div className="flex items-center justify-center gap-6">
                  <button
                    onClick={() => setBudget(Math.max(3, budget - 1))}
                    className="w-12 h-12 rounded-full bg-secondary flex items-center justify-center text-xl font-bold hover:bg-accent transition-colors"
                  >
                    −
                  </button>
                  <div className="text-center">
                    <span className="text-6xl font-bold tabular-nums text-primary">
                      {budget}
                    </span>
                    <span className="block text-sm text-muted-foreground mt-1">
                      energipoeng per dag
                    </span>
                  </div>
                  <button
                    onClick={() => setBudget(budget + 1)}
                    className="w-12 h-12 rounded-full bg-secondary flex items-center justify-center text-xl font-bold hover:bg-accent transition-colors"
                  >
                    +
                  </button>
                </div>
              </div>

              {/* Explanation */}
              <div className="bg-accent/50 rounded-xl p-4 text-left">
                <p className="text-xs text-muted-foreground leading-relaxed">
                  <span className="font-medium text-foreground">
                    Hvorfor dette tallet?
                  </span>{' '}
                  {bellLevel && bellLevel >= 60
                    ? 'Ditt funksjonsnivå tilsier at du har en relativt god energibase. '
                    : bellLevel && bellLevel <= 20
                      ? 'Med sterkt redusert funksjon starter vi forsiktig for å unngå krasj. '
                      : 'Vi har tilpasset budsjettet basert på ditt funksjonsnivå. '}
                  {crashPattern === 'frequent'
                    ? 'Fordi du opplever hyppige krasj, har vi redusert med 30% — det er bedre å ha litt til overs enn å overdrive.'
                    : crashPattern === 'unsure'
                      ? 'Siden du er usikker på mønsteret ditt, starter vi konservativt med 80%-regelen.'
                      : 'Du kan justere dette fritt med +/− knappene.'}
                </p>
              </div>

              {/* Info grid */}
              <div className="grid grid-cols-2 gap-3">
                <div className="bg-energy-full/5 border border-energy-full/20 rounded-xl p-3">
                  <Sparkles size={16} className="text-energy-full mb-1" />
                  <p className="text-xs text-muted-foreground">
                    <span className="font-medium text-foreground">Energigivere</span>{' '}
                    legger poeng tilbake.
                  </p>
                </div>
                <div className="bg-energy-low/5 border border-energy-low/20 rounded-xl p-3">
                  <Battery size={16} className="text-energy-low mb-1" />
                  <p className="text-xs text-muted-foreground">
                    <span className="font-medium text-foreground">Aktiviteter</span>{' '}
                    trekker fra budsjettet.
                  </p>
                </div>
              </div>

              <div className="space-y-3">
                <button
                  onClick={() => onComplete(budget)}
                  className="w-full py-4 rounded-xl bg-primary text-primary-foreground font-semibold text-lg hover:opacity-90 transition-opacity"
                >
                  Start med {budget} poeng
                </button>
                <p className="text-xs text-muted-foreground">
                  Du kan endre budsjettet når som helst i innstillingene. 
                  Det anbefales å evaluere etter 1–2 uker.
                </p>
              </div>
            </div>
          )}

          {/* ─── Navigation ─── */}
          {step !== 'welcome' && step !== 'budget_result' && (
            <div className="flex gap-3 mt-8">
              <button
                onClick={goBack}
                className="flex items-center gap-1 px-5 py-3 rounded-xl border border-border text-sm font-medium hover:bg-accent transition-colors"
              >
                <ChevronLeft size={16} />
                Tilbake
              </button>
              <button
                onClick={goNext}
                disabled={!canGoNext()}
                className={`flex-1 flex items-center justify-center gap-1 py-3 rounded-xl text-sm font-medium transition-all ${
                  canGoNext()
                    ? 'bg-primary text-primary-foreground hover:opacity-90'
                    : 'bg-muted text-muted-foreground cursor-not-allowed'
                }`}
              >
                {step === 'energy_anchors' ? 'Se forslag' : 'Neste'}
                <ChevronRight size={16} />
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
