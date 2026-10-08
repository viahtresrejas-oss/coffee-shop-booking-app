// Theme colors used for navigation and UI theming
export const colors = {
  bg: '#FAFAFA',
  card: '#FFFFFF',
  primary: '#095D7E', // ocean - matches existing theme
  text: '#1A1A1A', // espresso - matches existing theme
  ocean: '#095D7E',
  oceanDark: '#074863',
  sky: '#56A0C8',
  skyBorder: 'rgba(86,160,200,0.4)',
  espresso: '#1A1A1A',
  muted: '#6B7280',
  cream: '#F9FAFB',
  peach: '#FCF0EA',
  peachDark: '#F5E1D5',
  caramel: '#A66B38',
  border: '#F3F4F6',
  cardBorder: '#E5E7EB',
  inputBorder: '#E5E7EB',
  danger: '#BA1A1A',
};

export const theme = {
  ...colors,
};

export const photo = (id, w = 800) =>
  `https://images.unsplash.com/${id}?auto=format&fit=crop&w=${w}&q=80`;

export const F = {
  display: 'Epilogue_700Bold',
  displayMed: 'Epilogue_500Medium',
  displaySemi: 'Epilogue_600SemiBold',
  body: 'Inter_400Regular',
  bodyMed: 'Inter_500Medium',
  bodySemi: 'Inter_600SemiBold',
  bodyBold: 'Inter_700Bold',
};
