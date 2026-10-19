import test from 'node:test';
import assert from 'node:assert/strict';
import {artworkUrl,artForResource} from '../artwork.mjs';

test('Home and Builder defenses resolve to appropriate level artwork',()=>{
 assert.equal(artworkUrl('buildings','Town Hall',14),'https://assets.clashk.ing/buildings/home-village/town_hall/level_14.webp');
 assert.equal(artworkUrl('buildings2','Builder Cannon',7),'https://assets.clashk.ing/buildings/builder-base/cannon/level_7.webp');
 assert.equal(artworkUrl('buildings','X-Bow',7),'https://assets.clashk.ing/buildings/home-village/x-bow/level_7.webp');
});
test('Character, spell, equipment, and Magic Item icons resolve to documented paths',()=>{
 assert.equal(artworkUrl('heroes','Archer Queen',47),'https://assets.clashk.ing/heroes/archer_queen/icon.webp');
 assert.equal(artworkUrl('pets','Electro Owl',1),'https://assets.clashk.ing/pets/electro_owl/icon.webp');
 assert.equal(artworkUrl('units','P.E.K.K.A',8),'https://assets.clashk.ing/troops/pekka/icon.webp');
 assert.equal(artworkUrl('spells','Freeze Spell',3),'https://assets.clashk.ing/spells/freeze_spell.webp');
 assert.equal(artworkUrl('equipment','Eternal Tome',8),'https://assets.clashk.ing/equipment/eternal_tome.webp');
 assert.equal(artworkUrl('magicItem','Book of Heroes'),'https://assets.clashk.ing/magic_items/book_of_heroes.webp');
 assert.equal(artForResource('shiny'),'https://assets.clashk.ing/resources/shiny_ore.webp');
});
test('Unknown categories/names never invent wrong artwork paths',()=>{
 assert.equal(artworkUrl('buildings2','Unknown ID 1000999',7),null);
 assert.equal(artworkUrl('traps','Unknown ID 123',4),null);
 assert.equal(artworkUrl('magicItem','Magic Gold Potion'),null);
 assert.equal(artworkUrl('buildings','Pet House',999),null);
});
