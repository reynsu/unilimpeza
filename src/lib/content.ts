import type { Service, ProcessStep, FaqItem, SlideContent } from './types';

export const SERVICES: ReadonlyArray<Service> = [
  {
    pt: ['Limpeza profunda', 'Desengorduramento completo de pavimentos, paredes, fornos, fritadeiras e equipamentos. Ficam como novos.'],
    en: ['Deep cleaning', 'Full degreasing of floors, walls, ovens, fryers and equipment.'],
    tags: ['Desengordurante', 'Fornos', 'Fritadeiras', 'Pavimentos'],
  },
  {
    pt: ['Exaustores industriais', 'Desmontagem, lavagem química e remontagem de campanas e condutas.'],
    en: ['Industrial hoods', 'Disassembly, chemical wash and reassembly.'],
    tags: ['Campanas', 'Condutas', 'EN 16282'],
  },
  {
    pt: ['Filtros de gordura', 'Rotação e substituição programada. Nunca fique sem um filtro limpo.'],
    en: ['Grease filters', 'Scheduled rotation and replacement.'],
    tags: ['Rotação', 'Programa'],
  },
  {
    pt: ['Câmaras frigoríficas', 'Higienização profunda, controlo de mofo e verificação de juntas.'],
    en: ['Cold rooms', 'Deep sanitisation, mould control, gasket checks.'],
    tags: ['HACCP', 'Juntas'],
  },
  {
    pt: ['Manutenção preventiva', 'Contratos mensais. Relatório fotográfico após cada visita.'],
    en: ['Preventive maintenance', 'Monthly contracts. Photo report.'],
    tags: ['Mensal', 'Relatório'],
  },
];

export const PROCESS: ReadonlyArray<ProcessStep> = [
  { pt: ['Diagnóstico', 'Visita ao local, medição, fotografias e proposta em 48h.'], en: ['Diagnostic', 'On-site visit, measurements, photos and quote in 48h.'] },
  { pt: ['Planeamento', 'Agendamos fora do horário da cozinha. Zero paragens.'], en: ['Planning', 'Scheduled outside kitchen hours.'] },
  { pt: ['Execução', 'Equipa uniformizada, produtos certificados, processo documentado.'], en: ['Execution', 'Uniformed team, certified products.'] },
  { pt: ['Relatório', 'Fotos antes/depois, recomendações e próximo agendamento.'], en: ['Report', 'Before/after photos, recommendations.'] },
];

export const CLIENTS: ReadonlyArray<string> = [
  'Casa do Mar', 'Vila Vita', 'Hotel Faro', 'O Camilo', 'Forno do Chefe',
  'Ria Formosa', 'Restaurante Sagres', 'Quinta do Lago', 'Bistrô Atlântico', 'Tasca do Algarve',
];

export const FAQ: ReadonlyArray<FaqItem> = [
  { pt: ['Quanto tempo demora uma limpeza profunda?', 'Uma cozinha padrão leva entre 4 e 8 horas. Trabalhamos durante a noite para não interromper o serviço.'], en: ['How long does a deep cleaning take?', 'A standard kitchen takes 4 to 8 hours. We work overnight.'] },
  { pt: ['Trabalham com produtos ecológicos?', 'Sim. 90% das operações usam linha biodegradável certificada.'], en: ['Do you use eco-friendly products?', 'Yes. 90% certified biodegradable.'] },
  { pt: ['Qual o raio de cobertura?', 'Todo o Algarve, desde Sagres até Vila Real de Santo António.'], en: ['What is the coverage area?', 'All of the Algarve.'] },
  { pt: ['Entregam relatórios?', 'Sim. Relatório fotográfico antes/depois e checklist enviados por email.'], en: ['Do you deliver reports?', 'Yes, emailed after each visit.'] },
  { pt: ['Fazem contratos anuais?', 'Sim, com descontos. Mensal, trimestral ou semestral.'], en: ['Do you offer annual contracts?', 'Yes, with discounts.'] },
];

export const MARQUEE_ITEMS: ReadonlyArray<string> = [
  'Algarve / PT',
  'Eficiência em movimento',
  'Cert. HACCP',
  '7 anos no Algarve',
  'Desde 2019',
  'Disponível 24/7',
  'Faro · Albufeira · Lagos',
  'Zero paragens',
];

export const HERO_SLIDES: ReadonlyArray<SlideContent> = [
  { variant: 'slide-01', photoBase: '/hero/slide-01', width: 1920, height: 1078, tint: { dot: '#e8b88a', arrow: 'rgba(232,184,138,.9)', num: '#f5e8d0' } },
  { variant: 'slide-02', photoBase: '/hero/slide-02', width: 1920, height: 1246, tint: { dot: '#ffb64a', arrow: 'rgba(255,246,214,.9)', num: '#fff6d6' } },
  { variant: 'slide-03', photoBase: '/hero/slide-03', width: 1920, height: 1200, tint: { dot: '#f9f2e6', arrow: 'rgba(249,242,230,.9)', num: '#f9f2e6' } },
  { variant: 'slide-04', photoBase: '/hero/slide-04', width: 1920, height: 1280, tint: { dot: '#6bb6e5', arrow: 'rgba(168,196,216,.9)', num: '#e8f1f8' } },
  { variant: 'slide-05', photoBase: '/hero/slide-05', width: 1920, height: 1080, tint: { dot: '#ffb64a', arrow: 'rgba(232,184,138,.9)', num: '#f5e8d0' } },
];
