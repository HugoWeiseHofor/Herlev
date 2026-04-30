import { styles } from '../config/layer-styles.js';

export function addAllLayers(map, projection, fns) {
    const {
        addSingleColorLayer,
        addThematicLayer,
        addCategorizedLayer,
        addPieChartLayer,
        addGraduatedLineLayer,
        addClassedPointLayer,
        createGroup,
    } = fns;

    function addLayer(config) {
        switch (config.type) {
            case 'singleColor':   return addSingleColorLayer(map, config, projection);
            case 'thematic':      return addThematicLayer(map, config, projection);
            case 'categorized':   return addCategorizedLayer(map, config, projection);
            case 'pieChart':      return addPieChartLayer(map, config, projection);
            case 'graduatedLine': return addGraduatedLineLayer(map, config, projection);
            case 'classedPoint':  return addClassedPointLayer(map, config, projection);
            case 'wms':           return fns.addWMSLayer(map, config);
            default:
                console.error(`[addLayer] Unknown type: "${config.type}"`);
                return null;
        }
    }

    // ----------------------------------------------------------------
    // TGV overgruppe
    // ----------------------------------------------------------------

    const grp_TGV   = createGroup({ title: 'Terrænnært grundvand WebGIS', fold: 'close' });

    // ----------------------------------------------------------------
    // "IKKE" Kort
    // ----------------------------------------------------------------

    const grp_IKKEkort   = createGroup({ title: '"IKKE" kort', fold: 'close',depth: 1, container: grp_TGV });

    const grp_kloakering = createGroup({ title: 'Kloakering', fold: 'close', depth: 2, container: grp_IKKEkort });

    addLayer({ ...styles.sewage_spildevand,folder_destination: 'GeoJSON-data/Spildevandskloakeret.geojson',visible: false, group_container: grp_kloakering },);
    addLayer({ ...styles.sewage_regnvand,  folder_destination: 'GeoJSON-data/Regnvandskloakeret.geojson',  visible: false, group_container: grp_kloakering },);
    addLayer({ ...styles.sewage_ingen,     folder_destination: 'GeoJSON-data/Ingen_kloakering.geojson',    visible: false, group_container: grp_kloakering },);

    // ----------------------------------------------------------------
    // "MÅSKE IKKE" Kort
    // ----------------------------------------------------------------

    const grp_MaskeIKKEkort = createGroup({ title: '"MÅSKE IKKE" kort', fold: 'close', depth: 1, container: grp_TGV  });

    const grp_fredede = createGroup({ title: 'Gamle, Fredede & Natur områder', fold: 'close', depth: 2, container: grp_MaskeIKKEkort });

    addLayer({ ...styles.protected_areas,         folder_destination: 'GeoJSON-data/Fredede_omraader.geojson',                                   visible: false, group_container: grp_fredede },);
    addLayer({ ...styles.wetlands_1870,           folder_destination: 'GeoJSON-data/Enge_og_Moser_(1870-1899).geojson',                          visible: false, group_container: grp_fredede },);
    addLayer({ ...styles.wetlands_1700,           folder_destination: 'GeoJSON-data/Vaadbundsomraader_omkring_1700-tallet.geojson',              visible: false, group_container: grp_fredede },);
    addLayer({ ...styles.OSD,                     folder_destination: 'GeoJSON-data/Herlev_omrder_med_srlige_drikkevandsinteresser_osd.geojson', visible: false, group_container: grp_fredede },);
    addLayer({ ...styles.BNBO,                    folder_destination: 'GeoJSON-data/Herlev_boringsnrt_beskyttelsesomrde_bnbo.geojson',           visible: false, group_container: grp_fredede },);
    addLayer({ ...styles.bilagIVarter,            folder_destination: 'GeoJSON-data/Herlev_bilag4arter.geojson',                                 visible: false, group_container: grp_fredede },);
    addLayer({ ...styles.beskyttedenaturtyper_p3, folder_destination: 'GeoJSON-data/Herlev_bekyttedenaturtyperparagraf3.geojson',                visible: false, group_container: grp_fredede },);

    const grp_jordforurening = createGroup({ title: 'Jordforurening', fold: 'close', depth: 2, container: grp_MaskeIKKEkort });

    addLayer({ ...styles.soil_v1, folder_destination: 'GeoJSON-data/Jordforurening_videnniveau_1_(V1).geojson', visible: false, group_container: grp_jordforurening },);
    addLayer({ ...styles.soil_v2, folder_destination: 'GeoJSON-data/Jordforurening_videnniveau_2_(V2).geojson', visible: false, group_container: grp_jordforurening },);

    const grp_soer = createGroup({ title: 'Søer', fold: 'close', depth: 2, container: grp_MaskeIKKEkort });
    addLayer({ ...styles.lakes,            folder_destination: 'GeoJSON-data/Soeer.geojson',            visible: false, group_container: grp_soer },);
    addLayer({ ...styles.lakes_buffer_2m,  folder_destination: 'GeoJSON-data/Soeer_2m_buffer.geojson',  visible: false, group_container: grp_soer },);
    addLayer({ ...styles.lakes_buffer_10m, folder_destination: 'GeoJSON-data/Soeer_10m_buffer.geojson', visible: false, group_container: grp_soer },);
    addLayer({ ...styles.lakes_buffer_20m, folder_destination: 'GeoJSON-data/Soeer_20m_buffer.geojson', visible: false, group_container: grp_soer },);
    addLayer({ ...styles.lakes_buffer_100m,folder_destination: 'GeoJSON-data/Soeer_100m_buffer.geojson',visible: false, group_container: grp_soer },);

    const grp_vandloeb = createGroup({ title: 'Vandløb', fold: 'close', depth: 2, container: grp_MaskeIKKEkort });
    addLayer({ ...styles.streams,            folder_destination: 'GeoJSON-data/Vandloeb.geojson',            visible: false, group_container: grp_vandloeb },);
    addLayer({ ...styles.streams_buffer_2m,  folder_destination: 'GeoJSON-data/Vandloeb_2m_buffer.geojson',  visible: false, group_container: grp_vandloeb },);
    addLayer({ ...styles.streams_buffer_10m, folder_destination: 'GeoJSON-data/Vandloeb_10m_buffer.geojson', visible: false, group_container: grp_vandloeb },);
    addLayer({ ...styles.streams_buffer_20m, folder_destination: 'GeoJSON-data/Vandloeb_20m_buffer.geojson', visible: false, group_container: grp_vandloeb },);
    addLayer({ ...styles.streams_buffer_100m,folder_destination: 'GeoJSON-data/Vandloeb_100m_buffer.geojson',visible: false, group_container: grp_vandloeb },);

    // ----------------------------------------------------------------
    // Skadesomkostninger
    // ----------------------------------------------------------------

    const grp_skadesomkostninger = createGroup({ title: 'Skadesberegninger', fold: 'close', depth: 1, container: grp_TGV });

    const { layer: lyr_bygninger_indledende, source: jsonSource_bygninger_indledende } =
        addLayer({ ...styles.indledende_damage_cost, folder_destination: 'GeoJSON-data/Bygninger_Skadesberegninger_Herlev.geojson', visible: false, group_container: grp_skadesomkostninger },);
    const { layer: lyr_bygninger_sandsynlig, source: jsonSource_bygninger_sandsynlig } =
        addLayer({ ...styles.sandsynlig_damage_cost, folder_destination: 'GeoJSON-data/Bygninger_Skadesberegninger_Herlev.geojson', visible: false, group_container: grp_skadesomkostninger },);
    
    // ----------------------------------------------------------------
    // Herlev specifikt
    // ----------------------------------------------------------------

    const grp_borgerhenvendelser = createGroup({ title: 'Indledende udpegning af undersøgelsesområder, samt borgerhenvendelser', fold: 'close', depth: 1, container: grp_TGV});

    addLayer({ ...styles.Borgerhenvendelser, folder_destination: 'GeoJSON-data/Borgerhenvendelser.geojson',visible: false, group_container: grp_borgerhenvendelser },);
    addLayer({ ...styles.musikkvarteret,     folder_destination: 'GeoJSON-data/musikkvarteret.geojson',    visible: false, group_container: grp_borgerhenvendelser },);
    addLayer({ ...styles.erhvervskvarteret,  folder_destination: 'GeoJSON-data/Erhvervskvarteret.geojson', visible: false, group_container: grp_borgerhenvendelser },);
    addLayer({ ...styles.eventyrkvarteret,   folder_destination: 'GeoJSON-data/Eventyrkvarteret.geojson',  visible: false, group_container: grp_borgerhenvendelser },);

    // ----------------------------------------------------------------
    // Analyser og andre data
    // ----------------------------------------------------------------

    const grp_analyserdata = createGroup({ title: 'Analyser og andre data', fold: 'close', depth: 1, container: grp_TGV });

    const grp_Bygningsattributter = createGroup({ title: 'Bygningsattributter', fold: 'close', depth: 2,  container: grp_analyserdata });
    addLayer( { ...styles.buildings_basement, folder_destination: 'GeoJSON-data/Bygninger_med_kaelder.geojson',        visible: false, group_container: grp_Bygningsattributter },);
    addLayer( { ...styles.buildings_post1973, folder_destination: 'GeoJSON-data/Bygninger_opfoert_efter_1973.geojson', visible: false, group_container: grp_Bygningsattributter },);
    addLayer( { ...styles.buildings_use,      folder_destination: 'GeoJSON-data/Bygningsanvendelse.geojson',           visible: false, group_container: grp_Bygningsattributter },);

    const grp_lokalplaner = createGroup({ title: 'Lokalplaner (vedtaget)', fold: 'close', depth: 2, container: grp_analyserdata });
    addLayer({ ...styles.lokalplaner, folder_destination: 'GeoJSON-data/Herlev_lokalplaner.geojson', visible: false, group_container: grp_lokalplaner },);

    const grp_risikoTGVGEO = createGroup({ title: 'Risiko for terrænnært grundvand (GEO)', fold: 'close', depth: 2, container: grp_analyserdata });
    addLayer({ ...styles.groundwater_geo_1m, folder_destination: 'GeoJSON-data/Risiko_for_terraennaert_grundvand_1m.u.t._(GEO).geojson', visible: false, group_container: grp_risikoTGVGEO },);
    addLayer({ ...styles.groundwater_geo_2m, folder_destination: 'GeoJSON-data/Risiko_for_terraennaert_grundvand_2m.u.t._(GEO).geojson', visible: false, group_container: grp_risikoTGVGEO },);

    const grp_HIP = createGroup({ title: 'Terrænnært grundvand sommer- og vintermiddel [m under terræn] (HIP)', fold: 'close', depth: 2, container: grp_analyserdata });

    const grp_HIPsommer = createGroup({ title: 'Terrænnært grundvand sommermiddel [m under terræn] (HIP)', fold: 'close', depth: 3, container: grp_HIP });
    addLayer({ ...styles.groundwater_0_1m_s, folder_destination: 'GeoJSON-data/0-1_m.geojson',   visible: false, group_container: grp_HIPsommer },);
    addLayer({ ...styles.groundwater_1_2m_s, folder_destination: 'GeoJSON-data/1-2_m.geojson',   visible: false, group_container: grp_HIPsommer },);
    addLayer({ ...styles.groundwater_2_3m_s, folder_destination: 'GeoJSON-data/2-3_m.geojson',   visible: false, group_container: grp_HIPsommer },);
    addLayer({ ...styles.groundwater_3_7m_s, folder_destination: 'GeoJSON-data/3-7_m.geojson',   visible: false, group_container: grp_HIPsommer },);

    const grp_HIPvinter = createGroup({ title: 'Terrænnært grundvand vintermiddel [m under terræn] (HIP)', fold: 'close', depth: 3, container: grp_HIP });
    addLayer({ ...styles.groundwater_0_1m_w, folder_destination: 'GeoJSON-data/0-1_m_1.geojson', visible: false, group_container: grp_HIPvinter },);
    addLayer({ ...styles.groundwater_1_2m_w, folder_destination: 'GeoJSON-data/1-2_m_1.geojson', visible: false, group_container: grp_HIPvinter },);
    addLayer({ ...styles.groundwater_2_3m_w, folder_destination: 'GeoJSON-data/2-3_m_1.geojson', visible: false, group_container: grp_HIPvinter },);
    addLayer({ ...styles.groundwater_3_7m_w, folder_destination: 'GeoJSON-data/3-7_m_1.geojson', visible: false, group_container: grp_HIPvinter },);

    const grp_middelvariationer = createGroup({ title: 'Middelvarigheder iflg. HIP', fold: 'close', depth: 2, container: grp_analyserdata });
    addLayer({ ...styles.groundwater_duration_1m, folder_destination: 'GeoJSON-data/Middelvarigheder_1_m.u.t..geojson', visible: false, group_container: grp_middelvariationer },);
    addLayer({ ...styles.groundwater_duration_2m, folder_destination: 'GeoJSON-data/Middelvarigheder_2_m.u.t..geojson', visible: false, group_container: grp_middelvariationer },);

    const grp_pumpedevandfraktioner = createGroup({ title: 'Pumpede vandfraktioner', fold: 'close', depth: 2, container: grp_analyserdata });
    addLayer({ ...styles.pumped_fractions, folder_destination: 'GeoJSON-data/Pumpede_vandfraktioner.geojson', visible: false, group_container: grp_pumpedevandfraktioner },);

    const grp_vandoplande = createGroup({ title: 'Vandoplande', fold: 'close', depth: 2, container: grp_analyserdata });
    addLayer(  { ...styles.catchments, folder_destination: 'GeoJSON-data/oplande.geojson',         visible: false, group_container: grp_vandoplande },);
    addLayer({ ...styles.flow_paths,   folder_destination: 'GeoJSON-data/Stroemningsveje.geojson', visible: false, group_container: grp_vandoplande },);

    const grp_boringer = createGroup({ title: 'Boringer (GEUS Jupiter Database)', fold: 'close', depth: 2, container: grp_analyserdata });
    addLayer({ ...styles.borehole_deviation_summer, folder_destination: 'GeoJSON-data/deviations_kote_fix_herlev.geojson', visible: false, group_container: grp_boringer },);
    addLayer({ ...styles.borehole_deviation_vinter, folder_destination: 'GeoJSON-data/deviations_kote_fix_herlev.geojson', visible: false, group_container: grp_boringer },);
    addLayer({ ...styles.borehole_depth,            folder_destination: 'GeoJSON-data/Boringer_(dybde_i_m).geojson',       visible: false, group_container: grp_boringer },);

    const grp_geomorfologi = createGroup({ title: 'Geomorfologi (GEUS)', fold: 'close', depth: 2, container: grp_analyserdata });
    addLayer({ ...styles.geo_bundmoræneflade, folder_destination: 'GeoJSON-data/Bundmoraeneflade.geojson', visible: false, group_container: grp_geomorfologi },);
    addLayer({ ...styles.geo_erosionsdal,     folder_destination: 'GeoJSON-data/Erosionsdal.geojson',      visible: false, group_container: grp_geomorfologi },);
    addLayer({ ...styles.geo_dødislandskab,   folder_destination: 'GeoJSON-data/Doedislandskab.geojson',   visible: false, group_container: grp_geomorfologi },);
    addLayer({ ...styles.geo_mose,            folder_destination: 'GeoJSON-data/Mose.geojson',             visible: false, group_container: grp_geomorfologi },);
    addLayer({ ...styles.geo_soe,             folder_destination: 'GeoJSON-data/Soe.geojson',              visible: false, group_container: grp_geomorfologi },);
    addLayer({ ...styles.geo_tunneldal,       folder_destination: 'GeoJSON-data/Tunneldal.geojson',        visible: false, group_container: grp_geomorfologi },);

    const grp_potentialekort = createGroup({ title: 'Potentialekort', fold: 'close', depth: 2, container: grp_analyserdata });
    addLayer({ ...styles.vestegnpotentialekort, folder_destination: 'GeoJSON-data/Potentialekort_Vestegnen_2025_v0_smooth_2-0_25.geojson', visible: false, group_container: grp_potentialekort },);
    addLayer({ ...styles.vestegn_pejlinger,     folder_destination: 'GeoJSON-data/Pejlinger_Vestegnen_2025_v0.geojson', visible: false, group_container: grp_potentialekort },);

    // ----------------------------------------------------------------
    // Projekt- og Planflader
    // ----------------------------------------------------------------
    const grp_projektplanflader = createGroup({ title: 'Projekt- og Planflader', fold: 'close', depth: 1, container: grp_TGV });
    addLayer( { ...styles.project_vand,      folder_destination: 'GeoJSON-data/Projektflade_Vand.geojson',      visible: false, group_container: grp_projektplanflader },);
    addLayer( { ...styles.project_spildevand,folder_destination: 'GeoJSON-data/Projektflade_Spildevand.geojson',visible: false, group_container: grp_projektplanflader },);
    addLayer( { ...styles.plan_spildevand,   folder_destination: 'GeoJSON-data/Planflade_Spildevand.geojson',   visible: false, group_container: grp_projektplanflader },);

    // ----------------------------------------------------------------
    // Omrids (hidden background outline)
    // ----------------------------------------------------------------
    const grp_baggrund = createGroup({ title: '', fold: 'close', hidden: true });
    addLayer({ ...styles.municipality_outline, folder_destination: 'GeoJSON-data/Herlev.geojson', hidden: true, group_container: grp_baggrund },);

    // ----------------------------------------------------------------
    // Damage Summary Box
    // ----------------------------------------------------------------
    function setupDamageSummary({ layer, source, field, label }) {
    // Create the box and inject it into the bottom-left stack
    const summaryDiv = document.createElement('div');
    summaryDiv.className = 'damage-summary-box';
    summaryDiv.style.display = 'none';

    const stack = document.getElementById('bottom-left-stack');
    if (stack) {
        stack.appendChild(summaryDiv);
    } else {
        document.body.appendChild(summaryDiv);
    }

    function update() {
        if (!layer.getVisible()) { summaryDiv.style.display = 'none'; return; }
        summaryDiv.style.display = 'block';

        if (map.getView().getResolution() > 3) {
            summaryDiv.innerHTML = '🔍 Zoom ind for at se skadesberegninger';
            return;
        }

        const extent = map.getView().calculateExtent(map.getSize());
        let total = 0;
        source.forEachFeatureInExtent(extent, feature => {
            let value = feature.get(field);
            if (value !== null && value !== undefined) {
                if (typeof value === 'string') value = value.replace(',', '.');
                total += parseFloat(value) || 0;
            }
        });

        summaryDiv.innerHTML =
            `${label}<br/>` +
            '<i>Klik på individuel bygning for yderligere info</i><br/><strong>' +
            total.toLocaleString('da-DK', { maximumFractionDigits: 0 }) + ' DKK/år</strong>';
    }

    map.on('moveend', update);
    layer.on('change:visible', update);
    source.once('change', () => {
        if (source.getState() === 'ready') update();
    });
}

setupDamageSummary({
    layer:  lyr_bygninger_indledende,
    source: jsonSource_bygninger_indledende,
    field:  'Indledende_skadesberegninger_HIP',
    label:  'Indledende skadesberegninger, baseret på HIP. Gns. skadesomkostninger før tiltag [DKK/år] i nuværende udsnit:'
});

setupDamageSummary({
    layer:  lyr_bygninger_sandsynlig,
    source: jsonSource_bygninger_sandsynlig,
    field:  'HOFOR_mest_sandsynlige',
    label:  'HOFORs bud, mest sandsynlige skadesberegning. Gns. skadesomkostninger før tiltag [DKK/år] i nuværende udsnit:'
});
}