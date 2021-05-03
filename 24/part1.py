code = map(lambda s: list(s.strip()), open('input.txt').readlines())
data = list(code)
map(print, data)

print(data[0][3])

def countBug(x, y):
    count = 0
    for delta in [[-1, 0], [1, 0], [0, -11], [0, 1]]:
        print(delta)
        if 0 <= x+delta[0] and x+delta[0] < 5 and 0 <= y+delta[1] and y+delta[1] < 5 and data[x+delta[0]][y+delta[1]] == '#': count += 1
    return count

def countBugs(data):
    return map(lambda x: set(map(lambda y: countBug(x, y), x)), data)

print(set(countBugs(data)))

