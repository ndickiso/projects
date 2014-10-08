from bottle import error, route, run, request, response, redirect, static_file, template, SimpleTemplate
import bottle
import sqlite3
import json
import urllib2
import uuid
from time import gmtime, strftime

''' Monitor Arduino App!
This application tracks local temp, light, motion, and movement of an object, to an hosted UI using a programmed Arduino hidden in a kleenex box.
You can also right to the Arduino for actions based on the links in the UI.
This is the main python file the needs to be called upon to run the application-> python index.py in testing, sudo nohup python index.py on server.
** Make sure to change the api url in the javascript from testing to apiTrack, and also uncomment the run paste call, and comment the run local ip line at the bottom of this file.
This file runs on bottle with paste as its multi-thread server option. It connects to a small sqlite database as well.
'''

#Connect to local sqlite database
connect = sqlite3.connect('db/api.db', check_same_thread = False)

#Function for checking if a variable is a number. Used in API Log route
def is_number(s):
    try:
        float(s)
        return True
    except ValueError:
        return False


#Set Global settings to return actions to the Arduino
actions=dict()		  
actions['sound'] = 0
actions['light'] = 0
actions['move'] = 0

#Root Route
@route('/')
def home():
	return template('views/index')

#Action Route
@route('/action/<action>')
def doAction(action):

	'''This function sets the next successful api request to return a response to make an action happen on the Arduino'''
	
	if(action == "sound"):
		actions['sound'] = 1
	
	if(action == "light"):
		actions['light'] = 1
		
	if(action == "move"):
		actions['move'] = 1
	
	#Redirect back to root	
	redirect("/")
	
#API Log Route takes the readings from the arduino as arguments
@route('/apiLog/<motion>/<objmove>/<temp>/<light>')
def apiLog(motion,objmove,temp,light):

	'''This route handles the api, which inserts the latest tracked data from the Arduino into the database, upon successful datatypes filtering. The response is set to be a number from $0-5; 0 unsuccessful entry to database, 1 successful insert, 2 play sound, 3 turn on light, 4 make a movement. These actions are then reset to 0.'''
	
	if is_number(motion) and is_number(objmove) and is_number(temp) and is_number(light):
		
		connect.execute("INSERT INTO monitor (time,motion,objmove,temp,light) VALUES (datetime(), {motion}, {objmove}, {temp}, {light});".format(**locals()))
		connect.commit()
		
		if(actions['sound'] == 1):
			actions['sound'] = 0
			return "$2"
			connect.close()
			
		elif(actions['light'] == 1):
			actions['light'] = 0
			return "$3"
			connect.close()
			
		elif(actions['move'] == 1):
			actions['move'] = 0
			return "$4"
			connect.close()
		
		else:
			return "$1"
			connect.close()
		
	else:
		return "$0"

		
#API Track
@route('/apiTrack/<length>')
def apiTrack(length):
	'''This route handles the api, returning the data sets from the database base. These are filtered on the latest local time descending, and a limit according to each timeframe. These timeframes are based on the links selected. The response is returned in JSON; with 0 unsuccessful request, 1 successful request.'''
	
	#Time adjustment for East Coast
	timeZone = -8
	
	if(length == "day"):
		#360 = hourly, Arduino posts every 10 seconds, 6*60, limit to last day max
		count=360
		limit = 24
	
	elif(length == "hours"):
		#60 = 10 Minutes, Arduino posts every 10 seconds, 6*10, limit to last 4 hours max
		count=60
		limit = 24
	
	else:
		#default,or latest = Every 30 seconds Arduino posts every 10 seconds: 3, limit to last 4 minutes max
		count=1
		limit = 24		
	
	res= dict()
	res['response'] = 0
	res['track'] = []
	
	cursor = connect.execute("SELECT datetime(time, 'localtime') as adjtime, motion, objmove, temp, light FROM monitor WHERE id % {count} = 0 Order by adjtime DESC limit {limit};".format(**locals()))
			
	for row in cursor:
		temp = dict()
		temp['time'] = row[0]
		temp['motion'] = row[1]
		temp['objmove'] = row[2]
		temp['temp'] = row[3]
		temp['light'] = row[4]
		
		res['track'].append(temp)
	#res['track'].reverse()
	res['response'] = 1
	
	return json.dumps(res)
	connect.close()
	
	
# Statics files for css and javascript
@route('/public/js/<filename>')
def server_static(filename):
	return static_file(filename, root='public/js')
	
# Statics files for css and javascript
@route('/public/css/<filename>')
def server_static(filename):
	return static_file(filename, root='public/css')
	
# Statics files for css and javascript
@route('/public/img/<filename>')
def server_static(filename):
	return static_file(filename, root='public/img')

@error(404)
def error404(error):
	return template('views/404', error=error)

# Run the server
run(host='127.0.0.1', port='8080',debug=True, reloader=True)

#List actual ip address here
#run(server='paste', host='107.170.78.197', port='80',debug=True)


