import json
import random
from glob import glob

n_articles = 50
base_url = '../assets/news/filler'
images = [img.replace('../', '') for img in glob('{}/*.jpg'.format(base_url))]
headline_markov = json.load(open('data/headline_markov.json', 'r'))
summary_markov = json.load(open('data/summary_markov.json', 'r'))


def sample(token, markov):
    # filter tokens that have a count of 1
    dist = {k:v for k, v in markov[token].items() if v > 1}
    if not dist:
        dist = markov[token]
    z = float(sum(dist.values()))
    dist = {k:v/z for k, v in dist.items()}
    return random_choice(dist.items())

def random_choice(choices):
    """returns a random choice
    from a list of (choice, probability)"""
    # sort by probability
    a, b = zip(*choices)
    choices = sorted(choices, key=lambda x:x[1])
    roll = random.random()

    acc_prob = 0
    for choice, prob in choices:
        acc_prob += prob
        if roll <= acc_prob:
            return choice

def generate(markov, min_tokens, max_tokens):
    satisfied = False
    while not satisfied:
        tokens = ['^START']
        while tokens[-1] != 'END$':
            tokens.append(sample(tokens[-1], markov))
        tokens = tokens[1:-1]
        if len(tokens) >= min_tokens and len(tokens) <= max_tokens:
            satisfied = True
    return ' '.join(tokens)


articles = []
while len(articles) < n_articles:
    headline = generate(headline_markov, 4, 8)
    summary = generate(summary_markov, 12, 18)
    articles.append({
        'title': headline,
        'body': summary,
        'image': random.choice(images)
    })
    print(articles[-1])

with open('../data/newsFiller.json', 'w') as f:
    json.dump(articles, f)