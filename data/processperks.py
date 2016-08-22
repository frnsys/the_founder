import json


def slugify(word):
    return word.lower().replace(' ', '_')


d = json.load(open('perkPlacements.json', 'r'))

for perk_name, offices in d.items():
    for office in offices:
        new_objects = []
        if 'objects' in office:
            for obj in office['objects']:
                obj['name'] = obj['model']
                del obj['model']
                new_object = {
                    'name': slugify(perk_name),
                    'model': obj,
                    'positions': [],
                    'state': 'idle',
                    'type': 'employee'
                }
                new_objects.append(new_object);
            office['objects'] = new_objects

with open('perkPlacements.json', 'w') as f:
    json.dump(d, f, sort_keys=True, indent=2)