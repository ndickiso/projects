#! /usr/bin/python
import sqlite3

'''Run this file to create the needed sqlite database-> ./dbCreate. Make sure permissions are set to be executable. You can access the database through terminal, change to directory location and type sqlite3 api.db  Type .exit in query to leave the sqlite3 window.'''

createDb = sqlite3.connect('api.db')
print "Created Database Successfully"

# Creates the SQLite cursor that is used to query the database
queryCurs = createDb.cursor()

def createTable():
	# Calls the execute method that will submit a create table SQL Query
	# id will auto increment and doesnt require values to be entered
	queryCurs.execute('''CREATE TABLE IF NOT EXISTS monitor
	(id INTEGER primary key, time STRING, motion REAL, objmove REAL, temp REAL, light REAL)''')
	
	# Closes the database
	queryCurs.close()
	
createTable()

print "Created Table Successfully"