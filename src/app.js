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
    transformItems(items) {
      return items.map(function (item) {
        return {
          ...item,
          fecha_ingreso: item.fecha_ingreso.replaceAll("/", "-"),
          fecha_término: item.fecha_término.replaceAll("/", "-"),
        }
      })
    },
    cssClasses: {
      list: "query-results",
      item: "query-result-item"
    },
    templates: {
      item: `
        <p class="hit-name">
          {{#helpers.snippet}}{ "attribute": "nombre", "highlightedTagName": "mark" }{{/helpers.snippet}}
        </p>

        <div class="hit-time-range">
          Desde <time datetime="{{hit.fecha_ingreso}}" title="fecha ingreso">{{fecha_ingreso}}</time>
          {{#fecha_término}}
            hasta <time datetime="{{fecha_término}}" title="fecha término">{{fecha_término}}</time>
          {{/fecha_término}}
        </div>

        <div class="hit-data">
          <details>
            <div class="hit-key">"fecha_publicación":</div> {{fecha_publicación}}<br>
            <div class="hit-key">"tipo_cargo":</div> {{#helpers.snippet}}{ "attribute": "tipo_cargo", "highlightedTagName": "mark" }{{/helpers.snippet}}<br>
            <div class="hit-key">"nombre_organismo":</div> {{nombre_organismo}}<br>
            <div class="hit-key">"tipo_calificación_profesional":</div> {{tipo_calificación_profesional}}<br>
            <div class="hit-key">"tipo_contrato":</div> {{tipo_contrato}}
          </details>
        </div>
        <button class="hot-show-more">Más información</button>
        `.replaceAll(/\n\s+/g, '\n'),
      showMoreText: 'Mostrar más',
    },
  }),
]);

search.start();
