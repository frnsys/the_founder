import math
import locale

BASE = 100000
START = 2001
GROWTH = 1.2
N_YEARS = 50

locale.setlocale(locale.LC_ALL, '')
for i in range(N_YEARS):
    profit = BASE * math.pow(GROWTH, i)
    print('{}\t{}'.format(START + i, locale.currency(profit, grouping=True)))