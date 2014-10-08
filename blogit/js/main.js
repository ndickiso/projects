//console.log("js loaded");
$( document ).ready(function() {
	
	//CAPITILIZE FUNCTION
	$.fn.capitalize = function () {
		$.each(this, function () {
			var caps = this.value;
			caps = caps.charAt(0).toUpperCase() + caps.slice(1);
			this.value = caps;
		});
	return this;
	};
		
	//API LINKS
	var categories = "http://localhost:8080/categoryList";
	var posts = "http://localhost:8080/postList";
	var postCategory = "http://localhost:8080/postCategory/";
	var postInfo = "http://localhost:8080/postInfo/";
	var postAdd = "http://localhost:8080/postAdd/";
	var postEdit = "http://localhost:8080/postEdit/";
	var postComment = "http://localhost:8080/postComment/";
	var postDelete = "http://localhost:8080/postDelete/";
	
	//CATEGORY SORT
	$("#categories").on("change",function(){
		
		var txt= $(this).find('option:selected').text();
		//console.log(txt);
		if(txt === 'all posts'){
			getPosts();
		}else{
			getPostsByCategory(txt);
		}
	});
	
	//SET POST BOX
	function setPost(){	
		$("#post").empty();
		
		var postBox = "<h1>Say Something...</h1>";
	        postBox += "<p>Make a post.</p>";
	        postBox += "<form action='' method=''>";
	        postBox += "<p>Author: <input type='text' id='postAuthor'> Title: <input type='text' id='postTitle'> Category: <input type='text' id='postCategory'></p>";
	        postBox += "<p>Text: <textarea type='text' id='postText'></textarea><a id='blogit' class='btn btn-primary btn-lg' role='button'>Blogit</a></p>";
	        postBox += "</form>";
	   
	   $("#post").append($(postBox));
	
	   setAnchors('blogit');
	}; //END OF SET POST
	
	
	//GET CATEGORIES
	function getCategories(){
		$.ajax({
			url: categories,
			dataType: "json",
			success: function(data){
	    		
	    		$("#categories").empty();
	    		$("#categories").append($("<option>Select a Category</option>"+"<option>all posts</option>"));
	    		
	    		for(var i=0;i<data.categories.length;i++){
				$("#categories").append($("<option value="+data.categories[i].category+">"+data.categories[i].category+"</option>"));
				};
	    	},
	    	error: function(xhr){
				console.log(xhr.responseText);
			}
		});
	}; // END OF GET CATEGORIES
	
	
	//GET POSTS
	function getPosts(){
		
		$("#posts").empty();
		$("#comments").empty();
		
		$.ajax({
			url: posts,
			dataType: "json",
			success: function(data){
		    	
			    if(data.success === 1){	
			    	for(var i=0;i<data.posts.length;i++){
									
						var post = "<div class='post'>"
						post += "<p><h4>"+data.posts[i].title+"</h4> <a class='view' userID='"+data.posts[i].id+"'>View</a> | <a class='delete' userID='"+data.posts[i].id+"'>Delete</a></p>";
						post += "<p><b>Author:</b> "+data.posts[i].author+"</p>";
						post += "<p><b>Time:</b> "+data.posts[i].time+"</p>";
						post += "<p><b>Category:</b> "+data.posts[i].category+"</p>";
						post += "<p><b>Post: </b>"+data.posts[i].text+"</p>";   
						post += "</div>";
						post += "<hr />";
						
						//console.log(data.posts[i].id);
						
						$("#posts").prepend($( post ));
						
						setAnchors('view');
						setAnchors('delete');
			    	};
			    }else if(data.success === 0){
				    $("#error").append($("<p class='error'>There was an error with your input information!</p>"));
			    };	
		    
	    	},
	    	error: function(xhr){
				console.log(xhr.responseText);
			}
		});
	}; //END OF GET POSTS
	
	
	//GET POSTS BY CATEGORY
	function getPostsByCategory(category){
		
		$("#posts").empty();
		$("#comments").empty();
		
		$.ajax({
			url: postCategory+category,
			dataType: "json",
			success: function(data){
		    	
			    if(data.success === 1){	
			    	for(var i=0;i<data.posts.length;i++){
									
						var post = "<div class='post'>"
						post += "<p><h4>"+data.posts[i].title+"</h4> <a class='view' userID='"+data.posts[i].id+"'>View</a> | <a class='delete' userID='"+data.posts[i].id+"'>Delete</a></p>";
						post += "<p><b>Author:</b> "+data.posts[i].author+"</p>";
						post += "<p><b>Time:</b> "+data.posts[i].time+"</p>";
						post += "<p><b>Category:</b> "+data.posts[i].category+"</p>";
						post += "<p><b>Post: </b>"+data.posts[i].text+"</p>";   
						post += "</div>";
						post += "<hr />";
						
						//console.log(data.posts[i].id);
						
						$("#posts").prepend($( post ));
						
						setAnchors('view');
						setAnchors('delete');
			    	};
			    }else if(data.success === 0){
				    $("#error").append($("<p class='error'>There was an error with your input information!</p>"));
			    };	
		    
	    	},
	    	error: function(xhr){
				console.log(xhr.responseText);
			}
		});
	}; //END OF GET POSTS BY CATEGORY

	
	//ADD POST
	function addPost(aut,tit,tex,cat){
		$.ajax({
			url: postAdd+aut+"/"+tit+"/"+tex+"/"+cat,
			dataType: "json",
			success: function(data){
				
				if(data.success === 1){	
					//get messages
					
					//EMPTY container HERE!
					getPosts();
					getCategories();
					
				}else if(data.success === 0){
				    $("#error").append($("<p class='error'>There was an error with your input information!</p>"));
			    };	
			
			},
			error: function(xhr){
					console.log(xhr.responseText);
			}
		});	
		setPost();
	}// END OF ADD POST
	
	
	//UPDATE POST
	function updatePost(pid,tit,tex,cat){
		$.ajax({
			url: postEdit+pid+"/"+tit+"/"+tex+"/"+cat,
			dataType: "json",
			success: function(data){
				
				if(data.success === 1){	
				
					getPosts();
					getCategories();
					
				}else if(data.success === 0){
				    $("#error").append($("<p class='error'>There was an error with your input information!</p>"));
			    };	
			
			},
			error: function(xhr){
				console.log(xhr.responseText);
			}
		});	
		setPost();
	}// END OF ADD POST

	
	//GET POST INFO
	function editPost(theID){
		$.ajax({
			url: postInfo+theID,
			dataType: "json",
			success: function(data){
		    	
			    if(data.success === 1){	
			    	$("#post").empty();
			    	$("#comments").empty();
					
					var editBox =  "<a href='/' class='back'>Back</a>"
						editBox += "<h1>Edit Something...</h1>";
				        editBox += "<p>Edit this post or leave a comment.</p>";
				        editBox += "<form action='' method=''>";
				        editBox += "<input type='text' value='"+theID+"' id='editID' style='display:none;'>";
				        editBox += "<p>Author: <b>"+data.post[0].author+"</b> Title: <input type='text' id='editTitle' value='"+data.post[0].title+"'> Category: <input type='text' id='editCategory' value='"+data.post[0].category+"'></p>";
				        editBox += "<p>Text: <textarea type='text' id='editText'>"+data.post[0].text+"</textarea><a id='editBlogit' class='btn btn-primary btn-lg' role='button'>Blogit</a></p>";
				        editBox += "</form>";
			
					var commentBox =  "<hr />";
						commentBox += "<form action='' method=''>";
						commentBox += "<input type='text' value='"+theID+"' id='commentID' style='display:none;'>";
						commentBox += "<p>Comment: <input type='text' id='commentText'><a class='comment' value='Comment'>Place Comment</a></p>";
						commentBox += "</form>";
					
					$("#post").append($(editBox));	
					$("#post").append($(commentBox));
										
					setAnchors('editBlogit');
					
					getComments(theID);	
						    
				}else if(data.success === 0){
				    $("#error").append($("<p class='error'>There was an error with your input information!</p>"));
			    };	
		    
	    	},
	    	error: function(xhr){
				console.log(xhr.responseText);
			}
		});
	}
	
	
	//DELETE POST 
	function deletePost(theID){
		$.ajax({
			url: postDelete+theID,
			dataType: "json",
			success: function(data){
				
				if(data.success === 1){	
					
					getPosts();
					getCategories();
					
				}else if(data.success === 0){
				    $("#error").append($("<p class='error'>There was an error with your input information!</p>"));
			    };	

			},
	    	error: function(xhr){
				console.log(xhr.responseText);
			}
		});
	};// END OF ADD POST COMMENTS

	
	//ADD POST COMMENT
	function addComment(theID,comment){
		$.ajax({
			url: postComment+theID+"/"+comment,
			dataType: "json",
			success: function(data){
				
				if(data.success === 1){	
					
					getComments(theID)
					
				}else if(data.success === 0){
				    $("#error").append($("<p class='error'>There was an error with your input information!</p>"));
			    };	

			},
	    	error: function(xhr){
				console.log(xhr.responseText);
			}
		});
	};// END OF ADD POST COMMENTS
	
	
	//GET POST COMMENTS
	function getComments(theID){
		$.ajax({
			url: postInfo+theID,
			dataType: "json",
			success: function(data){
				
				if(data.success === 1){	

					$("#comments").empty();
					
					var clen = data.post[0].comments.length;
					
					for(var i=0;i<clen;i++){
						
						//console.log(data.post[0].comments[i].comment);				
						$("#comments").append($("<div class='comment'><b>@ "+data.post[0].comments[i].author+"</b> <i> "+data.post[0].comments[i].time+" </i><p> Comment: "+data.post[0].comments[i].comment+"</p></div>"));
						
					}
					
					setAnchors('comment');	
					
				
				}else if(data.success === 0){
				    $("#error").append($("<p class='error'>There was an error with your input information!</p>"));
			    };	
				
				
			},
	    	error: function(xhr){
				console.log(xhr.responseText);
			}
		});
	};// END OF GET POST COMMENTS
	
	
	//SET ANCHORS
	function setAnchors(a){
		
		if(a === 'blogit'){
			$('#blogit').click(function(e){
				var aut = $('#postAuthor').val();
				var tit = $('#postTitle').val();
				var cat = $('#postCategory').val();
				var tex = $('#postText').val();
				//console.log(aut,tit,cat,tex);
				addPost(aut,tit,tex,cat);
				
			});
		}
		
		if(a === 'editBlogit'){
			$('#editBlogit').click(function(e){
				//var aut = $('#editAuthor').val();
				var tit = $('#editTitle').val();
				var cat = $('#editCategory').val();
				var tex = $('#editText').val();
				var pid = $('#editID').val();
				//console.log(aut,tit,cat,tex);
				updatePost(pid,tit,tex,cat);
			});
		}

		
		if(a === 'view'){
			$("a.view").click(function(){
				console.log("view clicked");
				var theValue = $(this).attr("userID");
				//console.log(theValue);
				editPost(theValue);
			});	
		}
		
		if(a === 'delete'){
			$("a.delete").click(function(){
				var theValue = $(this).attr("userID");
				//console.log(theValue);
				deletePost(theValue);			
			});	
		}
		
		if(a === 'comment'){
			
			$('a.comment').click(function(e){
				e.preventDefault();
				console.log("comment clicked");
				var com = $('#commentText').val();
				var cid = $('#commentID').val();
				//console.log(cid,com);
				addComment(cid,com);
			});
		}
		return false;
	}
	
	//START- SET FIRST CALL FOR FUNCTIONS
	//Call set post function once.
	setPost();
	
	//Call set categories once.
	getCategories();
	
	//Call get posts at start
	getPosts();
	
});// End of document ready

