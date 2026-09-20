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
    id: 'centro-historico',
    name: 'Terminal Hidroviário',
    description: 'Ponto de embarque às margens do rio, no centro de Itacoatiara.',
    city: 'Itacoatiara-AM',
    coordinates: { x: 31, y: 48, latitude: -3.147496, longitude: -58.448921 },
    source: {
      title: 'Reconstituição baseada em arquivos fotográficos e registros urbanos',
      confidence: 'Alta',
      note: 'A reconstrução histórica combina documentos históricos com uma visão do entorno atual, e não é uma fotografia original do período.'
    },
    panoramas: {
      current: {
        year: 2026,
        label: 'Presente',
        imageUrl:
          'https://images.unsplash.com/photo-1514565131-fce0801e5785?auto=format&fit=crop&w=1800&q=80'
      },
      historical: {
        year: 1930,
        label: '1930',
        imageUrl:
          'https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?auto=format&fit=crop&w=1800&q=80'
      }
    }
  },
  {
    id: 'mercado-antigo',
    name: 'Pedra Pintada',
    description: 'Marco histórico e cultural próximo à orla central de Itacoatiara.',
    city: 'Itacoatiara-AM',
    coordinates: { x: 69, y: 59, latitude: -3.147898, longitude: -58.446113 },
    source: {
      title: 'Reconstituição a partir de imagens de arquivo e mapa da cidade',
      confidence: 'Média',
      note: 'A área central foi parcialmente restaurada para completar lacunas visuais e manter coerência espacial.'
    },
    panoramas: {
      current: {
        year: 2026,
        label: 'Presente',
        imageUrl:
          'https://images.unsplash.com/photo-1494526585095-c41746248156?auto=format&fit=crop&w=1800&q=80'
      },
      historical: {
        year: 1930,
        label: '1930',
        imageUrl:
          'https://images.unsplash.com/photo-1523908511403-7fc7b25592f4?auto=format&fit=crop&w=1800&q=80'
      }
    }
  }
];
