#Nathan Dickison
#API
#03/19/14

from bottle import error, route, run, request, static_file, template, SimpleTemplate
import bottle
import pymongo
import json
import urllib2
import uuid
from time import gmtime, strftime

#Set Time Stamp (to be same for mysql and mongo)
gmTime= strftime("%Y-%m-%d %H:%M:%S", gmtime())

print gmTime

#Mongo Connection
connection = pymongo.Connection("mongodb://localhost", safe=True)

#Connecting to local db and collection
db = connection.blogit
posts = db.posts

'''This is a JSON API for post crud. JSON Success messages are handled as: Errors = 0, Success = 1, Not found = 3. To keep consistency throughout the api, the routes are made to only need one unique parameter FROM the database; the post ID. So, if an author is needed, then an additional query is ran to pull down the author. This could easily be changed to accept the author being passed through the routes as a get request if need be!'''

@route('/')
@route('/index')
def home():
	return static_file('index.html','views')


@route('/about')
def about():
	'''This is the home route that would have the name of the api and a link to look into documentation (right now the link just goes to bottle api documentation) '''

	res= dict()
	res['home'] = "Blogit API ~ Copyright 2014"
	res['documentation'] = "<a href='http://bottlepy.org/docs/dev/api.html' target='_blank'>Documentation</a>"
	
	return json.dumps(res)

#Get All Posts	
@route('/postList')
def postList():
	'''This is the function to return all the posts in the database. The query is being pulled down and rewritten from a temp directory to avoid comments because it could slow things down. Instead we include them once we look at an individual post view. '''
	
	res= dict()
	# 0 = error, 1 = true
	res['success'] = 0
	res['posts']= []
	
	query = posts.find()
	
	#Set condtional for empty query
	if query is not None:
		for r in query:
			temp = dict()
			temp['author'] = r['author']
			temp['title'] = r['title']
			temp['text'] = r['text']
			temp['category'] = r['category']
			temp['time'] = r['time']
			temp['id'] = r['_id']
			#temp['comments'] = r['comments']
			
			res['posts'].append(temp)
		res['success'] = 1
	
	return json.dumps(res)

#Get Posts by Category	
@route('/postCategory/<category>')
def postCategory(category):
	'''This function will return the posts based on categories selected.'''
	
	res= dict()
	# 0 = error, 1 = true
	res['success'] = 0
	res['posts']= []
	
	query = posts.find({"category":category})
	
	if query is not None:
		for r in query:
			temp = dict()
			temp['author'] = r['author']
			temp['title'] = r['title']
			temp['text'] = r['text']
			temp['category'] = r['category']
			temp['time'] = r['time']
			temp['id'] = r['_id']
			#temp['comments'] = r['comments']
			
			res['posts'].append(temp)
		res['success'] = 1
	
	return json.dumps(res)


#Category List
@route('/categoryList')
def categoryList():
	'''This function pulls down each unique category and appends them to an array to be returned'''		
	
	res = dict()
	res['success'] = 1
	res['categories']= []
	
	query = posts.distinct("category")	
	
	for r in query:
		temp = dict()
		temp['category'] = r 
		res['categories'].append(temp)
		
	return json.dumps(res)


#Get Single Post Info
@route('/postInfo/<id>')
def postInfo(id):
	'''This function focuses on an individual post for editing and comments'''	
	
	res= dict()
	# 0 = error, 1 = true
	res['success'] = 1
	res['post']= []
	
	query = posts.find({"_id":id})	
	
	res['post'].append(query[0])	
	
	return json.dumps(res)

#Add Post
@route('/postAdd/<author>/<title>/<text>/<category>')
def postAdd(author,title,text,category):
	'''This function adds a post from the get parameters: author title text category. Category is str.lower to keep consistency'''
	
	res= dict()
	res['success'] = 0
	
	category = category.lower()
	
	#Further Regex here
	if (author is not None) and (title is not None) and (text is not None) and (category is not None):
		
		query = posts.insert({"_id":str(uuid.uuid4()),"author":author,"title":title,"text":text,"category":category,"time":gmTime,"comments":[]},safe=True)
		
		res['success'] = 1
		
	return json.dumps(res)


#Edit Post
@route('/postEdit/<id>/<title>/<text>/<category>')
def postEdit(id,title,text,category):
	'''This function edits a post from the get parameters: author title text category. Category is str.lower to keep consistency'''
	
	res= dict()
	res['success'] = 0
	
	category = category.lower()
	
	if (title is not None) and (text is not None) and (category is not None):
		
		query1 = db.posts.find_one({"_id":id},{"author":1})
		author = query1['author']
		
		query2 = posts.update({"_id":id}, {"$set": {"author":author,"title":title,"text":text,"category":category,"time":gmTime}},safe=True)
		
		res['success'] = 1
		
	return json.dumps(res)

#Post Comment
@route('/postComment/<id>/<comment>')
def postComment(id,comment):
	'''This function adds a new comment to a post setting the author and time as well'''
	
	res= dict()
	res['success'] = 0
	
	if (comment is not None):
	
		query1 = db.posts.find_one({"_id":id},{"author":1})
		author = query1['author']
		
		query2 = posts.update({"_id":id},{"$push":{"comments":{"author":author,"comment":comment,"time":gmTime}}},safe=True)
		
		res['success'] = 1
		
	return json.dumps(res)

#Delete Post
@route('/postDelete/<id>')
def deleteEdit(id):
	'''This function deletes a post based on an id'''
	
	res= dict()
	res['success'] = 0
	
	if (id is not None):
		
		query = db.posts.remove({"_id":id})
		res['success'] = 1
		
	return json.dumps(res)
		
#Not Found Error
@error(404)
def error404(error):
	'''This function is to handle 404 errors.'''
    
	res= dict()
	res['success']= 3  #not found
	
	return json.dumps(res)

#Static Dirs	
@route('/img/<filename>')
def server_static(filename):
	return static_filw(filename,root='img')

@route('/css/<filename>')
def server_static(filename):
	return static_file(filename,root='css')	
	
@route('/js/<filename>')
def server_static(filename):
	return static_file(filename,root='js')	

@route('/fonts/<filename>')
def server_static(filename):
	return static_file(filename,root='fonts')	
	

#run it & reload
run(host='localhost', port=8080, debug=True, reloader=True)