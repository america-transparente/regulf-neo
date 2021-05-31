/* eslint-disable camelcase */
/* global instantsearch */

import TypesenseInstantSearchAdapter from "typesense-instantsearch-adapter";
var nc = require('./names');

const typesenseInstantsearchAdapter = new TypesenseInstantSearchAdapter({
    server: {
        apiKey: "srBcnC2nujsubMYmIJ9fc4dCflbdImSw", // Public search-only key for staging
        nodes: [
            {
                host: "api.reguleque.cl",
                port: "443",
                protocol: "https",
            },
        ],
    },
    additionalSearchParameters: {
        queryBy: "nombre,nombre_organismo,tipo_cargo",
    },
});

const searchClient = typesenseInstantsearchAdapter.searchClient;

const search = instantsearch({
    indexName: "revenue_entry",
    searchClient,
});

// Formatter for our revenue figures
var revenueFormatter = new Intl.NumberFormat('es-CL', {
    style: 'currency',
    currency: 'CLP',

    // These options are needed to round to whole numbers if that's what you want.
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  });

// For capitalizing names
String.prototype.toNameCase = function () {
    var name = this.toString();

    if (nc.checkName(name)) {
      return nc(name, {} );
    }
  }


search.addWidgets([
    instantsearch.widgets.searchBox({
        container: "#searchbox",
        showLoadingIndicator: true,
        showSubmit: true,
        searchAsYouType: true,
        autofocus: true,
        placeholder: "Buscar funcionarios"
    }),
    instantsearch.widgets.refinementList({
        container: "#tipo-contrato",
        attribute: "tipo_contrato",
    }),
    instantsearch.widgets.refinementList({
        container: "#organismo",
        attribute: "nombre_organismo",
        searchable: true,
        searchablePlaceholder: "Buscar organismos",
        showMore: true,
        limit: 6,
        templates: {
            showMoreText: `
                {{#isShowingMore}}
                    Mostrar menos
                {{/isShowingMore}}
                {{^isShowingMore}}
                    Mostrar más
                {{/isShowingMore}}
                `,
        }
    }),
    instantsearch.widgets.refinementList({
        container: "#año",
        attribute: "año",
        showMore: true,
        limit: 6,
        templates: {
            showMoreText: `
                {{#isShowingMore}}
                    Mostrar menos
                {{/isShowingMore}}
                {{^isShowingMore}}
                    Mostrar más
                {{/isShowingMore}}
                `,
        }
    }),
    // TODO: Add month support to schena
    // instantsearch.widgets.refinementList({
    //     container: "#mes",
    //     attribute: "mes",
    //     limit: 12,
    // }),
    // TODO: Figure out int conversion
    // instantsearch.widgets.rangeSlider({
    //     container: '#año',
    //     attribute: 'año',
    //     // min: 2010,
    //     // max: 2021,
    //     // step: 1,
    //     transformItems(items) {
    //         return items.map(item => ({
    //             ...item,
    //             año: parseInt(item.año)
    //         }));
    //     }
    // }),
    instantsearch.widgets.infiniteHits({
        container: "#hits",
        transformItems(items) {
            return items.map(item => ({
                ...item,
                nombre: item.nombre.toNameCase(),
                tipo_cargo: item.tipo_cargo.toNameCase(),
                remuneración_líquida_mensual: revenueFormatter.format(item.remuneración_líquida_mensual),
                tipo_contrato: item.tipo_contrato.charAt(0).toUpperCase() + item.tipo_contrato.slice(1),
            }));
        },
        cssClasses: {
            list: "query-results",
            item: "query-result-item",
        },
        templates: {
            item: /*html*/`
        <p class="hit-name">
          {{nombre}}
        </p>

        <div class="hit-contract">
          <span><b>Tipo:</b> <span title="tipo del contrato">{{tipo_contrato}}</span></span>
          <span><b>Renumeración:</b>  <span title="renumeración líquida">{{remuneración_líquida_mensual}}</span></span>
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
        `.replaceAll(/\n\s+/g, "\n"),
            showMoreText: "Mostrar más",
        },
    }),
]);

search.start();
