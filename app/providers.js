'use client';

import { CityProvider } from '../context/CityContext';
import { WhatsAppProvider } from '../context/WhatsAppContext';

export default function Providers({ children }) {
  return (
    <WhatsAppProvider>
      <CityProvider>
        {children}
      </CityProvider>
    </WhatsAppProvider>
  );
}
