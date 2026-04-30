// ==========================
// Shared Layer Style Presets
// ==========================
// Presets define everything EXCEPT the three things that vary per map:
//
//   folder_destination — GeoJSON path differs per map
//   visible            — each map sets its own default
//   group_container    — live DOM reference, created at runtime
//   hidden             — (optional) per-map UI decision
//
// Usage in layers.js:
//   addSingleColorLayer(map, {
//       ...styles.lakes,
//       folder_destination: 'GeoJSON-data/Soeer.geojson',
//       visible: false,
//       group_container: grp_soer
//   }, projection);

export const styles = {

    // ================================================================
    // Kloakering
    // ================================================================
    sewage_spildevand: {
        type: 'singleColor', // Lag funktion
        title: 'Spildevands kloakeret', // Titel på lag som ses i legende
        fill_color: '#375b9d', // Farve
        stroke_color: 'rgba(0,0,0,1)',
        stroke_width: 0,
        fill_alpha: 0.85,
        z_index: 2
    },
    sewage_spildevand_road: {
        type: 'singleColor',
        title: 'Kun vejvands- og spildevandskloakeret',
        fill_color: '#375b9d', stroke_color: 'rgba(0,0,0,1)', stroke_width: 0,
        fill_alpha: 0.85, z_index: 2
    },
    sewage_regnvand: {
        type: 'singleColor',
        title: 'Regnvands kloakeret',
        fill_color: '#2bbcd5', stroke_color: 'rgba(0,0,0,1)', stroke_width: 0,
        fill_alpha: 0.85, z_index: 2
    },
    sewage_overflade: {
        type: 'singleColor',
        title: 'Overfladevands kloakeret',
        fill_color: '#2bbcd5', stroke_color: 'rgba(0,0,0,1)', stroke_width: 0,
        fill_alpha: 0.85, z_index: 2
    },
    sewage_ingen: {
        type: 'singleColor',
        title: 'Ingen kloakering',
        fill_color: '#78a08c', stroke_color: 'rgba(0,0,0,1)', stroke_width: 0,
        fill_alpha: 0.85, z_index: 2
    },
    sewage_separat_vedtaget: {
        type: 'singleColor',
        title: 'Vedtaget separatkloakering',
        fill_color: '#e49f83', stroke_color: '#e49f83', stroke_width: 1,
        fill_alpha: 0.85, z_index: 2
    },


    // ================================================================
    // Natur – Fredede & gamle områder
    // ================================================================
    protected_areas: {
        type: 'singleColor',
        title: 'Fredede Områder',
        fill_color: 'rgba(165,207,235,0.7)', stroke_color: 'rgba(0,0,0,1)', stroke_width: 0,
        fill_alpha: 0.85, z_index: 2
    },
    habitat: {
        type: 'singleColor',
        title: 'Natura-2000 områder',
        fill_color: '#58826c', stroke_color: 'rgba(0,0,0,1)', stroke_width: 0,
        fill_alpha: 0.85, z_index: 2
    },
    wetlands_1870: {
        type: 'singleColor',
        title: 'Enge & Moser 1870',
        fill_color: 'rgba(208,231,215,0.7)', stroke_color: 'rgba(0,0,0,1)', stroke_width: 0,
        fill_alpha: 0.85, z_index: 2
    },
    wetlands_1700: {
        type: 'singleColor',
        title: 'Vådbundsområder omkring 1700-tallet',
        fill_color: '#c6ef75', stroke_color: 'rgba(0,0,0,1)', stroke_width: 0,
        fill_alpha: 0.85, z_index: 2,
        info_box: {
            title: 'Vådbundsområder omkring 1700-tallet',          
            text:  'Dam, Peder (2026): Vådbundsområder omkring 1700-tallet. Version 2.0. Arven i Landskabet. Museum Odense.', 
            border_color: '#c43c39'     
}
    },

    beskyttedenaturtyper_p3: {
        type: 'categorized',
        title: 'Beskyttede naturtyper - §3',
        field: 'Natyp_navn',
        categories: [
            { value: 'Eng',       fill_color: '#5be845b0', label: 'Eng' },
            { value: 'Hede',      fill_color: '#e54bd8b0', label: 'Hede' },
            { value: 'Mose',      fill_color: '#972d18b0', label: 'Mose' },
            { value: 'Overdrev',  fill_color: '#ffad1fb0', label: 'Overdrev' },
            { value: 'Strandeng', fill_color: '#75d3e9b0', label: 'Strandeng' },
            { value: 'Sø',        fill_color: '#1035c8b0', label: 'Sø' },
            { value: 'Ukendt',    fill_color: '#999999b0', label: 'Ukendt' },
        ],
        default_fill_color: '#999999', stroke_color: '#ffffff00', stroke_width: 0,
        fill_alpha: 0.85, z_index: 1
    },

    BNBO: {
        type: 'singleColor',
        title: 'Boringsnært beskyttelsesområde (BNBO)',
        fill_color: '#2a47dd10', stroke_color: '#182b8c', stroke_width: 0,
        fill_alpha: 0.85, z_index: 2
    },

    OSD: {
        type: 'categorized',
        title: 'Områder med særlige drikkevandsinteresser (OSD)',
        field: 'kategori',
        categories: [
            { value: 'OSD',       fill_color: '#49b3ffb0', label: 'OSD' },
        ],
        default_fill_color: '#99999900', stroke_color: '#ffffff00', stroke_width: 0,
        fill_alpha: 0.85, z_index: 1
    },

    bilagIVarter:{
        type: 'singleColor',
        title: 'Registreret bilag IV arter',
        point_style: 'star',   // circle | square | triangle | star | cross | x
        point_radius: 5,
        fill_color: '#ff8800',
        fill_alpha: 0.9,
        stroke_color: '#ffffff',
        stroke_width: 1,
        geometry_type: 'point',  // tells the legend to draw a point swatch
        z_index: 2,
    },

    line_historic_coast: {
        type: 'singleColor',
        title: 'Gammel kystlinje (1870-1899)',
        fill_color: '#4e59a0', stroke_color: '#4e59a0', fill_alpha: 1,
        stroke_width: 3, max_width: 3, breaks: [1, 1], legend_steps: 1,
        fill_alpha: 0.85, z_index: 1
    },
    line_piped_streams: {
        type: 'singleColor',
        title: 'Rørlagte vandløb',
        fill_color: '#efb258', stroke_color: '#efb258', fill_alpha: 1,
        stroke_width: 3, max_width: 3, breaks: [1, 1], legend_steps: 1,
        fill_alpha: 0.85, z_index: 1
    },


    // ================================================================
    // Jordforurening
    // ================================================================
    soil_v1: {
        type: 'singleColor',
        title: 'Jordforurening vidensniveau 1 (V1)',
        fill_color: '#b58840', stroke_color: 'rgba(0,0,0,1)', stroke_width: 0,
        fill_alpha: 0.85, z_index: 2
    },
    soil_v2: {
        type: 'singleColor',
        title: 'Jordforurening vidensniveau 2 (V2)',
        fill_color: '#f0ceae', stroke_color: 'rgba(0,0,0,1)', stroke_width: 0,
        fill_alpha: 0.85, z_index: 2
    },

    // ================================================================
    // Søer
    // ================================================================
    lakes:            {type: 'singleColor', title: 'Søer',            fill_color: '#383c6f', stroke_color: 'rgba(0,0,0,1)', stroke_width: 0, fill_alpha: 0.85, z_index: 5 },
    lakes_buffer_2m:  {type: 'singleColor', title: 'Søer 2m Buffer',  fill_color: '#484c8e', stroke_color: 'rgba(0,0,0,1)', stroke_width: 0, fill_alpha: 0.85, z_index: 4 },
    lakes_buffer_10m: {type: 'singleColor', title: 'Søer 10m Buffer', fill_color: '#6e73af', stroke_color: 'rgba(0,0,0,1)', stroke_width: 0, fill_alpha: 0.85, z_index: 3 },
    lakes_buffer_20m: {type: 'singleColor', title: 'Søer 20m Buffer', fill_color: '#c5c6df', stroke_color: 'rgba(0,0,0,1)', stroke_width: 0, fill_alpha: 0.85, z_index: 2 },
    lakes_buffer_100m:{type: 'singleColor', title: 'Søer 100m Buffer',fill_color: '#ebecf4', stroke_color: 'rgba(0,0,0,1)', stroke_width: 0, fill_alpha: 0.85, z_index: 1 },

    // ================================================================
    // Vandløb
    // ================================================================
    streams:            {type: 'singleColor', title: 'Vandløb',            fill_color: '#6294b7', stroke_color: 'rgba(0,0,0,1)', stroke_width: 0, fill_alpha: 0.85, z_index: 5 },
    streams_buffer_2m:  {type: 'singleColor', title: 'Vandløb 2m Buffer',  fill_color: '#76b0dc', stroke_color: 'rgba(0,0,0,1)', stroke_width: 0, fill_alpha: 0.85, z_index: 4 },
    streams_buffer_10m: {type: 'singleColor', title: 'Vandløb 10m Buffer', fill_color: '#a5cfeb', stroke_color: 'rgba(0,0,0,1)', stroke_width: 0, fill_alpha: 0.85, z_index: 3 },
    streams_buffer_20m: {type: 'singleColor', title: 'Vandløb 20m Buffer', fill_color: '#dbecf6', stroke_color: 'rgba(0,0,0,1)', stroke_width: 0, fill_alpha: 0.85, z_index: 2 },
    streams_buffer_100m:{type: 'singleColor', title: 'Vandløb 100m Buffer',fill_color: '#edf6fb', stroke_color: 'rgba(0,0,0,1)', stroke_width: 0, fill_alpha: 0.85, z_index: 1 },

    // ================================================================
    // Bygningsattributter
    // ================================================================
    buildings_basement: {
        type: 'singleColor',
        title: 'Bygninger med kælder',
        fill_color: '#d94b54', stroke_color: 'rgb(255,0,0)', stroke_width: 1,
        fill_alpha: 0.50, max_resolution: 3, z_index: 2,
        info_box: {
            title: 'Bygninger med kælder',          
            text:  'Zoom ind for at aktivere.', 
            border_color: '#c43c39'     
}
    },
    buildings_post1973: {
        type: 'singleColor',
        title: 'Bygninger opført efter 1973',
        fill_color: '#838fe4', stroke_color: 'rgb(13,0,199)', stroke_width: 1,
        fill_alpha: 0.50, max_resolution: 3, z_index: 2,
        info_box: {
            title: 'Bygninger opført efter 1973',          
            text:  'Zoom ind for at aktivere.', 
            border_color: '#c43c39'     
},

    },
    fredede_bygninger: {
        type: 'categorized',
        title: 'Fredede bygninger',
        field: 'byg070Fredning',
        categories: [
            { value: '1', fill_color: '#81232c', label: 'Bevaringsvurderet 1' },
            { value: '2', fill_color: '#81232c', label: 'Bevaringsvurderet 2' },
            { value: '3', fill_color: '#81232c', label: 'Bevaringsvurderet 3' },
            { value: '4', fill_color: '#f79d92', label: 'Bevaringsvurderet 4' },
            { value: '5', fill_color: '#f79d92', label: 'Bevaringsvurderet 5' },
            { value: '6', fill_color: '#f79d92', label: 'Bevaringsvurderet 6' },
            { value: '7', fill_color: '#4c8ab1', label: 'Bevaringsvurderet 7' },
            { value: '8', fill_color: '#4c8ab1', label: 'Bevaringsvurderet 8' },
            { value: '9', fill_color: '#4c8ab1', label: 'Bevaringsvurderet 9' },
        ],
        default_fill_color: '#999999', stroke_color: '#ffffff00', stroke_width: 0,
        fill_alpha: 0.85, z_index: 1
    },
    buildings_use: {
        type: 'categorized',
        title: 'Bygningsanvendelse',
        field: 'BBR_nogle_rettet_overkatagori',
        categories: [
            { value: 'Bygninger til helårsbeboelse',                                       fill_color: '#e4838f', label: 'Bygninger til helårsbeboelse' },
            { value: 'Bygninger til erhvervsmæssig produktion vedrørende landbrug',        fill_color: '#80cfba', label: 'Bygninger til erhvervsmæssig produktion vedrørende landbrug' },
            { value: 'Bygninger til erhvervsmæssig produktion',                            fill_color: '#76b0dc', label: 'Bygninger til erhvervsmæssig produktion' },
            { value: 'Bygninger til erhvervsmæssig energiproduktion og forsyning',         fill_color: '#c6ef75', label: 'Bygninger til erhvervsmæssig energiproduktion og forsyning' },
            { value: 'Bygninger til transport og parkering',                               fill_color: '#98a4ae', label: 'Bygninger til transport og parkering' },
            { value: 'Bygninger til kontor, handel og lager',                              fill_color: '#00445e', label: 'Bygninger til kontor, handel og lager' },
            { value: 'Bygninger til hotel, restaurant og service',                         fill_color: '#e49f83', label: 'Bygninger til hotel, restaurant og service' },
            { value: 'Bygninger til kultur, forlystelse og trosudøvelse',                  fill_color: '#58826c', label: 'Bygninger til kultur, forlystelse og trosudøvelse' },
            { value: 'Bygninger til undervisning og forskning',                            fill_color: '#b58840', label: 'Bygninger til undervisning og forskning' },
            { value: 'Bygninger til sygehus og sundhed',                                   fill_color: '#dbecf6', label: 'Bygninger til sygehus og sundhed' },
            { value: 'Bygninger til institutionsformål',                                   fill_color: '#bbcfc5', label: 'Bygninger til institutionsformål' },
            { value: 'Bygninger til sports- og idrætsformål',                              fill_color: '#fff199', label: 'Bygninger til sports- og idrætsformål' },
            { value: 'Bygninger til fritidsformål',                                        fill_color: '#d0e7d7', label: 'Bygninger til fritidsformål' },
            { value: 'Mindre bygninger til opbevaring og andre aktiviteter',               fill_color: '#bebeb4', label: 'Mindre bygninger til opbevaring og andre aktiviteter' },
            { value: 'Mindre bygninger til parkering',                                     fill_color: '#bdb4be', label: 'Mindre bygninger til parkering' },
            { value: 'Faldefærdige og ukendte bygninger',                                  fill_color: '#f5f6f8', label: 'Faldefærdige og ukendte bygninger' },
        ],
        default_fill_color: '#999999', stroke_color: '#ffffff', stroke_width: 0,
        fill_alpha: 0.85, max_resolution: 3, z_index: 6,
        info_box: {
            title: 'Bygningsanvendelse',          
            text:  'Zoom ind for at aktivere.', 
            border_color: '#c43c39'     
}
    },

    // ================================================================
    // Skadesberegninger
    // ================================================================
    indledende_damage_cost: {
        type: 'thematic',
        title: 'Indledende skadesberegninger, baseret på HIP. Gns. skadesomkostninger før tiltag [DKK/år]',
        field: 'Indledende_skadesberegninger_HIP',
        start_color: '#ffffb2', end_color: '#bd0026',
        stroke_color: 'rgba(0,0,0,0.5)', stroke_width: 0.5,
        fill_alpha: 0.85, num_classes: 7,
        breaks: [0, 20000, 40000, 60000, 80000, 100000, 120000, 47624000],
        max_resolution: 3, z_index: 1,
        attributeTitleField: 'attributter',
        attributes: [
            { field: 'Adresse',                 label: 'Adresse' },
            { field: 'Indledende_skadesberegninger_HIP', label: 'Gns. skadesomkostninger før tiltag [DKK/år]' },
        ]
    },
    sandsynlig_damage_cost: {
        type: 'thematic',
        title: 'HOFORs bud, mest sandsynlige skadesberegning. Gns. skadesomkostninger før tiltag [DKK/år]',
        field: 'HOFOR_mest_sandsynlige',
        start_color: '#ffffb2', end_color: '#bd0026',
        stroke_color: 'rgba(0,0,0,0.5)', stroke_width: 0.5,
        fill_alpha: 0.85, num_classes: 7,
        breaks: [0, 20000, 40000, 60000, 80000, 100000, 120000, 47624000],
        max_resolution: 3, z_index: 1,
        attributeTitleField: 'attributter',
        attributes: [
            { field: 'Adresse',                 label: 'Adresse' },
            { field: 'HOFOR_mest_sandsynlige', label: 'Gns. skadesomkostninger før tiltag [DKK/år]' },
        ]
    },

    // ================================================================
    // Terrænnært grundvand (GEO)
    // ================================================================
    groundwater_geo_1m: {
        type: 'categorized',
        title: 'Risiko for terrænnært grundvand 1m.u.t. (GEO)',
        field: 'DN',
        categories: [
            { value: '1', fill_color: '#00ccffad', label: 'Vinter' },
            { value: '2', fill_color: '#00bb9f96', label: 'Vinter og Sommer' },
            { value: '3', fill_color: '#eae1399c', label: 'Sommer' },
        ],
        default_fill_color: '#999999', stroke_color: '#ffffff00', stroke_width: 0,
        fill_alpha: 0.85, z_index: 1
    },
    groundwater_geo_2m: {
        type: 'categorized',
        title: 'Risiko for terrænnært grundvand 2m.u.t. (GEO)',
        field: 'DN',
        categories: [
            { value: '1', fill_color: '#00ccffad', label: 'Vinter' },
            { value: '2', fill_color: '#00bb9f96', label: 'Vinter og Sommer' },
            { value: '3', fill_color: '#eae1399c', label: 'Sommer' },
        ],
        default_fill_color: '#999999', stroke_color: '#ffffff00', stroke_width: 0,
        fill_alpha: 0.85, z_index: 1
    },

    // ================================================================
    // HIP – grundvandsdybde sommer
    // ================================================================
    groundwater_0_1m_s:  {type: 'singleColor', title: '0-1m',  fill_color: '#526e97', stroke_color: 'rgba(0,0,0,0)', stroke_width: 0, fill_alpha: 0.85, z_index: 2 },
    groundwater_1_2m_s:  {type: 'singleColor', title: '1-2m',  fill_color: '#78b0d6', stroke_color: 'rgba(0,0,0,0)', stroke_width: 0, fill_alpha: 0.85, z_index: 2 },
    groundwater_2_3m_s:  {type: 'singleColor', title: '2-3m',  fill_color: '#c7dfee', stroke_color: 'rgba(0,0,0,0)', stroke_width: 0, fill_alpha: 0.85, z_index: 2 },
    groundwater_3_7m_s:  {type: 'singleColor', title: '3-7m',  fill_color: '#f9fcff', stroke_color: 'rgba(0,0,0,0)', stroke_width: 0, fill_alpha: 0.85, z_index: 2 },

    // ================================================================
    // HIP – grundvandsdybde vinter
    // ================================================================
    groundwater_0_1m_w:  {type: 'singleColor', title: '0-1m',  fill_color: '#526e97', stroke_color: 'rgba(0,0,0,0)', stroke_width: 0, fill_alpha: 0.85, z_index: 2 },
    groundwater_1_2m_w:  {type: 'singleColor', title: '1-2m',  fill_color: '#78b0d6', stroke_color: 'rgba(0,0,0,0)', stroke_width: 0, fill_alpha: 0.85, z_index: 2 },
    groundwater_2_3m_w:  {type: 'singleColor', title: '2-3m',  fill_color: '#c7dfee', stroke_color: 'rgba(0,0,0,0)', stroke_width: 0, fill_alpha: 0.85, z_index: 2 },
    groundwater_3_7m_w:  {type: 'singleColor', title: '3-7m',  fill_color: '#f9fcff', stroke_color: 'rgba(0,0,0,0)', stroke_width: 0, fill_alpha: 0.85, z_index: 2 },

    // ================================================================
    // Middelvarigheder (HIP)
    // ================================================================
    groundwater_duration_1m: {
        type: 'thematic',
        title: 'Middelvarigheder 1 m.u.t.',
        field: '1m',
        start_color: '#f7fbff', end_color: '#08306b',
        stroke_color: 'rgba(0,0,0,0)', stroke_width: 0,
        fill_alpha: 0.85, gradient: true, legend_steps: 6,
        breaks: [0, 366], z_index: 1,
        attributeTitleField: 'attributter',
        attributes: [{ field: '1m', label: 'varighed (dage)' }],
        info_box: {
            title: 'Middelvarigheder 1 m.u.t.',          
            text:  'Click på celle for værdi', 
            border_color: '#c43c39'     
}
    },
    groundwater_duration_2m: {
        type: 'thematic',
        title: 'Middelvarigheder 2 m.u.t.',
        field: '2m',
        start_color: '#f7fbff', end_color: '#08306b',
        stroke_color: 'rgba(0,0,0,0)', stroke_width: 0,
        fill_alpha: 0.85, gradient: true, legend_steps: 6,
        breaks: [0, 366], z_index: 1,
        attributeTitleField: 'attributter',
        attributes: [{ field: '2m', label: 'varighed (dage)' }],
        info_box: {
            title: 'Middelvarigheder 2 m.u.t.',          
            text:  'Click på celle for værdi', 
            border_color: '#c43c39'     
}
    },

    // ================================================================
    // Pumpede vandfraktioner
    // ================================================================
    pumped_fractions: {
        type: 'pieChart',
        title: 'Pumpede vandfraktioner',
        fields: [
            { field: 'gw',   color: '#83d585', label: 'Indsivning' },
            { field: 'ww',   color: '#f9b5b3', label: 'Tørvejr' },
            { field: 'rain', color: '#163b91', label: 'Regnvand' },
            { field: 'uz',   color: '#84ccfa', label: 'Dræn' },
        ],
        point_color: '#487bb6', point_stroke: '#325780', point_radius: 8,
        pie_radius: 30, pie_offset: [38, 0], z_index: 6,
        attributeTitleField: 'attributter',
        attributes: [
            { field: 'gw',   label: 'Indsivning' },
            { field: 'ww',   label: 'Tørvejr' },
            { field: 'rain', label: 'Regnvand' },
            { field: 'uz',   label: 'Dræn' },
        ],
        info_box: {
            title: 'Pumpede vandfraktioner',
            border_color: '#c43c39',           
            legend: [
                { color: '#83d585', label: 'Indsivning' },
                { color: '#f9b5b3', label: 'Tørvejr'       },
                { color: '#163b91', label: 'Regnvand'       },
                { color: '#84ccfa', label: 'Dræn'   },
                    ], 
}
    },

    // ================================================================
    // Vandoplande & strømningsveje
    // ================================================================
    catchments: {
        type: 'categorized',
        title: 'Vandoplande',
        field: 'Label',
        legend_single: true,
        categories: [
            { value: '44290', fill_color: '#00435eb9', label: '' },
            { value: '45709', fill_color: '#b16d7da2', label: '' },
            { value: '46180', fill_color: '#3a7a7aa2', label: '' },
            { value: '46601', fill_color: '#a2afa3a2', label: '' },
            { value: '46728', fill_color: '#477a38a2', label: '' },
            { value: '46729', fill_color: '#b8861aa2', label: '' },
            { value: '46850', fill_color: '#440e3da2', label: '' },
            { value: '46867', fill_color: '#22795ca2', label: '' },
            { value: '47022', fill_color: '#6700dda2', label: '' },
            { value: '47050', fill_color: '#00dd6fa2', label: '' },
            { value: '47057', fill_color: '#dd005ca2', label: '' },
            { value: '47116', fill_color: '#dd9e2aa2', label: '' },
            { value: '47366', fill_color: '#2a696ba2', label: '' },
            { value: '47368', fill_color: '#3b9126a2', label: '' },
            { value: '47522', fill_color: '#502647a2', label: '' },
            { value: '47553', fill_color: '#5db98ba2', label: '' },
            { value: '48006', fill_color: '#3c4c8fa2', label: '' },
            { value: '48021', fill_color: '#003f2ca2', label: '' },
            { value: '48022', fill_color: '#ce628ba2', label: '' },
            { value: '54041', fill_color: '#8f9741a2', label: '' },
            { value: '56592', fill_color: '#1eff00a2', label: '' },
            { value: '59827', fill_color: '#d9dd00a2', label: '' },
        ],
        default_fill_color: '#999999', stroke_color: '#ffffff00', stroke_width: 0,
        fill_alpha: 0.85, z_index: 1
    },
    flow_paths: {
        type: 'graduatedLine',
        title: 'Strømningsveje',
        field: 'flow', color: '#00445e',
        min_width: 0.5, max_width: 20, breaks: [0, 1000000], legend_steps: 4,
        fill_alpha: 0.85, z_index: 1, maxResolution: 3
    },

    // ================================================================
    // Boringer (GEUS Jupiter)
    // ================================================================


    borehole_deviation_summer: {
        type: 'classedPoint',
        title: 'Pejledata - Afvigelse af HIP sommer',
        field: 'deviation_kote_sommer',
        stroke_color: '#ffffff', stroke_width: 1,
        breaks: [-27, 0, 1, 2, 3, 27], 
        class_colors:  ['#962e7c','#e71c0e', '#fd8d3c', '#ffffb2', '#15ff00',],
        legend_decimal_places: 0,
        radius: 4, fill_alpha: 0.85, z_index: 1,
        attributeTitleField: 'attributter',
        attributes: [
            { field: 'deviation_kote_sommer',   label: 'Forskel (m)' },
        ]
    },
    borehole_deviation_vinter: {
        type: 'classedPoint',
        title: 'Pejledata - Afvigelse af HIP vinter',
        field: 'deviation_kote_vinter',
        stroke_color: '#ffffff', stroke_width: 1,
        breaks: [-27, 0, 1, 2, 3, 27], 
        class_colors:  ['#962e7c','#e71c0e', '#fd8d3c', '#ffffb2', '#15ff00',],
        legend_decimal_places: 0,
        radius: 4, fill_alpha: 0.85, z_index: 1,
        attributeTitleField: 'attributter',
        attributes: [
            { field: 'deviation_kote_vinter',   label: 'Forskel (m)' },
        ]
    },
    borehole_depth: {
        type: 'classedPoint',
        title: 'Boringer (dybde i m)',
        field: 'dybde_num',
        start_color: '#ffffff', end_color: '#58826c',
        stroke_color: '#ffffff', stroke_width: 1,
        breaks: [0, 6, 12, 18, 30],
        radius: 4, fill_alpha: 0.85, z_index: 1
    },

    // ================================================================
    // Risiko for sætningsskader (GEO)
    // ================================================================
    settlement_risk: {
        type: 'categorized',
        title: 'Risiko for sætningsskader (GEO)',
        field: 'DN',
        categories: [
            { value: '27', fill_color: '#66df1b', fill_alpha: 0.85, label: '0-0,01' },
            { value: '42', fill_color: '#d8ef2a', fill_alpha: 0.85, label: '0,01-0,02' },
            { value: '56', fill_color: '#ffff38', fill_alpha: 0.85, label: '0,02-0,05' },
            { value: '52', fill_color: '#fbb934', fill_alpha: 0.85, label: '0,05-0,1' },
            { value: '48', fill_color: '#f82230', fill_alpha: 0.85, label: '>0,1' },
        ],
        default_fill_color: '#99999900', stroke_color: '#ffffff00', stroke_width: 0,
        fill_alpha: 0.85, z_index: 1
    },

    // ================================================================
    // Risiko for havvandsindsivning
    // ================================================================
    seawater_intrusion: {
        type: 'categorized',
        title: 'Risiko for havvandsindsivning',
        field: 'DN',
        categories: [
            { value: '0', fill_color: '#e47983', fill_alpha: 0.85, label: 'Risiko for havvandsindsivning' },
        ],
        default_fill_color: '#ffffff00', stroke_color: '#ffffff00', stroke_width: 0,
        fill_alpha: 0.85, z_index: 1
    },

    // ================================================================
    // Risiko for oversvømmelse
    // ================================================================
    flood_risk: {
        type: 'singleColor',
        title: 'Risiko for oversvømmelse (Kystdirektoratet)',
        fill_color: '#c43c39', stroke_color: 'rgb(255,255,255)', stroke_width: 0,
        fill_alpha: 0.85, z_index: 1
    },

    // ================================================================
    // Geomorfologi (GEUS)
    // ================================================================
    geo_bundmoræneflade:           {type: 'singleColor', title: 'Bundmoræneflade',          fill_color: '#b26400', stroke_color: 'rgb(255,255,255)', stroke_width: 0, fill_alpha: 0.85, z_index: 1 },
    geo_erosionsdal:               {type: 'singleColor', title: 'Erosionsdal',              fill_color: '#7ecc00', stroke_color: 'rgb(255,255,255)', stroke_width: 0, fill_alpha: 0.85, z_index: 1 },
    geo_dødislandskab:             {type: 'singleColor', title: 'Dødislandskab',            fill_color: '#dab800', stroke_color: 'rgb(255,255,255)', stroke_width: 0, fill_alpha: 0.85, z_index: 1 },
    geo_mose:                      {type: 'singleColor', title: 'Mose',                     fill_color: '#408016', stroke_color: 'rgb(255,255,255)', stroke_width: 0, fill_alpha: 0.85, z_index: 1 },
    geo_soe:                       {type: 'singleColor', title: 'Sø',                       fill_color: '#fcfcfc', stroke_color: 'rgb(255,255,255)', stroke_width: 0, fill_alpha: 0.85, z_index: 1 },
    geo_tunneldal:                 {type: 'singleColor', title: 'Tunneldal',                fill_color: '#97ad7e', stroke_color: 'rgb(255,255,255)', stroke_width: 0, fill_alpha: 0.85, z_index: 1 },
    geo_toerlagt_marint_forland:   {type: 'singleColor', title: 'Tørlagt marint forland',   fill_color: '#beffe8', stroke_color: 'rgb(255,255,255)', stroke_width: 0, fill_alpha: 0.85, z_index: 1 },
    geo_isoverskrevet_randmoraene: {type: 'singleColor', title: 'Isoverskrevet randmoræne', fill_color: '#897044', stroke_color: 'rgb(255,255,255)', stroke_width: 0, fill_alpha: 0.85, z_index: 1 },
    geo_soebund:                   {type: 'singleColor', title: 'Søbund',                   fill_color: '#b3e500', stroke_color: 'rgb(255,255,255)', stroke_width: 0, fill_alpha: 0.85, z_index: 1 },
    geo_marin_flade:               {type: 'singleColor', title: 'Marin flade',              fill_color: '#b1e4fe', stroke_color: 'rgb(255,255,255)', stroke_width: 0, fill_alpha: 0.85, z_index: 1 },
    geo_antropogent:               {type: 'singleColor', title: 'Antropogent landskab',     fill_color: '#cccccc', stroke_color: 'rgb(255,255,255)', stroke_width: 0, fill_alpha: 0.85, z_index: 1 },
    geo_strandvold:                {type: 'singleColor', title: 'Strandvold',     fill_color: '#4cccfe', stroke_color: 'rgb(255,255,255)', stroke_width: 0, fill_alpha: 0.85, z_index: 1 },

    // ================================================================
    // Projekt- og Planflader
    // ================================================================
    project_varme:    {type: 'singleColor', title: 'Projektflade Varme',    fill_color: '#662ccd', stroke_color: 'rgb(127,0,177)',      stroke_width: 0, fill_alpha: 0.85, z_index: 1 },
    project_vand:     {type: 'singleColor', title: 'Projektflade Vand',     fill_color: '#66c4cd', stroke_color: 'rgb(0,120,218)',       stroke_width: 0, fill_alpha: 0.85, z_index: 1 },
    project_spildevand:{type: 'singleColor', title: 'Projektflade Spildevand', fill_color: '#397c33', stroke_color: 'rgba(10,61,0,0.43)', stroke_width: 0, fill_alpha: 0.85, z_index: 1 },
    plan_vand:        {type: 'singleColor', title: 'Planflade vand',        fill_color: '#00bebe', stroke_color: 'rgb(255,255,255)',    stroke_width: 0, fill_alpha: 0.85, z_index: 1 },
    plan_spildevand: {
        type: 'categorized',
        title: 'Planflade Spildevand',
        field: 'STYLE_REGE',
        categories: [
            { value: 'Anlægsprojekter', fill_color: '#34cb00', fill_alpha: 0.85, label: 'Anlægsprojekt' },
            { value: "Masterplan", fill_color: "#006666", fill_alpha: 0.85, label: "Masterplan" },
        ],
        default_fill_color: '#999999', stroke_color: '#ffffff00', stroke_width: 0,
        fill_alpha: 0.85, z_index: 1
    },

    // ================================================================
    // Lokalplaner
    // ================================================================

    lokalplaner: {
        type: 'categorized',
        title: 'Lokalplaner (Vedtaget)',
        field: 'anvendelsegenerel',
        categories: [
            { value: 'Boligområde', fill_color: '#bf8058', fill_alpha: 0.85, stroke_color: '#000000', label: 'Boligområde' },
            { value: 'Blandet bolig og erhverv', fill_color: '#dc7c7c', fill_alpha: 0.85, stroke_color: '#000000', label: 'Blandet bolig og erhverv' },
            { value: 'Erhvervsområde', fill_color: '#86d6d7', fill_alpha: 0.85, stroke_color: '#000000', label: 'Erhvervsområde' },
            { value: 'Centerområde', fill_color: '#dd86e6', fill_alpha: 0.85, stroke_color: '#000000', label: 'Centerområde' },
            { value: 'Rekreativt område', fill_color: '#7be363', fill_alpha: 0.85, stroke_color: '#000000', label: 'Rekreativt område' },
            { value: 'Sommerhusområde', fill_color: '#cec39a', fill_alpha: 0.85, stroke_color: '#000000', label: 'Sommerhusområde' },
            { value: 'Område til offentlige formål', fill_color: '#d7d851', fill_alpha: 0.85, stroke_color: '#000000', label: 'Område til offentligt formål' },
            { value: 'Tekniske anlæg', fill_color: '#7a9798', fill_alpha: 0.85, stroke_color: '#000000', label: 'Teknisk anlæg' },
            { value: 'Landområde', fill_color: '#638b5c', fill_alpha: 0.85, stroke_color: '#000000', label: 'Landområde' },
            { value: 'Andet', fill_color: '#a4a4a5', fill_alpha: 0.85, stroke_color: '#000000', label: 'Andet' },
            { value: 'Anvendelse ikke reguleret', fill_color: '#9cabc1', stroke_color: '#000000', fill_alpha: 0.85, label: 'Anvendelse ikke reguleret' },
        ],
        default_fill_color: '#99999900', stroke_color: '#ffffff00', stroke_width: 0,
        fill_alpha: 0.85, z_index: 1,
        attributeTitleField: "attributter",
            attributes: [
        { field: "plannavn", label: "Plannavn" },        
        { field: "planid", label: "PlanID" },
        { field: "anvendelsegenerel", label: "Andvendelse" },
        
    ],
    },
    // ================================================================
    // Omrids
    // ================================================================
    municipality_outline: {
        type: 'categorized',
        type: 'singleColor',
        title: 'Omrids',
        fill_color: 'rgba(255,255,255,0.6)', stroke_color: 'rgba(0,0,0,1)', stroke_width: 2,
        z_index: 2
    },


    // ================================================================
    // Kommunespecifik styles
    // ================================================================

    // Herlev
    Borgerhenvendelser: {
        type: 'categorized',
        title: 'Borgerhenvendelser, Elverparken og Tornerosevej',
        field: "Adresse",
        categories: [
            { value: "Elverparken", stroke_color: "#a0dc5c", fill_color: "#a0dc5c", label: "Elverparken" },
            { value: "Tornerosevej 17-63", stroke_color: "#f1ba23", fill_color: "#f1ba23", label: "Tornerosevej 17-63" },
            { value: "Tornerosevej 75-111", stroke_color: "#f1ba23", fill_color: "#f1ba23", label: "Tornerosevej 75-111" },
        ],
        default_fill_color: "#999999", point_radius: 5, stroke_color: "#ffffff", stroke_width: 3,
        z_index: 2,
        attributeTitleField: "attributter",
            attributes: [
        { field: "adresse", label: "Adresse" },
        { field: "bemærkning", label: "bemærkning" },
        { field: "klasse", label: "katagori" },
    ],
    info_box: {
            title: 'Borgerhenvendelser, Elverparken og Tornerosevej',          
            text:  'klik på overflade for yderligere info', 
            border_color: '#c43c39'     
}
    },
    //herlev specifikke undersøgelsesområder
    musikkvarteret:{
        type: 'singleColor',
        title: 'Musikkvarteret',
        fill_color: '#f1bd7e00', fill_alpha: 1, stroke_color: 'rgb(255, 0, 0)', stroke_width: 2,
        z_index: 1,
        info_box: {
            title: 'Borgerhenvendelser i Musikkvarteret',          
            list: [
                    'Problemer med grundvand i kælder (40 gange)',
                    'Vand i kælderskakt', 
                    'Dræn ikke nok - vand i kælder',
                    '3 cm vand i kælder',
                    'Jordfaldshul - ejer bygger nyt hus',
                    'Vand i kælder - opfugtede vægge året rundt',
                    'Vand og svamp i kælder - pumper 3 m3/døgn til kloak'
            ], 
            border_color: '#c43c39'     
}
    },

    eventyrkvarteret:{
        type: 'singleColor',
        title: 'Eventyrkvarteret',
        fill_color: '#f1bd7e00', fill_alpha: 1, stroke_color: 'rgb(255, 0, 0)', stroke_width: 2,
        z_index: 1,
        info_box: {
            title: 'Borgerhenvendelser i Eventyrkvarteret',          
            list: [
                    'Underminineret - materiale skyllet væk af grundvand',
                    '2011 oversvømmet kælder fra kloak og grundvand', 
            ], 
            border_color: '#c43c39'     
}
    },

    erhvervskvarteret:{
        type: 'singleColor',
        title: 'Erhvervskvarteret',
        fill_color: '#f1bd7e00', fill_alpha: 1, stroke_color: 'rgb(255, 0, 0)', stroke_width: 2,
        z_index: 1,
        info_box: {
            title: 'Borgerhenvendelser i Erhvervskvarteret',          
            list: [
                    'Opstigende vand i kælder',
                    '2012 - virksomhed oplyste at de har opstigende vand i ejendommen', 
            ], 
            border_color: '#c43c39'     
}
    },    


    // København

    indledendeudpegninger_kbh: {
        type: 'categorized',
        title: 'Kandidater til undersøgelsesområder til TGV',
        field: 'id',
        categories: [
            { value: '1', fill_color: '#f0a890', fill_alpha: 0.65, label: ' ' },
            { value: '2', fill_color: '#484ee4', fill_alpha: 0.65, label: 'FRB  Ågade' },
            { value: '3', fill_color: '#16d8ea', fill_alpha: 0.65, label: 'Hillerødgade' },
            { value: '4', fill_color: '#705a99', fill_alpha: 0.65, label: 'Vanløse' },
            { value: '5', fill_color: '#f91f14', fill_alpha: 0.65, label: 'Vanløse' },
            { value: '6', fill_color: '#e73fc8', fill_alpha: 0.65, label: 'HUSUM syd' },
            { value: '7', fill_color: '#a13846', fill_alpha: 0.65, label: 'Bystævnet' },
            { value: '8', fill_color: '#a6c04f', fill_alpha: 0.65, label: 'Tingbjerg' },
            { value: '9', fill_color: '#c99628', fill_alpha: 0.65, label: 'Grønnemose' },
            { value: '10', fill_color: '#e719f2', fill_alpha: 0.65, label: 'Horsebakke' },
            { value: '11', fill_color: '#84368b', fill_alpha: 0.65, label: 'HF Brønshøj' },
            { value: '12', fill_color: '#d6308b', fill_alpha: 0.65, label: 'Pilesvinget' },
            { value: '13', fill_color: '#ffc037', fill_alpha: 0.65, label: 'Hulgårdsvej' },
            { value: '14', fill_color: '#f02d37', fill_alpha: 0.65, label: 'Lykkebo' },
            { value: '15', fill_color: '#46ded6', fill_alpha: 0.65, label: 'Følager' },
            { value: '16', fill_color: '#dfed16', fill_alpha: 0.65, label: 'Enghavevej' },
            { value: '17', fill_color: '#949c22', fill_alpha: 0.65, label: 'HF Frederi' },
            { value: '18', fill_color: '#55ed85', fill_alpha: 0.65, label: 'Bispebjerg' },
            { value: '19', fill_color: '#542cf1', fill_alpha: 0.65, label: 'Rymarksvej' },
            { value: '20', fill_color: '#952140', fill_alpha: 0.65, label: 'HF KOngedy' },
            { value: '21', fill_color: '#34cb00', fill_alpha: 0.65, label: 'Bella C' },
        ],
        default_fill_color: '#999999', stroke_color: '#ffffff00', stroke_width: 0,
        fill_alpha: 0.85, z_index: 1,
        attributeTitleField: 'attributter',
    attributes: [
        { field: 'Beskrivels', label: 'Navn' },
    ],
        info_box: {
            title: 'Kandidater til undersøgelsesområder til TGV',          
            text:  'Tryk for info.', 
            border_color: '#c43c39'     
}
    },    
    

    middelalderbyen: {
        type: 'singleColor',
        title: 'Middelalderbyen',
        fill_color: 'rgba(230, 103, 29, 0.58)', stroke_color: 'rgb(248, 182, 0)', stroke_width: 0,
        fill_alpha: 0.85, z_index: 2
    },

    Matrikler_med_draen: {
        type: 'singleColor',
        title: 'Matrikler med dræn',
        fill_color: '#f1bd7e', fill_alpha: 0.85, stroke_color: 'rgba(0,0,0,1)', stroke_width: 0,
        z_index: 2, max_resolution: 4,
        info_box: {
            title: 'Matrikler med dræn',          
            text:  'Zoom ind for at aktivere.', 
            border_color: '#c43c39'     
}
    },

    Matrikler_med_lokal_nedsivning: {
        type: 'singleColor',
        title: 'Matrikler med lokal nedsivning',
        fill_color: '#8ebdc6', fill_alpha: 0.85, stroke_color: 'rgba(0,0,0,1)', stroke_width: 0,
        z_index: 2, max_resolution: 4,
        info_box: {
            title: 'Matrikler med lokal nedsivning',          
            text:  'Zoom ind for at aktivere.', 
            border_color: '#c43c39'     
}
    },


    Nedsivningsanlaeg: {
        type: 'singleColor',
        title: 'Nedsivningsanlæg',
        fill_color: '#ded031', fill_alpha: 0.85, stroke_color: 'rgba(0,0,0,1)', stroke_width: 0,
        z_index: 2, max_resolution: 4,
        info_box: {
            title: 'Nedsivningsanlæg',          
            text:  'Zoom ind for at aktivere.', 
            border_color: '#c43c39'     
}
    },

    dybde_til_vandspejlet_i_kalken: {
        type: 'classedPoint',
        title: 'dybde til vandspejlet i kalken (gradient)',
        field: 'Gradient_m',
        stroke_color: '#ffffff', stroke_width: 1,
        breaks: [-3, 0, 1, 2, 3, 9], 
        class_colors:  ['#d7191c','#fdae61', '#ffffbf', '#abdda4', '#2b83ba',],
        legend_decimal_places: 0,
        radius: 4, fill_alpha: 0.85, z_index: 1,
        attributeTitleField: 'attributter',
        attributes: [
            { field: 'Gradient_m',   label: 'Gradient (m)' },
        ]
    },
    ME_Residualer_for_HIP10m: {
        type: 'classedPoint',
        title: 'ME Residualer for HIP10m',
        field: 'ME',
        stroke_color: '#ffffff', stroke_width: 1,
        breaks: [-5, -2, -1, -0.5, 0.5, 1, 2, 7], 
        class_colors:  ['#2b83ba','#80bfab', '#c7e8ad', '#ffffbf', '#fec980', '#f07c4a','#d7191c',],
        legend_decimal_places: 0,
        radius: 4, fill_alpha: 0.85, z_index: 1,
        attributeTitleField: 'attributter',
        attributes: [
            { field: 'ME',   label: '(m)' },
        ]
    },

    Kalkboringer_RegionH_mut: {
        type: 'classedPoint',
        title: 'Kalkboringer RegionH (mut)',
        field: 'Pejling mut',
        stroke_color: '#ffffff', stroke_width: 1,
        breaks: [0, 2, 3, 4, 15], 
        class_colors:  ['#d7191c','#fdae61', '#ffffbf', '#2b83ba',],
        legend_decimal_places: 0,
        radius: 4, fill_alpha: 0.85, z_index: 1,
        attributeTitleField: 'attributter',
        attributes: [
            { field: 'Pejling mut',   label: '(m)' },
        ]
    },    

    Kalkboringer_Ramboll_mut: {
        type: 'classedPoint',
        title: 'Kalkboringer Ramboll (mut)',
        field: 'Nedstik                   (m u. top rør)',
        stroke_color: '#ffffff', stroke_width: 1,
        breaks: [0, 2, 3, 4, 15], 
        class_colors:  ['#d7191c','#fdae61', '#ffffbf', '#2b83ba',],
        legend_decimal_places: 0,
        radius: 4, fill_alpha: 0.85, z_index: 1,
        attributeTitleField: 'attributter',
        attributes: [
            { field: 'Nedstik                   (m u. top rør)',},
        ]
    }, 

    jupiter_tgv_pejlinger_vinter: {
        type: 'classedPoint',
        title: 'jupiter tgv pejlinger vinter',
        field: 'watlevgrsu',
        stroke_color: '#000000', stroke_width: 1,
        breaks: [0, 0.5, 1, 2, 3, 5], 
        class_colors:  ['#d7191c','#fdae61', '#ffffbf', '#abdda4', '#2b83ba',],
        legend_decimal_places: 0,
        radius: 4, fill_alpha: 0.85, z_index: 1,
        attributeTitleField: 'attributter',
        attributes: [
            { field: 'watlevgrsu',   label: 'watlevgrsu' },
        ]
    },

    jupiter_tgv_pejlinger_i_sand: {
        type: 'classedPoint',
        title: 'jupiter tgv pejlinger i sand',
        field: 'watlevgrsu',
        stroke_color: '#ffffff', stroke_width: 1,
        breaks: [0, 2, 3, 4, 5], 
        class_colors:  ['#d7191c','#fdae61', '#ffffbf', '#2b83ba',],
        legend_decimal_places: 0,
        radius: 4, fill_alpha: 0.85, z_index: 1,
        attributeTitleField: 'attributter',
        attributes: [
            { field: 'watlevgrsu',},
        ]
    }, 


    jupiter_tgv_pejlinger_i_ler: {
        type: 'classedPoint',
        title: 'jupiter tgv pejlinger i ler',
        field: 'watlevgrsu',
        stroke_color: '#ffffff', stroke_width: 1,
        breaks: [0, 2, 3, 4, 5], 
        class_colors:  ['#d7191c','#fdae61', '#ffffbf', '#2b83ba',],
        legend_decimal_places: 0,
        radius: 4, fill_alpha: 0.85, z_index: 1,
        attributeTitleField: 'attributter',
        attributes: [
            { field: 'watlevgrsu',},
        ]
    },     

    GEO_tgv_nedsivning_pejlinger_vinter: {
        type: 'classedPoint',
        title: 'GEO tgv nedsivning pejlinger vinter',
        field: 'MUT',
        stroke_color: '#000000', stroke_width: 1,
        breaks: [0, 0.5, 1, 2, 3, 5], 
        class_colors:  ['#d7191c','#fdae61', '#ffffbf', '#abdda4', '#2b83ba',],
        legend_decimal_places: 0,
        radius: 4, fill_alpha: 0.85, z_index: 1,
        attributeTitleField: 'attributter',
        attributes: [
            { field: 'MUT',   label: '' },
        ]
    },

    GEO_tgv_boringer_vinter: {
        type: 'classedPoint',
        title: 'GEO tgv boringer vinter',
        field: 'nedstik',
        stroke_color: '#000000', stroke_width: 1,
        breaks: [0, 0.5, 1, 2, 3, 5], 
        class_colors:  ['#d7191c','#fdae61', '#ffffbf', '#abdda4', '#2b83ba',],
        legend_decimal_places: 0,
        radius: 4, fill_alpha: 0.85, z_index: 1,
        attributeTitleField: 'attributter',
        attributes: [
            { field: 'nedstik',   label: 'm' },
        ]
    },    

    TGV_oplande_fra_HIP10m: {
        type: 'thematic',
        title: 'TGV mut i kloakoplande fra hip10m',
        field: 'HIP10m_kloakoplande_median',
        class_colors: ['#d7191c', '#fec980', '#c7e8ad', '#2b83ba'],
        stroke_color: 'rgba(0,0,0,0.5)', stroke_width: 0.5,
        fill_alpha: 0.85, num_classes: 4,
        breaks: [0.4, 1, 1.5, 2, 3],
        z_index: 1,
        attributeTitleField: 'attributter',
        attributes: [
            { field: 'HIP10m_kloakoplande_median', label: 'TGV mut i kloakoplande fra hip10m' },
        ]
    },

    kbhpotentialekort: {
        type: 'singleColor',
        title: 'Grundvandspotentialet i kalkmagasinet April 2024',
        fill_color: '#0112ff', fill_alpha: 1, stroke_color: 'rgb(4, 0, 255)', stroke_width: 0,
        z_index: 2,
        map_label: {
            field: 'Kote', 
            color: '#1a1a1a',         
            outline_color: '#ffffff',
            placement: 'line',       
     }, info_box: {
            title: 'Grundvandspotentialet i kalkmagasinet April 2024',          
            image:  '../images/Grundvandspotentialet.png', 
            border_color: '#c43c39'     
}
    },

    kbh_pejlinger:{
    type: 'singleColor',
    title: 'Pejlinger 2024 [m DVR]',
    point_style: 'circle',   // circle | square | triangle | star | cross | x
    point_radius: 2.5,
    fill_color: '#0011ff',
    fill_alpha: 0.9,
    stroke_color: '#ffffff',
    stroke_width: 1,
    geometry_type: 'point',  // tells the legend to draw a point swatch
    z_index: 2,
    map_label: {
            field: 'Pejlekote', 
            color: '#1a1a1a',         
            outline_color: '#ffffff',
            placement: 'point',       
     },
    },


    kbh_tvivlsomme_pejlinger:{
    type: 'singleColor',
    title: 'Tvivlsomme pejlinger 2024 [m DVR90]',
    point_style: 'circle',   // circle | square | triangle | star | cross | x
    point_radius: 2.5,
    fill_color: '#ff0000',
    fill_alpha: 0.9,
    stroke_color: '#ffffff',
    stroke_width: 1,
    geometry_type: 'point',  // tells the legend to draw a point swatch
    z_index: 2,
    map_label: {
            field: 'Pejlekote', 
            color: '#1a1a1a',         
            outline_color: '#ffffff',
            placement: 'point',       
     },
    },

    borgerhenvendelse_koebenhavn: {
    type: 'singleColor',
    title: 'Borgerhenvendelse',
    fill_color: '#ff0000',
    fill_alpha: 0.70,
    stroke_color: 'rgb(255, 255, 255)',
    stroke_width: 0,
    z_index: 2,
    attributeTitleField: 'attributter',
    attributes: [
        { field: 'bemaerkning', label: 'Bemærkninger i zonen' },
    ],
    info_box: {
        title: 'Borgerhenvendelse angående tgv indenfor zonerne. Klik på zone for henvendelse',
        border_color: '#c43c39',
    },

},

// Brøndby

broenby_udpegninger: {
        type: 'singleColor',
        title: 'Udpegede undersøgelsesområder',
        fill_color: '#ff873c', fill_alpha: 0.85, stroke_color: 'rgb(255, 255, 255)', stroke_width: 0,
        z_index: 2,
        attributes: [
        { field: 'Omraade', label: 'Område:' },
    ],
    },

// albertslund
    borgerhenvendelse_albertslund: {
        type: 'singleColor',
        title: 'Borgerhenvendelse',
        fill_color: '#ff873c', fill_alpha: 0.85, stroke_color: 'rgb(255, 255, 255)', stroke_width: 0,
        z_index: 2,
        info_box: {
            title: 'Borgerhenvendelse',          
            text:  'Borgerhenvendelse angående tgv indenfor cirklen', 
            border_color: '#c43c39'     
}
    },


// Vestegn potentialekort
    vestegnpotentialekort: {
        type: 'singleColor',
        title: 'Grundvandspotentialet i kalkmagasinet April 2025',
        fill_color: '#0112ff', fill_alpha: 1, stroke_color: 'rgb(4, 0, 255)', stroke_width: 0,
        z_index: 1,
        map_label: {
            field: 'Vsp_2024', 
            color: '#1a1a1a',         
            outline_color: '#ffffff',
            placement: 'line',          
}
    },

    vestegn_pejlinger:{
    type: 'singleColor',
    title: 'Pejlinger 2025 [m DVR]',
    point_style: 'circle',   // circle | square | triangle | star | cross | x
    point_radius: 2.5,
    fill_color: '#0011ff',
    fill_alpha: 0.9,
    stroke_color: '#ffffff',
    stroke_width: 1,
    geometry_type: 'point',  // tells the legend to draw a point swatch
    z_index: 2,
    map_label: {
            field: 'VSP 2025', 
            color: '#1a1a1a',         
            outline_color: '#ffffff',
            placement: 'point',       
     },
    },

};