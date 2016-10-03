import json
from glob import glob

files = glob('../data/*.json')
effects = []

for f in files:
    d = json.load(open(f, 'r'))
    for i in d:
        if 'effects' in i:
            for e in i['effects']:
                effects.append(e)

productTypes = [pt['name'] for pt in json.load(open('../data/productTypes.json', 'r'))]

unlockableProductTypes = []
for e in effects:
    if e['type'] == 'unlocks':
        v = e['value']
        if v['type'] == 'productTypes':
            unlockableProductTypes.append(v['value'])

        if v['type'] == 'productType':
            unlockableProductTypes.append(v['value'])

shouldBeUnlockedByDefault = set(productTypes) - set(unlockableProductTypes)
print('\n'.join(shouldBeUnlockedByDefault))