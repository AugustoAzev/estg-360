export type Period = 'current' | 'historical';

export type PanoramaItem = {
  year: number;
  imageUrl: string;
  label: string;
};

export type LocationItem = {
  id: string;
  name: string;
  description: string;
  coordinates: { x: number; y: number; latitude: number; longitude: number };
  city: string;
  source: {
    title: string;
    confidence: 'Alta' | 'Média' | 'Baixa';
    note: string;
  };
  panoramas: Record<Period, PanoramaItem>;
};

export const locations: LocationItem[] = [
  {
    id: 'praca-da-matriz',
    name: 'Praça da Matriz',
    description: 'Praça histórica no centro de Itacoatiara, em frente à igreja matriz.',
    city: 'Itacoatiara-AM',
    coordinates: { x: 31, y: 48, latitude: -3.147496, longitude: -58.448921 },
    source: {
      title: 'Fotografia histórica da Praça da Matriz na década de 1970',
      confidence: 'Alta',
      note: 'Imagem histórica processada a partir do arquivo fotográfico original.'
    },
    panoramas: {
      current: {
        year: 2026,
        label: 'Presente',
        imageUrl: '/historical/praca-matriz-2026.png'
      },
      historical: {
        year: 1970,
        label: 'Década de 1970',
        imageUrl: '/historical/praca-matriz-anos-70.png'
      }
    }
  },
  {
    id: 'praca-do-relogio',
    name: 'Praça do Relógio',
    description: 'Praça histórica e ponto de referência no centro de Itacoatiara.',
    city: 'Itacoatiara-AM',
    coordinates: { x: 69, y: 59, latitude: -3.147898, longitude: -58.446113 },
    source: {
      title: 'Fotografia histórica da Praça do Relógio na década de 1970',
      confidence: 'Alta',
      note: 'Imagem histórica processada a partir do arquivo fotográfico original.'
    },
    panoramas: {
      current: {
        year: 2026,
        label: 'Presente',
        imageUrl:
          'https://images.unsplash.com/photo-1494526585095-c41746248156?auto=format&fit=crop&w=1800&q=80'
      },
      historical: {
        year: 1970,
        label: 'Década de 1970',
        imageUrl: '/historical/praca-do-relogio-anos-70.png'
      }
    }
  }
];
