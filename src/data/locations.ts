export type Period = 'current' | 'historical';

export type PanoramaItem = {
  year: number | null;
  imageUrl: string;
  label: string;
  attribution?: {
    label: string;
    url: string;
  };
  aiDisclosure?: string;
};

export type LocationItem = {
  id: string;
  name: string;
  description: string;
  coordinates: { latitude: number; longitude: number };
  city: string;
  source: {
    title: string;
    confidence: 'Alta' | 'Média' | 'Baixa';
    note: string;
  };
  panoramas: Record<Period, PanoramaItem>;
};

const historicalImageAttribution = {
  label: 'Craviano Fotografia (Facebook)',
  url: 'https://www.facebook.com/profile.php?id=100079856954732'
};

const historicalImageAiDisclosure =
  'Imagem histórica ampliada por outpainting e aprimorada com IA.';

export const locations: LocationItem[] = [
  {
    id: 'praca-da-matriz',
    name: 'Praça da Matriz',
    description: 'Praça histórica no centro de Itacoatiara, em frente à igreja matriz.',
    city: 'Itacoatiara-AM',
    coordinates: { latitude: -3.147312, longitude: -58.446137 },
    source: {
      title: 'Fotografia histórica da Praça da Matriz na década de 1970',
      confidence: 'Alta',
      note: 'Imagem histórica processada a partir do arquivo fotográfico original.'
    },
    panoramas: {
      current: {
        year: 2026,
        label: 'Presente',
        imageUrl: '/historical/igreja-360-2026.jpg'
      },
      historical: {
        year: 1970,
        label: 'Década de 1970',
        imageUrl: '/historical/praca-matriz-anos-70.png',
        attribution: historicalImageAttribution,
        aiDisclosure: historicalImageAiDisclosure
      }
    }
  },
  {
    id: 'mercado-municipal',
    name: 'Mercado Municipal',
    description: 'Mercado e seu entorno no centro de Itacoatiara.',
    city: 'Itacoatiara-AM',
    coordinates: { latitude: -3.146849, longitude: -58.449512 },
    source: {
      title: 'Imagem histórica do Mercado Municipal',
      confidence: 'Média',
      note: 'Panorama histórico do Mercado Municipal e de seu entorno.'
    },
    panoramas: {
      current: {
        year: 2026,
        label: 'Presente',
        imageUrl: '/historical/mercado-360-2026.jpg'
      },
      historical: {
        year: null,
        label: 'Antiga',
        imageUrl: '/historical/mercado-antigo.jpg',
        attribution: historicalImageAttribution,
        aiDisclosure: historicalImageAiDisclosure
      }
    }
  },
  {
    id: 'centro',
    name: 'Centro da Cidade',
    description: 'Área central de Itacoatiara.',
    city: 'Itacoatiara-AM',
    coordinates: { latitude: -3.148003, longitude: -58.446431 },
    source: {
      title: 'Imagem histórica do Centro da Cidade',
      confidence: 'Média',
      note: 'Panorama histórico da área central de Itacoatiara.'
    },
    panoramas: {
      current: {
        year: 2026,
        label: 'Presente',
        imageUrl: '/historical/centro-360-2026.jpg'
      },
      historical: {
        year: null,
        label: 'Antiga',
        imageUrl: '/historical/centro-antigo.jpeg',
        attribution: historicalImageAttribution,
        aiDisclosure: historicalImageAiDisclosure
      }
    }
  }
];
