import re

# Read input into card operations
with open('input.txt', 'r') as input:
    lines = input.readlines()
    card_operations = [line.strip() for line in lines]

command_re = re.compile('([a-z ]+)([\d-]*)')

def modulo(n, deck):
    len_deck = len(deck)
    stack = [i for i in range(len_deck)]
    for i in range(len_deck):
        stack[i*n % len_deck] = deck[i]
    return stack

commands = {
    'deal into new stack': lambda n: lambda deck: [deck[x] for x in range(len(deck)-1, -1, -1)],
    'deal with increment': lambda n: lambda deck: modulo(n, deck),
    'cut': lambda n: lambda deck: deck[n:] + deck[:n],
}

def get_deck_operator(deck_operation):
    m = command_re.search(deck_operation)
    [command, argument] = [m.group(1).strip(), int('0' if m.group(2) == '' else m.group(2))]
    return commands.get(command)(argument)


def shuffle(deck, techniques):
    stack = deck
    for t in techniques:
        c = get_deck_operator(t)
        stack = c(stack)
    return stack

print('Test 1')
print(shuffle([i for i in range(10)], """\
deal with increment 7
deal into new stack
deal into new stack""".split('\n')))

print('Test 2')
print(shuffle([i for i in range(10)], """\
cut 6
deal with increment 7
deal into new stack""".split('\n')))

print('Test 3')
print(shuffle([i for i in range(10)], """\
deal with increment 7
deal with increment 9
cut -2""".split('\n')))

print('Test 4')
print(shuffle([i for i in range(10)], """\
deal into new stack
cut -2
deal with increment 7
cut 8
cut -4
deal with increment 7
cut 3
deal with increment 9
deal with increment 3
cut -1""".split('\n')))

print('Part 1')
shuffled = shuffle([i for i in range(10007)], card_operations)
print(shuffled)
print(shuffled.index(2019))
print(shuffle([i for i in range(10007)], card_operations * 2)[2019])