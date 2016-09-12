import math

def quantity_cost(d,i):
    return 5 * math.pow(d,2) * math.pow(3,i-1)

def movement_cost(d,i):
    return 3 * math.pow(d,2) * math.pow(3,i-1)

def strength_cost(d,i):
    return 1 * math.pow(d,2) * math.pow(3,i-1)

print('d=2')
print(strength_cost(2, 1))
print(strength_cost(2, 2))
print(strength_cost(2, 3))
print()

print('d=3')
print(strength_cost(3, 1))
print(strength_cost(3, 2))
print()

print('d=4')
print(strength_cost(4, 1))
print(strength_cost(4, 2))
print()

print('d=10')
print(strength_cost(10, 1))
print(strength_cost(10, 2))