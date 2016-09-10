"""
This scripts generate `amount` random workers distributed according to a define
skill level distribution. It then prints out the string representations of the
workers to be imported into The Founder.
"""

import json
import random

mu = 5.
sigma = 5.
iters = 10000
amount = 120
attr_prob = 0.2

# load names
with open('data/male_names.txt', 'r') as f:
    male_names = [l.replace('\n', '') for l in f.readlines()]
with open('data/female_names.txt', 'r') as f:
    female_names = [l.replace('\n', '') for l in f.readlines()]
with open('data/last_names.txt', 'r') as f:
    last_names = [l.replace('\n', '') for l in f.readlines()]

# worker attributes
with open('../data/workerAttributes.json', 'r') as f:
    attribs = json.load(f).keys()

# worker personalities
personalities = set()
with open('../data/negotiations.json', 'r') as f:
    for n in json.load(f):
        for personality in n['personalities'].keys():
            personalities.add(personality)
personalities = list(personalities)


backer_employees = [
    ('Callil', 'design'),
    ('Fil', 'engineering'),
    ('Liv Lab', 'design'),
    ('Iain Taitenbury III', 'marketing'),
    ('Toby', 'design'),
    ('Sam Panter', 'design'),
    ('Esme', 'design'),
    ('Steve Dave', 'engineering'),
    ('Tuna Silva', 'design'),
    ('Julia Kaganskiy', 'marketing'),
    ('October Jones', 'design'),
    ('Rrose', 'engineering'),
    ('Andy Teddymons', 'engineering')
]

backer_unicorns = [
    ('Vika', 'design'),
    ('@aplusplus', 'design'),
    ('Bees', 'engineering'),
    ('Dave King', 'design'),
    ('Trevor Wallace', 'design'),
    ('Lara', 'design'),
    ('Aurelia Marvel', 'engineering'),
    ('Lucas Hanna', 'design'),
    ('Kasra', 'engineering'),
    ('Kurt Texter', 'design'),
    ('Todd Tomorrow', 'design'),
    ('J.Irena Brown', 'marketing'),
    ('Jon Gillette', 'engineering'),
    ('Kati Elizabeth', 'design')
]


# a skill level just defines a classification of a worker's score.
# e.g. workers with a score < X are categorized as some kind of worker.
# the percent defines what percentage of this skill level we want in
# our final collection of workers.
class SkillLevel():
    def __init__(self, percent, score):
        self.percent = percent
        self.score = score


class Worker():
    attrs = ['happiness',
             'productivity',
             'marketing',
             'design',
             'engineering',
             'attributes',
             'personality']

    def __init__(self, main_skill=None, highly_skilled=False, name=None):
        for attr in self.attrs:
            setattr(self, attr, max(1, int(random.gauss(mu, sigma))))

        if main_skill is not None:
            val = getattr(self, main_skill)
            setattr(self, main_skill, val + 6)
        if highly_skilled:
            for attr in self.attrs:
                val = getattr(self, attr)
                setattr(self, attr, val + 5)

        self.attributes = []

        if name is None:
            # disproporationately male
            if random.random() < 0.7:
                first_names = male_names
                if random.random() < 0.35:
                    self.attributes.append('Privileged')
            else:
                first_names = female_names
                if random.random() < 0.05:
                    self.attributes.append('Privileged')
            self.name = ' '.join([random.choice(first_names),
                                random.choice(last_names)])
        else:
            self.name = name

        # The score is just the sum of attribute values.
        self.score = sum([getattr(self, attr) for attr in self.attrs if attr not in ['attributes', 'personality']])

        # Calculate the min salary for a given score.
        self.min_salary = (self.score - 2) * ((self.score % 10) * 200 + 5000)

        done_attribs = False
        attrib_pool = [a for a in attribs if a not in self.attributes]
        while not done_attribs:
            if random.random() < attr_prob:
                attrib = random.choice(attrib_pool)
                self.attributes.append(attrib)
                attrib_pool.remove(attrib)
            else:
                done_attribs = True

        self.personality = random.choice(personalities)

    def asJSON(self):
        data = {
            'name': self.name,
            'title': self.title,
            'minSalary': self.min_salary,
            'avatar': random.randint(1, 8) # avatar 0 is reserved for the mentor
        }
        for attr in self.attrs:
            data[attr] = getattr(self, attr)
        return data

    @property
    def title(self):
        sorted_attrs = sorted(self.attrs,
                              key=lambda attr: getattr(self, attr),
                              reverse=True)
        top = sorted_attrs[:2]

        if 'design' in top and 'engineering' in top:
            return random.choice(['Frontend Developer',
                                  'Backend Developer',
                                  'Programmer',
                                  'Creative Technologist',
                                  'Interactive Developer',
                                  'UX Designer',
                                  'Software Engineer',
                                  'Hardware Engineer'])

        elif 'engineering' in top and 'marketing' in top:
            return random.choice(['Business Developer',
                                  'Sales Associate',
                                  'Community Manager',
                                  'Product Manager'])

        elif 'design' in top and 'marketing' in top:
            return random.choice(['Creative Director',
                                  'Marketing Associate',
                                  'Public Relations Associate',
                                  'Visual Designer',
                                  'UI Designer',
                                  'Designer',
                                  'Product Manager'])

        elif 'design' in top:
            return random.choice(['Visual Designer',
                                  'Designer'])

        elif 'engineering' in top:
            return random.choice(['Hardware Engineer',
                                  'Software Engineer',
                                  'Developer',
                                  'Researcher'])

        elif 'marketing' in top:
            return random.choice(['Sales Associate',
                                  'Public Relations Associate'])

        return random.choice(['Programmer',
                              'Designer',
                              'MBA'])


skill_levels = {
    'lo':     SkillLevel(0.25, 5.),
    'mid-lo': SkillLevel(0.35, 15.),
    'mid-hi': SkillLevel(0.30, 30.),
    'hi':     SkillLevel(0.10, 60.)
}


workers = [Worker() for i in range(iters)]
final = []
for level, sl in skill_levels.items():
    limit = int(sl.percent * amount)
    qualifying = [w for w in workers if w.score <= sl.score]
    random.shuffle(qualifying)
    final += qualifying[:limit]

# create kickstarter backer employees
final += [Worker(main_skill=skill, name=name) for name, skill in backer_employees]
final += [Worker(main_skill=skill, name=name, highly_skilled=True) for name, skill in backer_unicorns]

workers = [w.asJSON() for w in final]
output = json.dumps(workers, sort_keys=True, indent=2)
with open('../data/workers.json', 'w') as f:
    f.write(output)