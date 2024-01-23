# This is a programmatical solution to nine nines (count=9, digit=9)

# If the answers must be exact integers
# (and not just the rounded result of integer division)
# then a check must be done when division is done.

    


exp = [set() for _ in xrange(10)]
exp[0].add(0)
exp[1].update([9, -9])
for i in xrange(1, 10):
  for a in list(exp[i]):
    for j in xrange(i, 10):
      for b in list(exp[j-i]):
        exp[j].update([a+b, a-b, a*b])
        if ((b != 0) and ((a/b) == float(a)/b)):
          exp[j].add(a/b)

n = 0
while n in exp[9]:
  n += 1
print n