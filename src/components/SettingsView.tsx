import { useState } from 'react';
import { ArrowLeft } from 'lucide-react';
import type { EnergyProfile } from '@/types';

interface SettingsProps {
  profile: EnergyProfile;
  onUpdateProfile: (updates: Partial<Pick<EnergyProfile, 'dailyBudget' | 'scaleUnit'>>) => Promise<void>;
  onBack: () => void;
}

export function SettingsView({ profile, onUpdateProfile, onBack }: SettingsProps) {
  const [budget, setBudget] = useState(profile.dailyBudget);
  const [saved, setSaved] = useState(false);

  const handleSave = async () => {
    await onUpdateProfile({ dailyBudget: budget });
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  return (
    <div className="max-w-lg mx-auto px-4 pb-8">
      <header className="flex items-center gap-3 py-4">
        <button
          onClick={onBack}
          className="p-2 rounded-lg hover:bg-accent transition-colors"
          aria-label="Tilbake"
        >
          <ArrowLeft size={20} />
        </button>
        <h1 className="text-lg font-bold">Innstillinger</h1>
      </header>

      <div className="space-y-6 mt-4">
        {/* Budget setting */}
        <div className="bg-card border rounded-2xl p-6 space-y-4">
          <div>
            <h2 className="font-semibold">Daglig energibudsjett</h2>
            <p className="text-sm text-muted-foreground mt-1">
              Hvor mange energipoeng har du tilgjengelig per dag?
              Et godt utgangspunkt er å observere en typisk dag og 
              summere hva du klarer uten å «krasje».
            </p>
          </div>

          <div className="flex items-center justify-center gap-6">
            <button
              onClick={() => setBudget(Math.max(1, budget - 1))}
              className="w-12 h-12 rounded-full bg-secondary flex items-center justify-center text-xl font-bold hover:bg-accent transition-colors"
            >
              −
            </button>
            <span className="text-4xl font-bold tabular-nums text-primary w-16 text-center">
              {budget}
            </span>
            <button
              onClick={() => setBudget(budget + 1)}
              className="w-12 h-12 rounded-full bg-secondary flex items-center justify-center text-xl font-bold hover:bg-accent transition-colors"
            >
              +
            </button>
          </div>

          <button
            onClick={handleSave}
            className="w-full py-3 rounded-xl bg-primary text-primary-foreground font-medium hover:opacity-90 transition-opacity"
          >
            {saved ? '✓ Lagret!' : 'Lagre'}
          </button>
        </div>

        {/* Info section */}
        <div className="bg-card border rounded-2xl p-6 space-y-3">
          <h2 className="font-semibold">Om energiregnskap</h2>
          <p className="text-sm text-muted-foreground leading-relaxed">
            Energiregnskap er basert på «Energy Envelope Theory» utviklet av 
            Leonard Jason ved DePaul University. Prinsippet er å holde 
            aktivitetsnivået innenfor grensene av tilgjengelig energi for å 
            unngå PEM (post-exertional malaise) og «krasj».
          </p>
          <p className="text-sm text-muted-foreground leading-relaxed">
            Målet er ikke å gjøre minst mulig, men å finne en bærekraftig 
            balanse mellom aktivitet og hvile som gir best mulig funksjon 
            og livskvalitet over tid.
          </p>
        </div>

        {/* Data section */}
        <div className="bg-card border rounded-2xl p-6 space-y-3">
          <h2 className="font-semibold">Datalagring</h2>
          <p className="text-sm text-muted-foreground leading-relaxed">
            All data lagres lokalt på din enhet i nettleserens database (IndexedDB). 
            Ingen data sendes til en server. Skylagring og synkronisering 
            kommer i en fremtidig versjon.
          </p>
        </div>
      </div>
    </div>
  );
}
