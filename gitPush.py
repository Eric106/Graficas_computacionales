# -*- coding: utf-8 -*-
from os import system
from datetime import datetime

def run_server():
    try:
        #system("git pull")
        now = datetime.now()
        dt_string = now.strftime("%d/%m/%Y %H:%M:%S")
        #dt_string = "08/05/2020 23:38:04"
        gitUpdate(dt_string)
    except Exception as e:
        print(e)
        exit()
def gitUpdate(dt_string):
    system('git pull')
    #system('git init')
    system('git add -A')
    system('git commit -m '+'"'+dt_string+'"')
    #system("git remote add origin https://github.com/Eric106/A01378838_graficas_computacionales.git")
    system('git push origin master')
run_server()