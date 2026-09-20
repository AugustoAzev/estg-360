**SPEC — Sistema de Visualização Histórica 360°**

*Especificação técnica para MVP e evolução futura*

Versão: 1.0

Objetivo: criar uma aplicação interativa capaz de apresentar locais atuais da cidade em 360° e permitir uma “viagem no tempo” para uma representação histórica do mesmo local, inicialmente utilizando imagens históricas já pré-processadas para gerar a sala de visualização 360° imersiva com realidade virtual.

# **1\. Visão geral**

O sistema será uma aplicação web de visualização temporal de locais históricos. O usuário poderá selecionar um local por uma lista ou diretamente pelo mapa estático da cidade apresentado com os pontos pré-disponibilizados, escolher o local e o sistema deve carregar a “sala” com o panorama 360° atual e, opcionalmente, iniciar uma transição temporal para visualizar uma reconstrução panorâmica histórica, carregando na mesma sala a outra imagem 360° do passado com uma transição durante a troca..

# **2\. Escopo do MVP**

* Tela principal do site listagem dos pontos da cidade à esquerda, na direita fica o mapa da cidade.  
* Dois locais históricos inicialmente.  
* Mapa e lista sincronizados: selecionar um item destaca o marcador correspondente e clicar no marcador seleciona o item da lista.  
* Visualização 360° do estado atual do local quando selecionado.  
* Botão “Voltar no tempo — 1930”.  
* Transição visual de viagem no tempo.  
* Visualização panorâmica histórica de 1930\.  
* Preservação aproximada da orientação da câmera durante a troca de período.  
* Estrutura de dados preparada para adicionar novos locais e outros períodos históricos.  
* Arquitetura preparada para futura integração com VR/WebXR.

# **3\. Fora do escopo inicial**

* Modelagem 3D dos locais.  
* Reconstrução tridimensional de edifícios.  
* Interação física com objetos históricos.  
* Sistema completo de realidade virtual.  
* Geração automática e totalmente confiável de panoramas históricos.  
* Reconstrução histórica sem validação humana.

# **4\. Experiência do usuário**

Fluxo principal:

1. Usuário abre o sistema.  
2. Visualiza o mapa estático da cidade e a lista de locais disponíveis.  
3. Seleciona um local na lista ou diretamente no mapa.  
4. O sistema abre o panorama 360° atual.  
5. Usuário explora o ambiente.  
6. Usuário seleciona “Voltar no tempo — 1930”.  
7. O sistema executa uma animação de transição.  
8. O panorama histórico é carregado.  
9. O usuário explora a representação histórica.  
10. O usuário pode retornar ao presente ou voltar ao menu.

# **5\. Interface inicial**

Layout recomendado:

• Painel lateral: lista de locais históricos.

• Área principal: listagem \+ mapa da cidade.

• Marcadores no mapa: locais disponíveis.

• Estado selecionado: marcador destacado e item da lista destacado.

• A seleção de um local deve levar à tela de visualização 360°.

# **6\. Visualizador 360°**

* Utilizar panoramas no formato equiretangular.  
* Proporção recomendada: 2:1.  
* Resolução inicial sugerida: 4096 × 2048; permitir evolução para 8192 × 4096\.  
* Suportar rotação horizontal e vertical.  
* Suportar zoom/FOV.  
* Suportar mouse no desktop e touch no celular.  
* Preparar suporte futuro a orientação por giroscópio.  
* Manter yaw, pitch e FOV ao alternar entre presente e passado quando possível.

# **7\. Tecnologia recomendada**

| Componente | Tecnologia | Motivo |
| :---- | :---- | :---- |
| Linguagem | TypeScript | Tipagem, manutenção e escalabilidade. |
| Front-end | React | Componentização e ecossistema maduro. |
| Build | Vite | Desenvolvimento rápido e build moderno. |
| Visualização 360° | Three.js | Controle sobre câmera, panoramas, animações e futura integração WebXR. |
| Mapa | MapLibre GL JS | Mapa WebGL interativo, marcadores e eventos. |
| Estado | Zustand | Gerenciamento simples do estado da aplicação. |
| Backend | Node.js \+ NestJS | API organizada e escalável. |
| API | REST | Integração simples entre front-end e backend (mesmo projeto) |
| Banco | PostgreSQL | Supabase projects |
| Servidor | Vercel | Facilidade de uso |
| Arquivos | Object Storage | Armazenamento de panoramas e imagens históricas. |
| Formato web | WebP | Boa relação entre qualidade e tamanho. |
| VR futuro | WebXR | Evolução natural do visualizador web. |

