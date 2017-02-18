var request = require('request');
var https = require('https');
var groupId = process.env.groupId;
var botName = process.env.botName;
var botId = process.env.botId;
var botIdAlt = process.env.botIdAlt;
var botResponseTag = 'GIFS = # + (search keyword)\nStocks = $ + (ticker symbol)';
var gifbotTag = '@';

//processes incoming groupme posts
function respond() {
  var post = JSON.parse(this.req.chunks[0]);
  this.res.writeHead(200);
  sendingGroup = post.group_id;
  sendingUser = post.name;
  message = post.text;
  console.log(message + ' : ' + sendingUser);
  if (message.indexOf(gifbotTag + botName) > -1 && message.substring(0,1) !== '#' && message.substring(0,1) !== '$') {
    scanMessage();
  } else {
  console.log('no trigger');
  }
  this.res.end();
}

//checks posts to see if gifbot should respond
function scanMessage() {
  
    //Was @gifbot tagged?
  if (message.indexOf(gifbotTag + botName) >= 0) {
    botResponse = botResponseTag;
    postMessage(botResponse, botId);
  }

  //GIF #
  if (message.substring(0,1) == '#') {
	request('https://api.giphy.com/v1/gifs/translate?s=' + message.substring(1).trim() + '&api_key=dc6zaTOxFJmzC&rating=r', function (error, response, body) {
	parsedData = JSON.parse(body);
	
	if (!error && response.statusCode == 200 && parsedData && parsedData.data.images) {
	  botResponse = parsedData.data.images.downsized.url;
	  postMessage(botResponse, botId);
	} else {
	console.log(message + ' is invalid');
	}
	});
  }

  //STOCK TICKER $
  if (message.substring(0,1) == '$') {
    request('https://query.yahooapis.com/v1/public/yql?q=select%20*%20from%20yahoo.finance.quotes%20where%20symbol%20in%20(%22' + message.substring(1).trim() + '%22)&format=json&diagnostics=true&env=store%3A%2F%2Fdatatables.org%2Falltableswithkeys&callback=', function (error, response, body) {
    parsedData = JSON.parse(body);
    console.log(parsedData.query.results.quote.Name);
    if (!error && response.statusCode == 200) {
      companyName = String(parsedData.query.results.quote.Name);
      lastPrice = Number((parseFloat(parsedData.query.results.quote.LastTradePriceOnly)).toFixed(2));
      change = Number((parseFloat(parsedData.query.results.quote.ChangeinPercent)).toFixed(2));
      if (change > 0) {
	    change = String('+' + change);
      }
      botResponse = (companyName.substring(0,20) + '\n$' + lastPrice + ' | ' + change + 'pct\n' + 'www.finance.yahoo.com/quote/' + message.substring(1).trim());
	  postMessage(botResponse, botId);
    } else {
    console.log(message + ' is invalid');
    } 
    }); 
  }

}

//posts message
function postMessage(botResponse, botId) {
  if (botIdAlt !== null && sendingGroup !== groupId) {
    botId = botIdAlt;
  } else {
  botId = botId;
  }
  var options, botReq;
  options = {
    hostname: 'api.groupme.com',
    path: '/v3/bots/post',
    method: 'POST',
    "bot_id" : botId,
    "text" : botResponse 
  };

  botReq = https.request(options, function(res) {
      if(res.statusCode == 202) {
        console.log('Post success: ' + res.statusCode);
      } else {
      console.log('Bad status code: ' + res.statusCode);
      }
  });
  botReq.end(JSON.stringify(options));
}

exports.respond = respond;