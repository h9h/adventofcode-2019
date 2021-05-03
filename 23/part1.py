import sys
from IntCode import IntCode
from collections import deque


def is_network_idle():
    for i in range(50):
        if len(processors[i].io) > 0:
            return 0
    return 1


assert len(sys.argv) == 2

code = open(sys.argv[1]).read().strip().split(',')
data = list(map(int, code))

processors = deque()

for i in range(50):
    processor = IntCode(i, data, i)
    processors.append(processor)

i = 0
addr = 0

natx = naty = None
prev_naty = None
part = 1
empty_count = 0

while 1:
    (addr, x, y) = processors[i].run_intcode()

    if addr != -1 and addr != 255:
        processors[addr].io.append(x)
        processors[addr].io.append(y)
        empty_count = 0
        i = addr

    elif addr == 255:
        if part == 1:
            print("Part1 : ", y)
            part += 1

        natx = x
        naty = y
        empty_count = 0

    else:
        if is_network_idle() == 1:
            if empty_count == 10000:
                if prev_naty and naty == prev_naty:
                    print("Part2 : ", naty)
                    break

                prev_naty = naty

                processors[0].io.append(natx)
                processors[0].io.append(naty)
                empty_count = 0
            else:
                empty_count += 1
        i += 1
        i %= 50