# **8\. Arquitetura**

Arquitetura lógica: React/TypeScript → componentes de mapa e visualização → API REST → PostgreSQL \+ Object Storage. O pipeline de IA deve ser separado da aplicação de visualização.

O sistema de visualização deve receber apenas os panoramas finais e seus metadados. A forma como o panorama histórico foi produzido não deve ser responsabilidade do front-end.

# **9\. Modelo de dados**

Tabela/entidade: locations

* id  
* name  
* description  
* latitude  
* longitude  
* thumbnail  
* created\_at  
* updated\_at

Tabela/entidade: panoramas

* id  
* location\_id  
* year  
* type (current/historical)  
* image\_url  
* status  
* confidence  
* created\_at

Tabela/entidade: historical\_sources

* id  
* location\_id  
* year  
* source\_type  
* source\_url ou referência  
* description  
* license

# **10\. Estrutura de arquivos sugerida**

storage/  
├── panoramas/  
│   ├── local-01/2026.webp  
│   ├── local-01/1930.webp  
│   └── local-02/...  
├── historical/  
│   └── local-01/source-01.jpg  
└── thumbnails/

# **11\. Pipeline de imagens históricas**

O pipeline de IA será uma ferramenta independente de geração de conteúdo.

11. Coletar fotografias e documentos históricos do local.  
12. Catalogar as fontes e registrar procedência/licença.  
13. Restaurar imagens quando necessário.  
14. Analisar elementos arquitetônicos e espaciais.  
15. Reconstruir áreas ausentes com IA quando necessário.  
16. Compor uma representação panorâmica coerente.  
17. Converter para panorama equiretangular 2:1.  
18. Realizar inspeção e validação humana.  
19. Publicar o panorama final no armazenamento.

# **12\. Confiabilidade histórica**

Cada panorama histórico deve possuir uma indicação de confiabilidade.

* Alta: área baseada diretamente em fotografias/documentos.  
* Média: área parcialmente reconstruída.  
* Baixa: área predominantemente estimada ou reconstruída por IA.

O sistema deve informar claramente quando uma representação for uma reconstrução digital e não uma fotografia histórica real.

# **13\. Transição temporal**

Componente sugerido: TimeTravelTransition.

Estados: CURRENT → TRANSITION → HISTORICAL.

* Fade/escurecimento do panorama.  
* Partículas ou estrelas.  
* Efeito de túnel/portal.  
* Indicação visual do ano de destino: “1930”.  
* Carregamento do panorama histórico.  
* Fade para o panorama histórico.  
* Restauração dos controles da câmera.

# **14\. API inicial**

Endpoints sugeridos:

* GET /api/locations  
* GET /api/locations/:id  
* GET /api/locations/:id/panoramas  
* GET /api/locations/:id/history  
* GET /api/locations/:id/sources

# **15\. Requisitos funcionais**

RF01 — O sistema deve listar os locais disponíveis.

RF02 — O sistema deve exibir os locais em um mapa.

RF03 — O sistema deve sincronizar seleção entre mapa e lista.

RF04 — O sistema deve carregar o panorama atual do local selecionado.

RF05 — O sistema deve permitir explorar o panorama em 360°.

RF06 — O sistema deve oferecer a opção de voltar para 1930 quando houver conteúdo histórico disponível.

RF07 — O sistema deve executar uma transição temporal.

RF08 — O sistema deve carregar o panorama histórico.

RF09 — O sistema deve preservar a orientação da câmera entre os períodos quando possível.

RF10 — O sistema deve apresentar informações sobre a origem/confiabilidade da reconstrução histórica.

# **16\. Requisitos não funcionais**

* Interface responsiva para desktop e dispositivos móveis.  
* Carregamento progressivo de imagens.  
* Panoramas não devem ser carregados antes de serem necessários.  
* Imagens devem ser otimizadas para web.  
* A API deve permitir expansão para dezenas ou centenas de locais.  
* O conteúdo histórico deve possuir metadados de fonte e procedência.  
* A aplicação deve separar dados/conteúdo da lógica de apresentação.  
* A arquitetura deve permitir futura integração com WebXR.

# **17\. Roadmap**

MVP 1

* Menu  
* Mapa  
* Lista  
* Dois locais  
* Panorama atual  
* Panorama histórico  
* Transição básica

MVP 2

* Transição avançada  
* Preservação da orientação  
* Informações históricas  
* Fontes  
* Múltiplos períodos

