import type { EnergyDefaults } from './types'

const defaults: EnergyDefaults = {
  categories: [
    { moduleId: 'energy', name: 'Personal care',     color: '#6366f1', icon: 'Droplets',       sortOrder: 0 },
    { moduleId: 'energy', name: 'Household',         color: '#f97316', icon: 'Home',           sortOrder: 1 },
    { moduleId: 'energy', name: 'Work / Study',      color: '#3b82f6', icon: 'Briefcase',      sortOrder: 2 },
    { moduleId: 'energy', name: 'Social',            color: '#8b5cf6', icon: 'Users',          sortOrder: 3 },
    { moduleId: 'energy', name: 'Physical activity', color: '#ef4444', icon: 'Activity',       sortOrder: 4 },
    { moduleId: 'energy', name: 'Rest',              color: '#22c55e', icon: 'Moon',           sortOrder: 5 },
    { moduleId: 'energy', name: 'Transport',         color: '#eab308', icon: 'Car',            sortOrder: 6 },
    { moduleId: 'energy', name: 'Other',             color: '#6b7280', icon: 'MoreHorizontal', sortOrder: 7 },
  ],
  templates: [
    // Personal care (categoryIndex: 0)
    { name: 'Shower',             defaultCost: -2, defaultDuration: 15, icon: 'Droplets',       isArchived: false, categoryIndex: 0 },
    { name: 'Get dressed',        defaultCost: -1, defaultDuration: 10, icon: 'Shirt',          isArchived: false, categoryIndex: 0 },
    { name: 'Cook a meal',        defaultCost: -2, defaultDuration: 30, icon: 'CookingPot',     isArchived: false, categoryIndex: 0 },
    { name: 'Eat a meal',         defaultCost: -1, defaultDuration: 20, icon: 'UtensilsCrossed', isArchived: false, categoryIndex: 0 },
    // Household (categoryIndex: 1)
    { name: 'Vacuum',             defaultCost: -3, defaultDuration: 30, icon: 'Sparkles',       isArchived: false, categoryIndex: 1 },
    { name: 'Laundry',            defaultCost: -2, defaultDuration: 20, icon: 'Waves',          isArchived: false, categoryIndex: 1 },
    { name: 'Tidy up',            defaultCost: -2, defaultDuration: 20, icon: 'Package',        isArchived: false, categoryIndex: 1 },
    { name: 'Grocery shopping',   defaultCost: -3, defaultDuration: 45, icon: 'ShoppingCart',   isArchived: false, categoryIndex: 1 },
    // Work / Study (categoryIndex: 2)
    { name: 'Focused work',       defaultCost: -3, defaultDuration: 60, icon: 'Brain',          isArchived: false, categoryIndex: 2 },
    { name: 'Meeting / call',     defaultCost: -2, defaultDuration: 45, icon: 'MessageSquare',  isArchived: false, categoryIndex: 2 },
    { name: 'Light desk work',    defaultCost: -1, defaultDuration: 60, icon: 'Monitor',        isArchived: false, categoryIndex: 2 },
    // Social (categoryIndex: 3)
    { name: 'Short visit',        defaultCost: -2, defaultDuration: 60,  icon: 'UserCheck',     isArchived: false, categoryIndex: 3 },
    { name: 'Long visit',         defaultCost: -4, defaultDuration: 120, icon: 'Users',         isArchived: false, categoryIndex: 3 },
    // Physical activity (categoryIndex: 4)
    { name: 'Short walk',         defaultCost: -2, defaultDuration: 20, icon: 'Footprints',     isArchived: false, categoryIndex: 4 },
    { name: 'Longer walk',        defaultCost: -4, defaultDuration: 45, icon: 'MapPin',         isArchived: false, categoryIndex: 4 },
    { name: 'Light exercise',     defaultCost: -3, defaultDuration: 30, icon: 'Dumbbell',       isArchived: false, categoryIndex: 4 },
    // Rest (categoryIndex: 5) — positive cost = energy gain
    { name: 'Rest / lie down',    defaultCost:  2, defaultDuration: 30, icon: 'Moon',           isArchived: false, categoryIndex: 5 },
    { name: 'Power nap',          defaultCost:  3, defaultDuration: 20, icon: 'BedDouble',      isArchived: false, categoryIndex: 5 },
    { name: 'Meditation',         defaultCost:  2, defaultDuration: 15, icon: 'Wind',           isArchived: false, categoryIndex: 5 },
    { name: 'Light reading',      defaultCost:  1, defaultDuration: 30, icon: 'BookOpen',       isArchived: false, categoryIndex: 5 },
    // Transport (categoryIndex: 6)
    { name: 'Drive',              defaultCost: -2, defaultDuration: 30, icon: 'Car',            isArchived: false, categoryIndex: 6 },
    { name: 'Public transport',   defaultCost: -1, defaultDuration: 30, icon: 'Bus',            isArchived: false, categoryIndex: 6 },
  ],
}

export default defaults
