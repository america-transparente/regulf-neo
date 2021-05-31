/* global instantsearch */

import TypesenseInstantSearchAdapter from 'typesense-instantsearch-adapter';

const typesenseInstantsearchAdapter = new TypesenseInstantSearchAdapter({
  server: {
    apiKey: 'srBcnC2nujsubMYmIJ9fc4dCflbdImSw', // Public search-only key for staging
    nodes: [
      {
        host: 'api.reguleque.cl',
        port: '443',
        protocol: 'https',
      },
    ],
  },
  additionalSearchParameters: {
    queryBy: 'nombre,nombre_organismo,tipo_cargo',
  },
});

const searchClient = typesenseInstantsearchAdapter.searchClient;

const search = instantsearch({
  indexName: 'revenue_entry',
  searchClient,
});

search.addWidgets([
  instantsearch.widgets.searchBox({
    container: '#searchbox',
    showLoadingIndicator: true,
    showSubmit: true,
  }),
  instantsearch.widgets.infiniteHits({
    container: '#hits',
    transformItems(items) {
      return items.map(item => ({
        ...item,
        fecha_ingreso: item.fecha_ingreso.replaceAll('/', '-'),
        fecha_término: item.fecha_término.replaceAll('/', '-'),
      }));
    },
    cssClasses: {
      list: 'query-results',
      item: 'query-result-item',
    },
    templates: {
      item: `
        <p class="hit-name">
          {{#helpers.snippet}}{ "attribute": "nombre", "highlightedTagName": "mark" }{{/helpers.snippet}}
        </p>

        <div class="hit-contract">
          <span>Tipo: <span title="tipo del contrato">{{tipo_contrato}}</span></span>
          <span>Renumeración:  <span title="renumeración líquida">{{remuneración_líquida_mensual}}</span></span>
        </div>

        <div class="hit-info">
          Trabajando como
          <span class="hit-body-key" title="tipo cargo">{{tipo_cargo}}</span>
          en
          <span class="hit-body-key" title="nombre organismo">{{nombre_organismo}}</span>
          desde
          <time class="hit-body-key" datetime="{{hit.fecha_ingreso}}" title="fecha ingreso">{{fecha_ingreso}}</time>
          {{#fecha_término}}
            hasta <time class="hit-body-key" datetime="{{fecha_término}}" title="fecha término">{{fecha_término}}</time>
          {{/fecha_término}}
        </div>

        <div class="hit-button-container">
          <button class="hit-show-more">Más información</button>
        </div>
        `.replaceAll(/\n\s+/g, '\n'),
      showMoreText: 'Mostrar más',
    },
  }),
]);

search.start();
