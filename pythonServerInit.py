from os import system, sys
from time import sleep

def main():
    try:
        system("sudo python3 -m http.server 80 --bind 127.0.0.1")
    except KeyboardInterrupt:
        print("Cerrando server")
        sleep(2)
        sys.exit()
main()