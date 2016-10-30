import json
import random

DELIM = '||'
n_articles = 200
max_attempts = 20
min_token_count = 1
base_url = '../assets/news/filler'
headline_markov = json.load(open('data/headline_markov.json', 'r'))
summary_markov = json.load(open('data/summary_markov.json', 'r'))
bad_words = []

class TooManyAttemptsException(Exception):
    pass

def sample(token, markov):
    # filter tokens that have a count of `min_token_count`
    dist = {k:v for k, v in markov[token].items() if v > min_token_count and all(w not in k.lower() for w in bad_words)}
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

def generate(markov, min_tokens, max_tokens, bigram=False):
    attempts = 0
    satisfied = False
    starts = [t for t in markov.keys() if t.startswith('^START')]
    while not satisfied:
        if attempts >= max_attempts:
            raise TooManyAttemptsException

        tokens = [random.choice(starts)] if bigram else ['^START']
        while not tokens[-1].endswith('END$'):
            tokens.append(sample(tokens[-1], markov))

        if bigram:
            tokens = [tokens[0].split(DELIM)[0]] + [t.split(DELIM)[-1] for t in tokens]
        tokens = tokens[1:-1]
        if len(tokens) >= min_tokens and len(tokens) <= max_tokens:
            satisfied = True
        attempts += 1
    return ' '.join(tokens)


articles = []
while len(articles) < n_articles:
    try:
        headline = generate(headline_markov, 4, 8, bigram=False)
        summary = generate(summary_markov, 12, 18, bigram=True)
        articles.append({
            'title': headline,
            'body': summary
        })
        print(articles[-1])
    except TooManyAttemptsException:
        continue

with open('../data/newsFiller.json', 'w') as f:
    json.dump(articles, f)