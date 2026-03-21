'use client';

import { createContext, useContext } from 'react';

const COVERED_CITIES = [
  'Belo Horizonte',
  'Contagem',
  'Betim',
  'Ribeirão das Neves',
  'Santa Luzia',
  'Ibirité',
  'Sabará',
  'Nova Lima',
  'Vespasiano',
  'Lagoa Santa',
];

const CityContext = createContext({
  cities: COVERED_CITIES,
  isCovered: () => false,
});

export function CityProvider({ children }) {
  const isCovered = (city) => {
    if (!city) return false;
    const normalized = city.trim().toLowerCase();
    return COVERED_CITIES.some((c) => c.toLowerCase() === normalized);
  };

  return (
    <CityContext.Provider value={{ cities: COVERED_CITIES, isCovered }}>
      {children}
    </CityContext.Provider>
  );
}

export function useCityContext() {
  return useContext(CityContext);
}
