fileName = 'main.js'
openFile = open(fileName,'r')
lineas = openFile.readlines()
cleanText = ''
for linea in lineas:
    if not "//" in linea or not "/*" in linea:
        cleanText += linea
openFile.close()
cleanFile = open('cleanJS.txt','w')
cleanFile.write(cleanText)
