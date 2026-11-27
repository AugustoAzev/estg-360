# 360ESTG — Viagem no tempo

Aplicação web para explorar panoramas atuais e históricos de locais de Itacoatiara, Amazonas. O usuário seleciona um ponto no mapa ou na lista, navega pela imagem panorâmica em 360° e alterna entre o presente e uma imagem histórica.

## Finalidade e envolvidos

Este trabalho tem como finalidade desenvolver uma aplicação web interativa que permita conhecer e explorar locais de Itacoatiara-AM por meio de panoramas em 360°, aproximando o público da história e da memória da cidade ao possibilitar a visualização de imagens atuais e históricas.

- Bruno Augusto Azevedo Souza — estagiário
- Luciele Inhape Menezes — estagiária

## Funcionalidades

- Mapa de Itacoatiara com marcadores sincronizados à lista de locais.
- Visualizador panorâmico 360° implementado com Three.js.
- Alternância entre imagens atuais de 2026 e imagens históricas, com transição visual.
- Controles para mouse e toque, ajuste de zoom e reset da visão.
- Opção de orientação por sensores de movimento em celulares compatíveis.
- Integração WebXR para headsets e navegadores compatíveis.
- Informações de confiabilidade e procedência das imagens históricas.

## Locais disponíveis

- Praça da Matriz — panorama atual de 2026 e imagem histórica da década de 1970.
- Mercado Municipal — panorama atual de 2026 e imagem antiga.
- Centro da Cidade — panorama atual de 2026 e imagem antiga.

As imagens históricas são creditadas a [Craviano Fotografia no Facebook](https://www.facebook.com/profile.php?id=100079856954732). Elas foram ampliadas por outpainting e tiveram a qualidade aprimorada com inteligência artificial. Essa intervenção também é informada no painel de procedência da aplicação.

## Requisitos

- Node.js e npm.
- Navegador moderno com suporte a WebGL.
- Para realidade virtual, navegador compatível com WebXR, headset e runtime configurados. O acesso aos sensores de movimento também depende do suporte e das permissões do dispositivo.

## Executar localmente

Instale as dependências:

```bash
npm install
```

Inicie o servidor de desenvolvimento:

```bash
npm run dev
```

O Vite informará o endereço local da aplicação no terminal.

Para validar e gerar a versão de produção:

```bash
npm run build
```

Para servir a versão gerada localmente:

```bash
npm run preview
```

## Como usar

1. Selecione um local pela lista ou por um marcador no mapa.
2. Arraste o panorama com o mouse ou toque e arraste na tela para olhar ao redor.
3. Use a roda do mouse para aproximar ou afastar a visão. Selecione **Resetar visão** para restaurá-la.
4. Use **Voltar no tempo** ou **Ver imagem antiga** para abrir a imagem histórica; selecione **Retornar ao presente** para voltar à imagem atual.
5. Em um celular compatível, selecione **Usar movimento do celular** e conceda a permissão solicitada.
6. Para VR, conecte um headset compatível e use o botão **Enter VR** quando disponível.

## Estrutura do projeto

```text
src/
  App.tsx                 Interface, seleção de locais e visualizador 360°
  CityMap.tsx             Mapa e marcadores
  data/locations.ts       Locais, panoramas e metadados de procedência
  index.css               Estilos da aplicação
public/
  historical/             Imagens panorâmicas atuais e históricas
```

Os dados dos locais são mantidos em `src/data/locations.ts`; as imagens locais ficam em `public/historical/`. O mapa usa tiles do OpenStreetMap e requer conexão à internet para carregá-los.

## Tecnologias

- React e TypeScript
- Vite
- Three.js e WebXR
- React Leaflet, Leaflet e OpenStreetMap
