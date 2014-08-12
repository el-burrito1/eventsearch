
/**
 * Module dependencies.
 */

var express = require('express');
var routes = require('./routes');
var user = require('./routes/user');
var http = require('http');
var path = require('path');

var crawl = require('crawl');
var Crawler = require("simplecrawler");


var app = express();



// all environments
app.set('port', process.env.PORT || 3000);
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');
app.use(express.favicon());
app.use(express.logger('dev'));
app.use(express.json());
app.use(express.urlencoded());
app.use(express.methodOverride());
app.use(express.static(path.join(__dirname, 'public')));
app.use(app.router);

// development only
if ('development' == app.get('env')) {
  app.use(express.errorHandler());
}

app.get('/', routes.index);
app.get('/partials/:name', routes.partials);

app.get('*', routes.index);



app.post('/search', function(req, res) {

	var url,path,pathArray;
	var matchedUrl = [];

	if(req.body.url.indexOf('.com') > -1){
		url = req.body.url.slice(7,req.body.url.indexOf('.com' )+4)
		path = req.body.url.slice(req.body.url.indexOf('.com')+5)
	} else if (req.body.url.indexOf('.edu') > -1){
		url = req.body.url.slice(7,req.body.url.indexOf('.edu' )+4)
		path = req.body.url.slice(req.body.url.indexOf('.edu')+5)
	} else if (req.body.url.indexOf('.org') > -1){
		url = req.body.url.slice(7,req.body.url.indexOf('.org' )+4)
		path = req.body.url.slice(req.body.url.indexOf('.org')+5)
	}


	if(path.indexOf('/')==-1){
		pathArray = path.split('&')
	} else {
		pathArray = path.split('/')
	}

	if(pathArray[pathArray.length-1] == ''){
		pathArray.splice(pathArray.length-1 , 1)
	}

	console.log(url)
	console.log(pathArray) 


	
  	var eventCrawler = new Crawler(url);

  	eventCrawler.addFetchCondition(function(parsedURL){
  		for(var i = 0 ; i < pathArray.length ; i ++){
  			return (parsedURL.path.indexOf(pathArray[i]) > -1)
  		}
  	})

  	eventCrawler.addFetchCondition(function(parsedURL) {
    		return !parsedURL.path.match(/\.jpg$/i);
	})

	eventCrawler.addFetchCondition(function(parsedURL) {
    		return !parsedURL.path.match(/\.png$/i);
	})

	eventCrawler.addFetchCondition(function(parsedURL) {
    		return !parsedURL.path.match(/\.gif$/i);
	})


  	eventCrawler.on("fetchcomplete" , function(queueItem){
  		console.log("Completed fetching resource:",queueItem.url); 
  		matchedUrl.push(queueItem.url)
  	})


  	var popPath = pathArray[pathArray.length-2];
  	var popPathTwo = pathArray[pathArray.length-1]
  	var referenceCheckOne = req.body.url.slice(0,req.body.url.indexOf(popPath));
  	var referenceCheckTwo = req.body.url.slice(0,req.body.url.indexOf(popPathTwo));


  	setInterval(function(){

  		var filtered = matchedUrl.filter(function(i){
  			return (i.indexOf(referenceCheckOne) > -1)
  		})

  		var filteredTwo = matchedUrl.filter(function(i){
  			return (i.indexOf(referenceCheckTwo) > -1)
  		})

  		if(filteredTwo.length == 0){
  			eventCrawler.stop();
  			res.send(filtered)
  		} else if (filteredTwo.length>=10){
  			eventCrawler.stop();
  			res.send(filteredTwo)
  		} else {
  			console.log('Still checking...')
  		}

  	},20000)

  	eventCrawler.start();
  
});



http.createServer(app).listen(app.get('port'), function(){
  console.log('Express server listening on port ' + app.get('port'));
});
