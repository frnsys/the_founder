import json

ttt = json.load(open('2to3.json', 'r'))
continents = json.load(open('continents_map.json', 'r'))

continents = {continent: [ttt[k.upper()] for k in map.keys()] for continent, map in continents.items()}
continents['antarctica'] = ['ATA']
with open('continents.json', 'w') as f:
    json.dump(continents, f, indent=4, sort_keys=True)

fill_keys = {}
for continent, countries in continents.items():
    for country in countries:
        fill_keys[country] = {
            'fillKey': continent.replace(' ', '_')
        }

with open('fill_keys.json', 'w') as f:
    json.dump(fill_keys, f, indent=4, sort_keys=True)