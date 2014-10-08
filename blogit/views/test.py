from bottle import error, route, run, request, static_file, template, SimpleTemplate
import bottle
import pymongo
import json
import urllib2
import uuid
from time import gmtime, strftime

#Set Time Stamp (to be same for mysql and mongo)
gmTime= strftime("%Y-%m-%d %H:%M:%S", gmtime())

#Mongo Connection
connection = pymongo.Connection("mongodb://localhost", safe=True)

db = connection.blogit
posts = db.posts

@route('/test')
def test():

	query = db.posts.find_one({"_id":"123456"},{"author":1})
	
	return query['author']


run(host='localhost', port=8080, debug=True, reloader=True)