import type { EnergyDefaults } from './types'

const defaults: EnergyDefaults = {
  categories: [
    { moduleId: 'energy', name: 'Personlig stell', color: '#6366f1', icon: 'Droplets',      sortOrder: 0 },
    { moduleId: 'energy', name: 'Husarbeid',        color: '#f97316', icon: 'Home',          sortOrder: 1 },
    { moduleId: 'energy', name: 'Jobb / studier',   color: '#3b82f6', icon: 'Briefcase',     sortOrder: 2 },
    { moduleId: 'energy', name: 'Sosialt',          color: '#8b5cf6', icon: 'Users',         sortOrder: 3 },
    { moduleId: 'energy', name: 'Fysisk aktivitet', color: '#ef4444', icon: 'Activity',      sortOrder: 4 },
    { moduleId: 'energy', name: 'Hvile',            color: '#22c55e', icon: 'Moon',          sortOrder: 5 },
    { moduleId: 'energy', name: 'Transport',        color: '#eab308', icon: 'Car',           sortOrder: 6 },
    { moduleId: 'energy', name: 'Annet',            color: '#6b7280', icon: 'MoreHorizontal', sortOrder: 7 },
  ],
  templates: [
    // Personlig stell (categoryIndex: 0)
    { name: 'Dusje',              defaultCost: -2, defaultDuration: 15, icon: 'Droplets',       isArchived: false, categoryIndex: 0 },
    { name: 'Kle på seg',         defaultCost: -1, defaultDuration: 10, icon: 'Shirt',          isArchived: false, categoryIndex: 0 },
    { name: 'Lage mat',           defaultCost: -2, defaultDuration: 30, icon: 'CookingPot',     isArchived: false, categoryIndex: 0 },
    { name: 'Spise måltid',       defaultCost: -1, defaultDuration: 20, icon: 'UtensilsCrossed', isArchived: false, categoryIndex: 0 },
    // Husarbeid (categoryIndex: 1)
    { name: 'Støvsuge',           defaultCost: -3, defaultDuration: 30, icon: 'Sparkles',       isArchived: false, categoryIndex: 1 },
    { name: 'Vaske klær',         defaultCost: -2, defaultDuration: 20, icon: 'Waves',          isArchived: false, categoryIndex: 1 },
    { name: 'Rydde',              defaultCost: -2, defaultDuration: 20, icon: 'Package',        isArchived: false, categoryIndex: 1 },
    { name: 'Handle mat',         defaultCost: -3, defaultDuration: 45, icon: 'ShoppingCart',   isArchived: false, categoryIndex: 1 },
    // Jobb / studier (categoryIndex: 2)
    { name: 'Konsentrasjonsarbeid', defaultCost: -3, defaultDuration: 60, icon: 'Brain',        isArchived: false, categoryIndex: 2 },
    { name: 'Møte / samtale',     defaultCost: -2, defaultDuration: 45, icon: 'MessageSquare',  isArchived: false, categoryIndex: 2 },
    { name: 'Lett kontorarbeid',  defaultCost: -1, defaultDuration: 60, icon: 'Monitor',        isArchived: false, categoryIndex: 2 },
    // Sosialt (categoryIndex: 3)
    { name: 'Besøk (kort)',       defaultCost: -2, defaultDuration: 60,  icon: 'UserCheck',     isArchived: false, categoryIndex: 3 },
    { name: 'Besøk (langt)',      defaultCost: -4, defaultDuration: 120, icon: 'Users',         isArchived: false, categoryIndex: 3 },
    // Fysisk aktivitet (categoryIndex: 4)
    { name: 'Kort gåtur',         defaultCost: -2, defaultDuration: 20, icon: 'Footprints',     isArchived: false, categoryIndex: 4 },
    { name: 'Lang gåtur',         defaultCost: -4, defaultDuration: 45, icon: 'MapPin',         isArchived: false, categoryIndex: 4 },
    { name: 'Trening (lett)',      defaultCost: -3, defaultDuration: 30, icon: 'Dumbbell',       isArchived: false, categoryIndex: 4 },
    // Hvile (categoryIndex: 5) — positive cost = energy gain
    { name: 'Hvile / ligg ned',   defaultCost:  2, defaultDuration: 30, icon: 'Moon',           isArchived: false, categoryIndex: 5 },
    { name: 'Power nap',          defaultCost:  3, defaultDuration: 20, icon: 'BedDouble',      isArchived: false, categoryIndex: 5 },
    { name: 'Meditasjon',         defaultCost:  2, defaultDuration: 15, icon: 'Wind',           isArchived: false, categoryIndex: 5 },
    { name: 'Lett lesing',        defaultCost:  1, defaultDuration: 30, icon: 'BookOpen',       isArchived: false, categoryIndex: 5 },
    // Transport (categoryIndex: 6)
    { name: 'Kjøre bil',          defaultCost: -2, defaultDuration: 30, icon: 'Car',            isArchived: false, categoryIndex: 6 },
    { name: 'Kollektivtransport', defaultCost: -1, defaultDuration: 30, icon: 'Bus',            isArchived: false, categoryIndex: 6 },
  ],
}

export default defaults
