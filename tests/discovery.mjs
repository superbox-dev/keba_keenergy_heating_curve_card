import assert from 'node:assert/strict';
import { FIELDS, parseEntity, discoverControllers } from '../src/discovery.js';
const entity = (unique_id, domain = 'sensor', extra = {}) => ({ entity_id: domain + '.arbitrary_renamed_entity', platform: 'keba_keenergy', unique_id, config_entry_id: 'entry-a', ...extra });
assert.deepEqual(parseEntity(entity('123_heat_circuit_heating_curve')), { serial: '123', circuit: '1', key: 'curve' });
assert.deepEqual(parseEntity(entity('123_heat_circuit_heating_curve_2', 'select')), { serial: '123', circuit: '2', key: 'select' });
assert.deepEqual(parseEntity(entity('123_heating_circuit_3_flow_temperature')), { serial: '123', circuit: '3', key: 'actual' });
assert.deepEqual(parseEntity(entity('123_heat_circuit_mixer_flow_temperature_2')), { serial: '123', circuit: '2', key: 'actual' });
assert.equal(parseEntity(entity('123_heat_circuit_flow_temperature_offset')), null);
assert.equal(parseEntity(entity('123_heat_pump_flow_temperature')), null);
assert.equal(parseEntity(entity('123_heat_circuit_heating_curve', 'sensor', { platform: 'other' })), null);
const registry = [];
for (const [key, [domain, field]] of Object.entries(FIELDS)) for (const [entry, serial, circuit] of [['a', '111', 1], ['a', '111', 2], ['b', '222', 1]]) {
  if (key === 'outdoor' && circuit === 2) continue;
  registry.push(entity(serial + '_' + (key === 'outdoor' ? '' : 'heat_circuit_') + field + (key !== 'outdoor' && entry === 'a' ? '_' + circuit : ''), domain, { entity_id: domain + '.' + entry + '_' + circuit + '_' + key, config_entry_id: 'entry-' + entry }));
}
const controllers = discoverControllers(registry);
assert.equal(controllers.length, 2);
assert.equal(controllers[0].circuits.length, 2);
assert.equal(controllers[1].circuits.length, 1);
assert.equal(controllers[0].circuits[1].map.curve, 'sensor.a_2_curve');
assert.equal(controllers[0].circuits[1].map.outdoor, 'sensor.a_1_outdoor');
assert.equal(controllers[1].circuits[0].map.select, 'select.b_1_select');
const duplicate = { ...registry.find(e => e.entity_id === 'sensor.a_2_curve'), entity_id: 'sensor.duplicate' };
const ambiguous = discoverControllers([...registry, duplicate])[0].circuits[1];
assert.equal(ambiguous.map.curve, undefined);
assert(ambiguous.ambiguous.includes('curve'));
console.log('PASS: renamed IDs, single/multiple circuits, separate controllers, aliases and ambiguous bindings.');