MVP 3

* Pipeline de IA  
* Restauração  
* Reconstrução de áreas ausentes  
* Classificação de confiabilidade

MVP 4

* WebXR  
* VR  
* Giroscópio  
* Controles de headset  
* Experiência imersiva

# **18\. Critérios de aceite do MVP**

* O usuário consegue abrir o sistema e identificar os locais no mapa.  
* Clicar em um marcador seleciona o local correspondente.  
* Clicar em um item da lista destaca o marcador correspondente.  
* O panorama atual abre corretamente.  
* O usuário consegue olhar 360°.  
* O botão de viagem no tempo aparece somente quando existe panorama histórico.  
* A transição é executada sem interromper a aplicação.  
* O panorama histórico abre na orientação aproximada do panorama atual.  
* O usuário consegue retornar ao presente.  
* O sistema informa que o panorama histórico é uma reconstrução quando houver conteúdo gerado/reconstruído por IA.

# **19\. Decisões técnicas importantes**

* Não implementar 3D no MVP.  
* Não acoplar a geração por IA ao visualizador.  
* Tratar o panorama histórico como um artefato de conteúdo validado.  
* Usar Three.js para manter flexibilidade para animações e WebXR.  
* Usar MapLibre para permitir interação espacial no menu.  
* Estruturar o banco para múltiplos anos, mesmo que o MVP tenha apenas 1930 e 2026\.  
* Registrar fontes históricas e nível de confiabilidade.

# **20\. Resultado esperado**

Ao final do MVP, o usuário deverá conseguir abrir o mapa da cidade, selecionar um local, explorar sua representação atual em 360°, iniciar uma experiência de viagem no tempo e explorar uma reconstrução panorâmica histórica do mesmo local. A arquitetura deverá permitir a adição de novos locais, períodos históricos, fontes, panoramas e posteriormente suporte VR/WebXR.

# **21\. Estado implementado**

## Aplicação entregue

* Aplicação React + TypeScript executada com Vite.
* Interface em tema escuro único.
* Favicon próprio e título da aplicação configurados no navegador.
* Layout responsivo para desktop e dispositivos móveis.

## Mapa e locais

* O mapa atual é um recorte estático contextualizado de Itacoatiara, Amazonas.
* O recorte apresenta rio, vias, orientação norte, escala e identificação da cidade.
* Os pontos reais cadastrados são:
	* Terminal Hidroviário — latitude `-3.147496`, longitude `-58.448921`.
	* Pedra Pintada — latitude `-3.147898`, longitude `-58.446113`.
* A seleção pela lista e pelos marcadores permanece sincronizada.
* Os dados dos locais estão separados da lógica de apresentação em `src/data/locations.ts`.

## Visualização 360°

* Viewer implementado com Three.js usando esfera invertida e textura panorâmica.
* Navegação por arraste com mouse ou toque.
* Zoom por roda do mouse.
* Botão de reset da orientação e do campo de visão.
* Troca entre panorama atual e histórico com transição visual.
* Estados de carregamento e erro para as texturas.

## Movimento e realidade virtual

* Controle opcional por orientação do dispositivo com `DeviceOrientationEvent`.
* O usuário ativa o recurso pelo botão “Usar movimento do celular”.
* A aplicação solicita permissão aos sensores quando o dispositivo exige essa confirmação.
* O modo de movimento pode ser desativado para retornar ao controle por toque.
* Integração WebXR por meio do botão “Enter VR” do Three.js.
* A entrada VR depende de navegador compatível, headset conectado, runtime OpenXR e contexto seguro ou `localhost`.

## Tutorial de uso

* Seção visual própria com figuras representativas para:
	* Celular Android ou iPhone: ativação dos sensores e movimento do aparelho.
	* Computador: arraste, zoom e reset da visão.
	* Headset VR: requisitos e entrada pelo botão “Enter VR”.

## Conteúdo e limitações conhecidas

* Os panoramas atuais e históricos usados no MVP são assets remotos de demonstração e devem ser substituídos pelos panoramas reais de Itacoatiara antes da publicação.
* O mapa é estático; MapLibre, API, banco de dados e armazenamento próprio continuam previstos para uma próxima etapa.
* O suporte VR está implementado no front-end, mas não pode ser validado em um PC sem headset WebXR.
* A geração e validação de reconstruções históricas continuam fora da aplicação de visualização.

## Validação atual

* `npm run build` executado com sucesso.
* Bundle de produção gerado pelo Vite.