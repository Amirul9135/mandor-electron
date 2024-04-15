import sys

# Read from stdin
for line in sys.stdin:
    print(f'Received from Node: {line.strip()}')

    # Send message back to Node
    sys.stdout.write('ping\n')
    sys.stdout.flush()

sys.stdout.write('ping\n')
