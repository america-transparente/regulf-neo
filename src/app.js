/* eslint-disable camelcase */
/* global instantsearch */

import TypesenseInstantSearchAdapter from "typesense-instantsearch-adapter";
var nc = require('./names');

const typesenseInstantsearchAdapter = new TypesenseInstantSearchAdapter({
    server: {
        apiKey: "mSg5dDQbicCyiwDaBRCw0FHjOfDyX8gB", // Public search-only key for staging
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
    numberLocale: 'es',
});

// Formatter for our revenue figures
var revenueFormatter = new Intl.NumberFormat('es-CL', {
    style: 'currency',
    currency: 'CLP',

    // Whole numbers
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
});

function formatRevenue(number) {
    if (Number.isInteger(number)) {
        return revenueFormatter.format(number);
    } else if (number == "NaN" || number == "") {
        return undefined
    } else if (!isNaN(number)){
        return revenueFormatter.format(parseInt(number));
    } else {
        return number;
    }
}

// For cleaning names and strings with all uppercase
String.prototype.toNameCase = function () {
    var name = this.toString();

    if (nc.checkName(name)) {
        return nc(name, {});
    } else {
        return name
    }
}

// Tidy items
function tidyItems(items) {
    console.debug(items)
    return items.map(item => ({
        ...item,
        nombre: item.nombre.toNameCase(),
        tipo_cargo: item.tipo_cargo?.toNameCase(),
        tipo_calificación_profesional: item.tipo_calificación_profesional?.toNameCase(),
        tipo_cargo: item.tipo_cargo?.toNameCase(),
        remuneración_líquida_mensual: formatRevenue(item.remuneración_líquida_mensual),
        remuneración_bruta_mensual: formatRevenue(item.remuneración_bruta_mensual),
        tipo_contrato: item.tipo_contrato?.charAt(0).toUpperCase() + item.tipo_contrato?.slice(1),
        tipo_estamento: item.tipo_estamento?.charAt(0).toUpperCase() + item.tipo_estamento?.slice(1),
        unidad_monetaria: item.unidad_monetaria?.toLowerCase(),
        viáticos: formatRevenue(item.viáticos ?? "Indeterminado"),
        fecha_egreso: item.fecha_egreso ?? "Sigue trabajando",
    }))
};


search.addWidgets([
    instantsearch.widgets.sortBy({
        container: '#sort-by',
        items: [
            { label: 'Por relevancia', value: 'revenue_entry' },
            { label: 'Sueldo (asc)', value: 'revenue_entry/sort/remuneración_líquida_mensual:asc' },
            { label: 'Sueldo (desc)', value: 'revenue_entry/sort/remuneración_líquida_mensual:desc' },
            { label: 'Grado EUS (asc)', value: 'revenue_entry/sort/grado_eus:asc' },
            { label: 'Grado EUS (desc)', value: 'revenue_entry/sort/grado_eus:desc' },
        ],
    }),
    instantsearch.widgets.hitsPerPage({
        container: "#hits-per-page",
        items: [
            { label: "12 por pág.", value: 12, default: true },
            { label: "30 por pág.", value: 30 },
            { label: "60 por pág.", value: 60 },
            { label: "120 por pág.", value: 120 }
        ]
    }),
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
    instantsearch.widgets.refinementList({
        container: "#mes",
        attribute: "mes",
        limit: 12,
    }),
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
    instantsearch.widgets.rangeSlider({
        container: '#grado-eus',
        attribute: 'grado_eus',
        // min: 2010,
        // max: 2021,
        // step: 1,
    }),
    instantsearch.widgets.hits({
        container: "#hits",
        transformItems: tidyItems,
        cssClasses: {
            list: "query-results",
            item: "query-result-item",
        },
        templates: {
            item: /*html*/`
                <p class="hit-name">
                <b>{{nombre}}</b> <span class="hit-fecha">({{mes}} {{año}})</span>
                </p>

                <div class="hit-contract">
                <p>
                <b>Organismo:</b> {{nombre_organismo}}</br>
                <b>Cargo:</b> {{tipo_cargo}}</br>
                <b>Tipo:</b> <span title="tipo del contrato">{{tipo_contrato}}</span></br>
                <b>Renumeración Líquida:</b>  <span title="renumeración líquida">{{remuneración_líquida_mensual}}</span></p>
                </div>

                <!-- <div class="hit-info">
                Trabajando como
                <span class="hit-body-key" title="tipo cargo">{{tipo_cargo}}</span>
                en
                <span class="hit-body-key" title="nombre organismo">{{nombre_organismo}}</span>
                -->
                <div>
                Desde el
                <time class="hit-body-key" datetime="{{hit.fecha_ingreso}}" title="fecha ingreso">{{fecha_ingreso}}</time>
                {{#fecha_término}}
                    hasta el <time class="hit-body-key" datetime="{{fecha_término}}" title="fecha término">{{fecha_término}}</time>
                {{/fecha_término}}
                </div>

                <div class="hit-button-container">
                <button class="hit-show-more" data-bs-toggle="modal" data-bs-target="#hit-{{__position}}">Más información</button>
                </div>

                <!-- Modal for the complete profile -->
                <div class="modal fade" id="hit-{{__position}}" aria-hidden="true">
                    <div class="modal-dialog modal-dialog-centered modal-dialog-scrollable">
                        <div class="modal-content">
                            <div class="modal-header">
                                <h5 class="modal-title">{{nombre}} </br> ({{mes}} {{año}})</h5>
                                <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Cerrar"></button>
                            </div>
                            <div class="modal-body">
                                <table class="table">
                                <tbody>
                                    <tr>
                                    <th scope="row">Organismo</th>
                                    <td>{{nombre_organismo}}</td>
                                    </tr>
                                    <tr>
                                    <th scope="row">Región</th>
                                    <td>{{región}}</td>
                                    </tr>
                                    <tr>
                                    <th scope="row">Cargo</th>
                                    <td>{{tipo_cargo}}</td>
                                    </tr>
                                    <tr>
                                    <th scope="row">Calificación Profesional</th>
                                    <td>{{tipo_calificación_profesional}}</td>
                                    </tr>
                                    <tr>
                                    <th scope="row">Tipo contrato</th>
                                    <td>{{tipo_contrato}}</td>
                                    </tr>
                                    <tr>
                                    <th scope="row">Ingreso</th>
                                    <td>{{fecha_ingreso}}</td>
                                    </tr>
                                    <tr>
                                    <th scope="row">Egreso</th>
                                    <td>{{fecha_egreso}}</td>
                                    </tr>
                                    <th scope="row">Grado EUS</th>
                                    <td>{{grado_eus}}</td>
                                    </tr>
                                    <tr>
                                    <th scope="row">Remuneración Liq.</th>
                                    <td>{{remuneración_líquida_mensual}} {{unidad_monetaria}}</td>
                                    </tr>
                                    <tr>
                                    <th scope="row">Remuneración Bruta</th>
                                    <td>{{remuneración_bruta_mensual}} {{unidad_monetaria}}</td>
                                    </tr>
                                    <tr>
                                    <th scope="row">Viáticos</th>
                                    <td>{{viáticos}} {{unidad_monetaria}}</td>
                                    </tr>
                                    <tr>
                                    <th scope="row">Asignaciones</th>
                                    <td>{{asignaciones}}</td>
                                    </tr>
                                    <tr>
                                    <th scope="row">Horas</th>
                                    <td>Diurnas: {{horas_diurnas}}, Nocturnas: {{horas_nocturnas}}, Festivas {{horas_festivas}}</td>
                                    </tr>
                                    <tr>
                                    <th scope="row">Observaciones</th>
                                    <td>{{observaciones}}</td>
                                    </tr>
                                </tbody>
                                </table>
                                <p class="hit-modal-date"><i>Datos obtenidos el <b>{{fecha_publicación}}</b>.</i></p>
                            </div>
                            <div class="modal-footer">
                            <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Cerrar</button>
                            </div>
                        </div>
                    </div>
                </div>
        `.replaceAll(/\n\s+/g, "\n"),
        },
    }),
    instantsearch.widgets.pagination({
        container: '#pagination',
    }),
    // instantsearch.widgets.configure({
    //     attributesForFaceting: ["mes"]
    // })
]);

search.start();
