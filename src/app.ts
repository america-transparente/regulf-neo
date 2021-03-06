/* eslint-disable camelcase */
import instantsearch from "instantsearch.js";
import { sortBy, hitsPerPage, searchBox, hits, refinementList, pagination } from 'instantsearch.js/es/widgets'
import TypesenseInstantSearchAdapter from "typesense-instantsearch-adapter";
// import { Luminous } from 'luminous-lightbox';
import { Modal } from 'bootstrap'

// import { createPopup } from '@typeform/embed'
// import '@typeform/embed/build/css/popup.css'

import nc from "./names";

const typesenseInstantsearchAdapter = new TypesenseInstantSearchAdapter({
    server: {
        apiKey: "7H4w7Z28OCCZUhywxqow3EdDKXTRXkNK", // Public search-only key
        nodes: [
            {
                host: "api-direct.reguleque.cl",
                port: 443,
                protocol: "https",
            },
        ],
    },
    additionalSearchParameters: {
        query_by: "nombre,nombre_organismo,tipo_cargo",
        search_cutoff_ms: 2000,
        use_cache: true,
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

function formatRevenue(number): string | null {
    if (Number.isInteger(number)) {
        return revenueFormatter.format(number);
    } else if (number == "NaN" || number == "") {
        return null;
    } else if (!isNaN(number)) {
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
function tidyItems(items: object[]) {
    return items.map(item => ({
        ...item,
        nombre: item.nombre.toNameCase(),
        tipo_calificaci??n_profesional: item.tipo_calificaci??n_profesional?.toNameCase(),
        tipo_cargo: item.tipo_cargo?.toNameCase(),
        remuneraci??n_l??quida_mensual: formatRevenue(item.remuneraci??n_l??quida_mensual),
        remuneraci??n_bruta_mensual: formatRevenue(item.remuneraci??n_bruta_mensual),
        tipo_contrato: item.tipo_contrato?.charAt?.(0)?.toUpperCase?.() + item.tipo_contrato?.slice?.(1),
        tipo_estamento: item.tipo_estamento?.charAt?.(0).toUpperCase?.() + item.tipo_estamento?.slice?.(1),
        unidad_monetaria: item.unidad_monetaria?.toLowerCase?.(),
        vi??ticos: formatRevenue(item.vi??ticos ?? "Indeterminado"),
        fecha_egreso: item.fecha_egreso ?? "Sigue trabajando",
    }))
};


search.addWidgets([
    sortBy({
        container: '#sort-by',
        items: [
            { label: 'Por relevancia', value: 'revenue_entry' },
            { label: 'Sueldo (asc)', value: 'revenue_entry/sort/remuneraci??n_l??quida_mensual:asc' },
            { label: 'Sueldo (desc)', value: 'revenue_entry/sort/remuneraci??n_l??quida_mensual:desc' },
            { label: 'Grado EUS (asc)', value: 'revenue_entry/sort/grado_eus:asc' },
            { label: 'Grado EUS (desc)', value: 'revenue_entry/sort/grado_eus:desc' },
        ],
    }),
    hitsPerPage({
        container: "#hits-per-page",
        items: [
            { label: "12 por p??g.", value: 12, default: true },
            { label: "30 por p??g.", value: 30 },
            { label: "60 por p??g.", value: 60 },
            { label: "120 por p??g.", value: 120 }
        ]
    }),
    searchBox({
        container: "#searchbox",
        showLoadingIndicator: true,
        showSubmit: true,
        searchAsYouType: true,
        autofocus: true,
        placeholder: "Buscar funcionarios"
    }),
    refinementList({
        container: "#tipo-contrato",
        attribute: "tipo_contrato",
    }),
    refinementList({
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
                    Mostrar m??s
                {{/isShowingMore}}
                `,
        }
    }),
    refinementList({
        container: "#a??o",
        attribute: "a??o",
        showMore: true,
        limit: 6,
        templates: {
            showMoreText: `
                {{#isShowingMore}}
                    Mostrar menos
                {{/isShowingMore}}
                {{^isShowingMore}}
                    Mostrar m??s
                {{/isShowingMore}}
                `,
        }
    }),
    // TODO: Add month support to schena
    refinementList({
        container: "#mes",
        attribute: "mes",
        limit: 12,
    }),
    // TODO: Figure out int conversion
    // instantsearch.widgets.rangeSlider({
    //     container: '#a??o',
    //     attribute: 'a??o',
    //     // min: 2010,
    //     // max: 2021,
    //     // step: 1,
    //     transformItems(items) {
    //         return items.map(item => ({
    //             ...item,
    //             a??o: parseInt(item.a??o)
    //         }));
    //     }
    // }),
    // instantsearch.widgets.rangeSlider({
    //     container: '#grado-eus',
    //     attribute: 'grado_eus',
    //     // min: 2010,
    //     // max: 2021,
    //     // step: 1,
    // }),
    hits({
        container: "#hits",
        transformItems: tidyItems,
        cssClasses: {
            list: "query-results",
            item: "query-result-item",
        },
        templates: {
            item: /*html*/`
                <p class="hit-name">
                    <b>{{nombre}}</b> <span class="hit-fecha">({{mes}} {{a??o}})</span>
                </p>

                <div class="hit-contract">
                <p>
                    <b>Organismo:</b> {{nombre_organismo}}</br>
                    <b>Cargo:</b> {{tipo_cargo}}</br>
                    <b>Tipo:</b> <span title="tipo del contrato">{{tipo_contrato}}</span></br>
                    <b>Renumeraci??n Bruta:</b>  <span title="renumeraci??n bruta">{{remuneraci??n_bruta_mensual}}</span>
                </p>
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
                {{#fecha_t??rmino}}
                    hasta el <time class="hit-body-key" datetime="{{fecha_t??rmino}}" title="fecha t??rmino">{{fecha_t??rmino}}</time>
                {{/fecha_t??rmino}}
                </div>

                <div class="hit-button-container">
                <button class="hit-show-more" data-bs-toggle="modal" data-bs-target="#hit-{{__position}}">M??s informaci??n</button>
                </div>

                <!-- Modal for the complete profile -->
                <div class="modal fade" id="hit-{{__position}}" aria-hidden="true">
                    <div class="modal-dialog modal-dialog-centered modal-dialog-scrollable">
                        <div class="modal-content">
                            <div class="modal-header">
                                <h5 class="modal-title">{{nombre}} </br> ({{mes}} {{a??o}})</h5>
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
                                    <th scope="row">Regi??n</th>
                                    <td>{{regi??n}}</td>
                                    </tr>
                                    <tr>
                                    <th scope="row">Cargo</th>
                                    <td>{{tipo_cargo}}</td>
                                    </tr>
                                    <tr>
                                    <th scope="row">Calificaci??n Profesional</th>
                                    <td>{{tipo_calificaci??n_profesional}}</td>
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
                                    <tr>
                                    <th scope="row">Remuneraci??n Liq.</th>
                                    <td>{{remuneraci??n_l??quida_mensual}} {{unidad_monetaria}}</td>
                                    </tr>
                                    <tr>
                                    <th scope="row">Remuneraci??n Bruta</th>
                                    <td>{{remuneraci??n_bruta_mensual}} {{unidad_monetaria}}</td>
                                    </tr>
                                    <tr>
                                    <th scope="row">Vi??ticos</th>
                                    <td>{{vi??ticos}} {{unidad_monetaria}}</td>
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
                                <p class="hit-modal-date"><i>Datos obtenidos el <b>{{fecha_publicaci??n}}</b>.</i></p>
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
    pagination({
        container: '#pagination',
    }),
]);

// Create Bootstrap modal for donation pop-up
const donationModal = new Modal(document.querySelector("#donation-modal")!);

// this is the first time or more than 2 hours since
if (!localStorage.alreadyAnswered && (! localStorage.firstVisit || localStorage.firstVisit >= Date.now() + 1800000)) {
// Start the user segment popup
	donationModal.show()

    localStorage.firstVisit = Date.now();
}

search.start();
