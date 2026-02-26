import type { ActivityTemplate } from '@/types';
import { v4 as uuid } from 'uuid';

export function createDefaultTemplates(): ActivityTemplate[] {
  const now = new Date().toISOString();
  let order = 0;

  const t = (
    name: string,
    defaultCost: number,
    category: ActivityTemplate['category'],
    icon: string,
    type: ActivityTemplate['type'] = 'cost'
  ): ActivityTemplate => ({
    id: uuid(),
    name,
    defaultCost,
    category,
    icon,
    type,
    sortOrder: order++,
    createdAt: now,
  });

  return [
    // Personlig stell
    t('Dusje', 2, 'personal_care', 'Droplets'),
    t('Kle på seg', 1, 'personal_care', 'Shirt'),
    t('Lage mat', 2, 'personal_care', 'CookingPot'),
    t('Spise måltid', 1, 'personal_care', 'UtensilsCrossed'),

    // Husarbeid
    t('Støvsuge', 3, 'household', 'Home'),
    t('Vaske klær', 2, 'household', 'WashingMachine'),
    t('Rydde', 2, 'household', 'Package'),
    t('Handle mat', 3, 'household', 'ShoppingCart'),

    // Jobb
    t('Konsentrasjonsarbeid', 3, 'work', 'Brain'),
    t('Møte / samtale', 2, 'work', 'MessageSquare'),
    t('Lett kontorarbeid', 1, 'work', 'Monitor'),
    t('Telefonsamtale', 2, 'work', 'Phone'),

    // Sosialt
    t('Besøk (kort)', 2, 'social', 'UserCheck'),
    t('Besøk (langt)', 4, 'social', 'Users'),
    t('Sosiale medier', 1, 'social', 'Smartphone'),

    // Fysisk
    t('Gåtur (kort)', 2, 'physical', 'Footprints'),
    t('Gåtur (lang)', 4, 'physical', 'MapPin'),
    t('Trening (lett)', 3, 'physical', 'Dumbbell'),
    t('Trening (intens)', 5, 'physical', 'Flame'),

    // Hvile / restitusjon (gir energi)
    t('Hvile / ligg ned', 2, 'rest', 'Moon', 'gain'),
    t('Power nap', 3, 'rest', 'BedDouble', 'gain'),
    t('Meditasjon', 2, 'rest', 'Wind', 'gain'),
    t('Lett lesing', 1, 'rest', 'BookOpen', 'gain'),
    t('Natur / frisk luft', 2, 'rest', 'TreePine', 'gain'),

    // Transport
    t('Kjøre bil', 2, 'transport', 'Car'),
    t('Kollektivtransport', 1, 'transport', 'Bus'),
    t('Sykle', 3, 'transport', 'Bike'),
  ];
}
