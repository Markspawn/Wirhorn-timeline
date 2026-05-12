export const TIMELINE_GROUPS = [
  'Eras',
  'Ancient History',
  'New World',
  'Divine Events',
  'Cataclysms',
  'Nations',
  'Wars',
  'Arcane Events',
  'Characters',
  'Organizations',
  'Artifacts',
  'Discoveries',
  'Diplomacy',
  'Campaigns'
] as const;

export type TimelineGroup = (typeof TIMELINE_GROUPS)[number];

export type GroupColor = {
  name: string;
  color: string;
  border: string;
  soft: string;
  text: string;
};

export const groupColors: Record<TimelineGroup, GroupColor> = {
  Eras: {
    name: 'Gold',
    color: '#d6a93a',
    border: '#ffe08a',
    soft: 'rgba(214, 169, 58, 0.18)',
    text: '#fff2bd'
  },
  'Ancient History': {
    name: 'Bronze',
    color: '#b26b32',
    border: '#d99555',
    soft: 'rgba(178, 107, 50, 0.18)',
    text: '#ffd0a3'
  },
  'New World': {
    name: 'Teal',
    color: '#1f9c9c',
    border: '#70e2d6',
    soft: 'rgba(31, 156, 156, 0.18)',
    text: '#b5fff7'
  },
  'Divine Events': {
    name: 'Yellow Gold',
    color: '#e0c246',
    border: '#fff09a',
    soft: 'rgba(224, 194, 70, 0.18)',
    text: '#fff4b8'
  },
  Cataclysms: {
    name: 'Red',
    color: '#b83b3b',
    border: '#ff7777',
    soft: 'rgba(184, 59, 59, 0.18)',
    text: '#ffc2c2'
  },
  Nations: {
    name: 'Green',
    color: '#438f45',
    border: '#8ee28f',
    soft: 'rgba(67, 143, 69, 0.18)',
    text: '#cbffcb'
  },
  Wars: {
    name: 'Orange',
    color: '#d77a2d',
    border: '#ffb56e',
    soft: 'rgba(215, 122, 45, 0.18)',
    text: '#ffe0bd'
  },
  'Arcane Events': {
    name: 'Purple',
    color: '#805ac7',
    border: '#bd9cff',
    soft: 'rgba(128, 90, 199, 0.18)',
    text: '#ddccff'
  },
  Characters: {
    name: 'Rose',
    color: '#cc5d8d',
    border: '#ff9bc6',
    soft: 'rgba(204, 93, 141, 0.18)',
    text: '#ffd0e5'
  },
  Organizations: {
    name: 'Blue',
    color: '#3e7bd6',
    border: '#8db9ff',
    soft: 'rgba(62, 123, 214, 0.18)',
    text: '#cfe1ff'
  },
  Artifacts: {
    name: 'Cyan',
    color: '#28a7c5',
    border: '#8beeff',
    soft: 'rgba(40, 167, 197, 0.18)',
    text: '#c4f8ff'
  },
  Discoveries: {
    name: 'Amber',
    color: '#d89c28',
    border: '#ffd36a',
    soft: 'rgba(216, 156, 40, 0.18)',
    text: '#ffe8ad'
  },
  Diplomacy: {
    name: 'Silver Gray',
    color: '#9aa0a6',
    border: '#d5d8dc',
    soft: 'rgba(154, 160, 166, 0.18)',
    text: '#f0f2f5'
  },
  Campaigns: {
    name: 'Royal Blue',
    color: '#304fbd',
    border: '#8298ff',
    soft: 'rgba(48, 79, 189, 0.18)',
    text: '#cbd4ff'
  }
};

export const getGroupColor = (group: string): GroupColor => {
  if (group in groupColors) {
    return groupColors[group as TimelineGroup];
  }

  return {
    name: 'Unknown',
    color: '#8d7f67',
    border: '#d5c6a5',
    soft: 'rgba(141, 127, 103, 0.18)',
    text: '#f5ead1'
  };
};
