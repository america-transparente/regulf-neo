/* global instantsearch */

import TypesenseInstantSearchAdapter from 'typesense-instantsearch-adapter';

const typesenseInstantsearchAdapter = new TypesenseInstantSearchAdapter({
  server: {
    apiKey: 'xd', // Be sure to use the search-only-api-key
    nodes: [
      {
        host: 'localhost',
        port: '8108',
        protocol: 'http',
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
    templates: {
      item: `
      <div class="hit-name">
        <p>{{#helpers.snippet}}{ "attribute": "nombre", "highlightedTagName": "mark" }{{/helpers.snippet}}</p>
      </div>
      <div class="hit-data">
        <div class="hit-key">"fecha_publicación":</div> {{fecha_publicación}}<br>
        <div class="hit-key">"tipo_cargo":</div> {{#helpers.snippet}}{ "attribute": "tipo_cargo", "highlightedTagName": "mark" }{{/helpers.snippet}}<br>
        <div class="hit-key">"nombre_organismo":</div> {{nombre_organismo}}<br>
        <div class="hit-key">"tipo_calificación_profesional":</div> {{tipo_calificación_profesional}}<br>
        <div class="hit-key">"tipo_contrato":</div> {{tipo_contrato}}
      </div>
      `,
      showMoreText: 'Mostrar más',
    },
  }),
]);

search.start();
