
export type Formula = {
  name: string;
  equation: string;
  equationHtml: string;
  subject: 'Physics' | 'Chemistry';
  variables: {
    symbol: string;
    name: string;
    unit: string;
  }[];
};

export const formulaData: Formula[] = [
  // Physics Formulas
  {
    name: 'Work Done (P1)',
    equation: 'Work done = force × distance',
    equationHtml: 'W = F × s',
    subject: 'Physics',
    variables: [
      { symbol: 'W', name: 'Work done', unit: 'J' },
      { symbol: 'F', name: 'Force', unit: 'N' },
      { symbol: 's', name: 'Distance', unit: 'm' },
    ],
  },
  {
    name: 'Kinetic Energy (P1)',
    equation: 'Kinetic energy = 0.5 × mass × (speed)²',
    equationHtml: 'Eₖ = ½ × m × v²',
    subject: 'Physics',
    variables: [
      { symbol: 'Eₖ', name: 'Kinetic energy', unit: 'J' },
      { symbol: 'm', name: 'Mass', unit: 'kg' },
      { symbol: 'v', name: 'Speed', unit: 'm/s' },
    ],
  },
  {
    name: 'Gravitational Potential Energy (P1)',
    equation: 'G.P.E. = mass × gravitational field strength × height',
    equationHtml: 'Eₚ = m × g × h',
    subject: 'Physics',
    variables: [
      { symbol: 'Eₚ', name: 'Gravitational potential energy', unit: 'J' },
      { symbol: 'm', name: 'Mass', unit: 'kg' },
      { symbol: 'g', name: 'Gravitational field strength', unit: 'N/kg' },
      { symbol: 'h', name: 'Height', unit: 'm' },
    ],
  },
  {
    name: 'Power (Energy) (P1)',
    equation: 'Power = energy transferred / time',
    equationHtml: 'P = E / t',
    subject: 'Physics',
    variables: [
      { symbol: 'P', name: 'Power', unit: 'W' },
      { symbol: 'E', name: 'Energy transferred', unit: 'J' },
      { symbol: 't', name: 'Time', unit: 's' },
    ],
  },
  {
    name: 'Power (Work Done) (P1)',
    equation: 'Power = work done / time',
    equationHtml: 'P = W / t',
    subject: 'Physics',
    variables: [
      { symbol: 'P', name: 'Power', unit: 'W' },
      { symbol: 'W', name: 'Work done', unit: 'J' },
      { symbol: 't', name: 'Time', unit: 's' },
    ],
  },
  {
    name: 'Efficiency (P1)',
    equation: 'Efficiency = useful output energy transfer / total input energy transfer',
    equationHtml: 'Efficiency = E<sub>out</sub> / E<sub>in</sub>',
    subject: 'Physics',
    variables: [
      { symbol: 'E<sub>out</sub>', name: 'Useful output energy', unit: 'J' },
      { symbol: 'E<sub>in</sub>', name: 'Total input energy', unit: 'J' },
    ],
  },
   {
    name: 'Efficiency (Power) (P1)',
    equation: 'Efficiency = useful power output / total power input',
    equationHtml: 'Efficiency = P<sub>out</sub> / P<sub>in</sub>',
    subject: 'Physics',
    variables: [
      { symbol: 'P<sub>out</sub>', name: 'Useful power output', unit: 'W' },
      { symbol: 'P<sub>in</sub>', name: 'Total power input', unit: 'W' },
    ],
  },
  {
    name: 'Charge Flow (P2)',
    equation: 'Charge flow = current × time',
    equationHtml: 'Q = I × t',
    subject: 'Physics',
    variables: [
      { symbol: 'Q', name: 'Charge flow', unit: 'C' },
      { symbol: 'I', name: 'Current', unit: 'A' },
      { symbol: 't', name: 'Time', unit: 's' },
    ],
  },
  {
    name: 'Potential Difference (P2)',
    equation: 'Potential difference = current × resistance',
    equationHtml: 'V = I × R',
    subject: 'Physics',
    variables: [
      { symbol: 'V', name: 'Potential difference', unit: 'V' },
      { symbol: 'I', name: 'Current', unit: 'A' },
      { symbol: 'R', name: 'Resistance', unit: 'Ω' },
    ],
  },
  {
    name: 'Power (Electrical) (P2)',
    equation: 'Power = potential difference × current',
    equationHtml: 'P = V × I',
    subject: 'Physics',
    variables: [
      { symbol: 'P', name: 'Power', unit: 'W' },
      { symbol: 'V', name: 'Potential difference', unit: 'V' },
      { symbol: 'I', name: 'Current', unit: 'A' },
    ],
  },
  {
    name: 'Power (Resistance) (P2)',
    equation: 'Power = (current)² × resistance',
    equationHtml: 'P = I² × R',
    subject: 'Physics',
    variables: [
      { symbol: 'P', name: 'Power', unit: 'W' },
      { symbol: 'I', name: 'Current', unit: 'A' },
      { symbol: 'R', name: 'Resistance', unit: 'Ω' },
    ],
  },
  {
    name: 'Energy Transferred (Power) (P2)',
    equation: 'Energy transferred = power × time',
    equationHtml: 'E = P × t',
    subject: 'Physics',
    variables: [
      { symbol: 'E', name: 'Energy transferred', unit: 'J' },
      { symbol: 'P', name: 'Power', unit: 'W' },
      { symbol: 't', name: 'Time', unit: 's' },
    ],
  },
  {
    name: 'Energy Transferred (Charge) (P2)',
    equation: 'Energy transferred = charge flow × potential difference',
    equationHtml: 'E = Q × V',
    subject: 'Physics',
    variables: [
      { symbol: 'E', name: 'Energy transferred', unit: 'J' },
      { symbol: 'Q', name: 'Charge flow', unit: 'C' },
      { symbol: 'V', name: 'Potential difference', unit: 'V' },
    ],
  },
  {
    name: 'Density (P3)',
    equation: 'Density = mass / volume',
    equationHtml: 'ρ = m / V',
    subject: 'Physics',
    variables: [
      { symbol: 'ρ', name: 'Density', unit: 'kg/m³' },
      { symbol: 'm', name: 'Mass', unit: 'kg' },
      { symbol: 'V', name: 'Volume', unit: 'm³' },
    ],
  },
  {
    name: 'Weight (P5)',
    equation: 'Weight = mass × gravitational field strength',
    equationHtml: 'W = m × g',
    subject: 'Physics',
    variables: [
      { symbol: 'W', name: 'Weight', unit: 'N' },
      { symbol: 'm', name: 'Mass', unit: 'kg' },
      { symbol: 'g', name: 'Gravitational field strength', unit: 'N/kg' },
    ],
  },
  {
    name: 'Force (Springs) (P5)',
    equation: 'Force = spring constant × extension',
    equationHtml: 'F = k × e',
    subject: 'Physics',
    variables: [
      { symbol: 'F', name: 'Force', unit: 'N' },
      { symbol: 'k', name: 'Spring constant', unit: 'N/m' },
      { symbol: 'e', name: 'Extension', unit: 'm' },
    ],
  },
  {
    name: 'Distance Travelled (P5)',
    equation: 'Distance = speed × time',
    equationHtml: 's = v × t',
    subject: 'Physics',
    variables: [
      { symbol: 's', name: 'Distance', unit: 'm' },
      { symbol: 'v', name: 'Speed', unit: 'm/s' },
      { symbol: 't', name: 'Time', unit: 's' },
    ],
  },
  {
    name: 'Acceleration (P5)',
    equation: 'Acceleration = change in velocity / time taken',
    equationHtml: 'a = Δv / t',
    subject: 'Physics',
    variables: [
      { symbol: 'a', name: 'Acceleration', unit: 'm/s²' },
      { symbol: 'Δv', name: 'Change in velocity', unit: 'm/s' },
      { symbol: 't', name: 'Time taken', unit: 's' },
    ],
  },
  {
    name: 'Resultant Force (P5)',
    equation: 'Resultant force = mass × acceleration',
    equationHtml: 'F = m × a',
    subject: 'Physics',
    variables: [
      { symbol: 'F', name: 'Resultant force', unit: 'N' },
      { symbol: 'm', name: 'Mass', unit: 'kg' },
      { symbol: 'a', name: 'Acceleration', unit: 'm/s²' },
    ],
  },
  {
    name: 'Momentum (P5)',
    equation: 'Momentum = mass × velocity',
    equationHtml: 'p = m × v',
    subject: 'Physics',
    variables: [
      { symbol: 'p', name: 'Momentum', unit: 'kg m/s' },
      { symbol: 'm', name: 'Mass', unit: 'kg' },
      { symbol: 'v', name: 'Velocity', unit: 'm/s' },
    ],
  },
  {
    name: 'Wave Speed (P6)',
    equation: 'Wave speed = frequency × wavelength',
    equationHtml: 'v = f × λ',
    subject: 'Physics',
    variables: [
      { symbol: 'v', name: 'Wave speed', unit: 'm/s' },
      { symbol: 'f', name: 'Frequency', unit: 'Hz' },
      { symbol: 'λ', name: 'Wavelength', unit: 'm' },
    ],
  },
  // Chemistry Formulas
  {
    name: 'Moles (C3)',
    equation: 'Number of moles = mass / Mr',
    equationHtml: 'moles = mass / M<sub>r</sub>',
    subject: 'Chemistry',
    variables: [
      { symbol: 'moles', name: 'Number of moles', unit: 'mol' },
      { symbol: 'mass', name: 'Mass', unit: 'g' },
      { symbol: 'Mᵣ', name: 'Relative formula mass', unit: 'g/mol' },
    ],
  },
  {
    name: 'Concentration (g/dm³) (C3)',
    equation: 'Concentration = mass / volume',
    equationHtml: 'conc = mass / vol',
    subject: 'Chemistry',
    variables: [
      { symbol: 'conc', name: 'Concentration', unit: 'g/dm³' },
      { symbol: 'mass', name: 'Mass', unit: 'g' },
      { symbol: 'vol', name: 'Volume', unit: 'dm³' },
    ],
  },
  {
    name: 'Concentration (mol/dm³) (C3)',
    equation: 'Concentration = moles / volume',
    equationHtml: 'conc = moles / vol',
    subject: 'Chemistry',
    variables: [
      { symbol: 'conc', name: 'Concentration', unit: 'mol/dm³' },
      { symbol: 'moles', name: 'Number of moles', unit: 'mol' },
      { symbol: 'vol', name: 'Volume', unit: 'dm³' },
    ],
  },
  {
    name: 'Gas Volume (C3)',
    equation: 'Volume of gas = moles × 24',
    equationHtml: 'vol = moles × 24',
    subject: 'Chemistry',
    variables: [
      { symbol: 'vol', name: 'Volume of gas', unit: 'dm³' },
      { symbol: 'moles', name: 'Number of moles', unit: 'mol' },
    ],
  },
  {
    name: 'Percentage Yield (C3)',
    equation: 'Percentage yield = (actual mass / theoretical mass) × 100',
    equationHtml: '% Yield = (Actual / Theoretical) × 100',
    subject: 'Chemistry',
    variables: [
      { symbol: 'Actual', name: 'Actual yield', unit: 'g' },
      { symbol: 'Theoretical', name: 'Theoretical yield', unit: 'g' },
    ],
  },
  {
    name: 'Atom Economy (C3)',
    equation: 'Atom economy = (Mr of desired product / sum of Mr of all reactants) × 100',
    equationHtml: 'Atom Econ = (Mᵣ desired / Σ Mᵣ reactants) × 100',
    subject: 'Chemistry',
    variables: [
      { symbol: 'Mᵣ', name: 'Relative formula mass', unit: 'g/mol' },
      { symbol: 'Σ', name: 'Sum of', unit: 'n/a' },
    ],
  },
  {
    name: 'Energy Change (C5)',
    equation: 'Energy change = energy to break bonds - energy released making bonds',
    equationHtml: 'ΔH = Σ(bonds broken) - Σ(bonds formed)',
    subject: 'Chemistry',
    variables: [
      { symbol: 'ΔH', name: 'Energy change', unit: 'kJ/mol' },
      { symbol: 'Σ', name: 'Sum of', unit: 'n/a' },
    ],
  },
  {
    name: 'Rate of Reaction (C6)',
    equation: 'Rate = quantity of reactant or product / time',
    equationHtml: 'Rate = quantity / time',
    subject: 'Chemistry',
    variables: [
      { symbol: 'Rate', name: 'Rate of reaction', unit: 'g/s, cm³/s, etc.' },
      { symbol: 'quantity', name: 'Mass or volume', unit: 'g or cm³' },
      { symbol: 'time', name: 'Time', unit: 's' },
    ],
  },
];
