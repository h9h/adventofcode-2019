import re
import click

# Read input into card operations
with open('input.txt', 'r') as input:
    lines = input.readlines()
    card_operations = [line.strip() for line in lines]

command_re = re.compile('([a-z ]+)([\d-]*)')

commands = {
    'deal into new stack': lambda n: lambda length, idx: length - 1 -idx,
    'deal with increment': lambda n: lambda length, idx: idx * n % length,
    'cut': lambda n: lambda length, idx: (idx - n) % length,
}

def get_deck_operator(deck_operation):
    m = command_re.search(deck_operation)
    [command, argument] = [m.group(1).strip(), int('0' if m.group(2) == '' else m.group(2))]
    return commands.get(command)(argument)


def shuffle(deck_len, idx, techniques):
    for t in techniques:
        c = get_deck_operator(t)
        idx = c(deck_len, idx)
    return idx

print('Test 1')
print(shuffle(10, 3, """\
deal with increment 7
deal into new stack
deal into new stack""".split('\n')))

print('Test 2')
print(shuffle(10, 3, """\
cut 6
deal with increment 7
deal into new stack""".split('\n')))

print('Test 3')
print(shuffle(10, 3, """\
deal with increment 7
deal with increment 9
cut -2""".split('\n')))

print('Test 4')
print(shuffle(10, 3, """\
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


@click.group()
def cli():
    pass

@cli.command()
def part1():
    print('Part 1')
    print(shuffle(10007, 2019, card_operations))

@cli.command()
@click.option('--count', default=1, help='Number of greetings.')
@click.option('--name', prompt='Your name',
              help='The person to greet.')
def hello(count, name):
    """Simple program that greets NAME for a total of COUNT times."""
    for x in range(count):
        click.echo('Hello %s!' % name)

if __name__ == '__main__':
    cli()