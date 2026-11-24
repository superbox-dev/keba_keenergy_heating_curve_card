// Match registry unique IDs, never the user-editable entity names.
export const FIELDS = {
  select: ['select', 'heating_curve', 'curve_select'],
  curve: ['sensor', 'heating_curve', 'curve_sensor'],
  outdoor: ['sensor', 'outdoor_temperature', 'outdoor_temperature'],
  actual: ['sensor', 'flow_temperature', 'flow_temperature'],
  target: ['sensor', 'flow_temperature_setpoint', 'flow_setpoint'],
  useCurve: ['switch', 'use_heating_curve', 'use_heating_curve'],
  limitDay: ['number', 'heating_limit_day', 'heating_limit_day'],
  limitNight: ['number', 'heating_limit_night', 'heating_limit_night'],
};

export function parseEntity(entity) {
  if (entity.platform !== 'keba_keenergy') return null;
  const domain = entity.entity_id?.split('.')[0];
  const unique = String(entity.unique_id || '').replace(/^keba_keenergy_/, '')
    .replace('_heating_circuit_', '_heat_circuit_')
    .replace('_use_curve_table', '_use_heating_curve')
    .replace('_mixer_flow_temperature', '_flow_temperature');
  const outdoor = unique.match(/^(.+)_outdoor_temperature$/);
  if (outdoor && domain === 'sensor') return { serial: outdoor[1], key: 'outdoor' };
  const match = unique.match(/^(.+)_heat_circuit_(?:(\d+)_)?(heating_curve|flow_temperature_setpoint|flow_temperature|use_heating_curve|heating_limit_day|heating_limit_night)(?:_(\d+))?$/);
  if (!match || match[2] && match[4]) return null;
  const key = Object.keys(FIELDS).find(k => k !== 'outdoor' && FIELDS[k][0] === domain && FIELDS[k][1] === match[3]);
  return key ? { serial: match[1], circuit: match[2] || match[4] || '1', key } : null;
}

export function discoverControllers(registry, devices = [], t = text => text) {
  const controllers = new Map();
  const deviceLabel = id => {
    const d = devices.find(device => device.id === id);
    return d?.name_by_user || d?.name || '';
  };
  for (const entity of registry) {
    const p = parseEntity(entity);
    if (!p || !entity.config_entry_id) continue;
    let controller = controllers.get(entity.config_entry_id);
    if (!controller) {
      controller = { id: entity.config_entry_id, serial: p.serial, label: '', circuits: [], outdoorCandidates: [] };
      controllers.set(controller.id, controller);
    }
    // One integration entry belongs to one controller. Do not merge inconsistent IDs.
    if (p.serial !== controller.serial) continue;
    if (p.key === 'outdoor') {
      controller.outdoorCandidates.push(entity);
      controller.label = deviceLabel(entity.device_id) || controller.label;
      continue;
    }
    let circuit = controller.circuits.find(c => c.id === p.circuit);
    if (!circuit) {
      circuit = { id: p.circuit, label: '', candidates: {}, map: {}, ambiguous: [] };
      controller.circuits.push(circuit);
    }
    circuit.label ||= deviceLabel(entity.device_id);
    (circuit.candidates[p.key] ||= []).push(entity);
  }
  return [...controllers.values()].map(controller => {
    const outdoor = controller.outdoorCandidates;
    controller.outdoor = outdoor.length === 1 ? outdoor[0].entity_id : '';
    controller.label = (controller.label || 'KeEnergy') + ' · ' + controller.serial;
    controller.circuits = controller.circuits.filter(c => c.candidates.curve || c.candidates.select).map(circuit => {
      circuit.label = t('Heizkreis') + ' ' + circuit.id + (circuit.label ? ' · ' + circuit.label : '');
      for (const [key, entries] of Object.entries(circuit.candidates)) {
        if (entries.length === 1) circuit.map[key] = entries[0].entity_id;
        else circuit.ambiguous.push(key);
      }
      if (controller.outdoor) circuit.map.outdoor = controller.outdoor;
      return circuit;
    }).sort((a, b) => a.id.localeCompare(b.id, undefined, { numeric: true }));
    return controller;
  }).filter(c => c.circuits.length).sort((a, b) => a.serial.localeCompare(b.serial, undefined, { numeric: true }));
}

export async function loadRegistry(hass, t = text => text) {
  const [entities, devices] = await Promise.allSettled([
    hass.callWS({ type: 'config/entity_registry/list' }),
    hass.callWS({ type: 'config/device_registry/list' }),
  ]);
  if (entities.status === 'rejected') throw entities.reason;
  if (!Array.isArray(entities.value)) throw Error(t('Entitätenverzeichnis nicht verfügbar.'));
  return { registry: entities.value, devices: devices.status === 'fulfilled' && Array.isArray(devices.value) ? devices.value : [] };
}
