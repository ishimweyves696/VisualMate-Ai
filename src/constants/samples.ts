import { VisualData } from '../types';

export const PUBLIC_SAMPLES: VisualData[] = [
  {
    id: 'public-sample-photosynthesis',
    topic: 'Photosynthesis and Plant Cell Structure',
    title: 'Photosynthesis: From Leaf to Chloroplast',
    description: 'A detailed visual guide to the process of photosynthesis, showing the leaf cross-section, chloroplast structure, and the chemical reactions involved.',
    subject: 'Biology',
    gradeLevel: 'High School',
    language: 'English',
    style: 'Diagram',
    createdAt: 1711478400000,
    imageUrl: 'https://picsum.photos/seed/photosynthesis-diagram/1280/720',
    category: 'Science',
    isPublicSample: true,
    nodes: [
      { id: 'n1', label: 'Leaf Cross-section', type: 'concept', description: 'Shows the cuticle, epidermis, spongy mesophyll, and stomata for gas exchange.' },
      { id: 'n2', label: 'Chloroplast Structure', type: 'concept', description: 'Includes the outer and inner membranes, stroma, and thylakoid stacks.' },
      { id: 'n3', label: 'Light-Dependent Reactions', type: 'process', description: 'Occurs in the thylakoids, converting light and H2O into ATP, NADPH, and O2.' },
      { id: 'n4', label: 'Calvin Cycle', type: 'process', description: 'Occurs in the stroma, using CO2, ATP, and NADPH to produce G3P/Glucose.' },
      { id: 'n5', label: 'Photosynthesis Equation', type: 'output', description: '6 CO2 + 6 H2O + LIGHT ENERGY → C6H12O6 + 6 O2' }
    ],
    edges: [
      { from: 'n1', to: 'n2', label: 'Contains' },
      { from: 'n2', to: 'n3', label: 'Site of' },
      { from: 'n3', to: 'n4', label: 'Powers' },
      { from: 'n4', to: 'n5', label: 'Produces' }
    ],
    imagePrompt: 'A detailed educational diagram of photosynthesis, showing a leaf cross-section at the top and a chloroplast at the bottom with chemical cycles, clean professional style, scientific illustration.',
    commentary: 'This sample illustrates the complex multi-scale process of how plants convert light into chemical energy.'
  }
];
