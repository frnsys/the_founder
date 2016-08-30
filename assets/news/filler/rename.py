import os
from glob import glob

for i, file in enumerate(glob('*.jpg')):
    os.rename(file, '{}.jpg'.format(i))