var request = require('request');
var https = require('https');

//scan messages
function respond() {
  var request = JSON.parse(this.req.chunks[0]);
  trigger = request.text.substring(0,1);
  searchTerm = request.text.substring(1).trim();
  botNameTagCheck = request.text.indexOf('@' + process.env.botName);
  if (request.group_id == process.env.groupId && request.name != process.env.botName) {
    botId = process.env.botId;
    console.log('MESSAGE: ' + request.name + ' : ' + request.text);
    checkMessage(trigger, botNameTagCheck, searchTerm, botId);
  } else if (process.env.botIdAlternate != null) {
  botId = process.env.botIdAlternate;
  console.log('TEST: ' + request.name + ' : ' + request.text);
  checkMessage(trigger, botNameTagCheck, searchTerm, botId);
  }
}

//check for triggers
function checkMessage() {
  
  //HELP ?
  if (trigger == '?' || botNameTagCheck >= 0) {
    postMessage('Need help?\nStocks = $ + (ticker symbol)\nGIFS = # + (search keyword)\nTag me to see this again', botId);
  }

  //GIF #
  if (trigger == '#') {
	request('https://api.giphy.com/v1/gifs/translate?s=' + searchTerm + '&api_key=dc6zaTOxFJmzC&rating=r', function (error, response, body) {
	parsedData = JSON.parse(body);
	if (!error && response.statusCode == 200 && parsedData && parsedData.data.images) {
	postMessage(parsedData.data.images.downsized.url, botId);
	} else {
	postMessage('"' + searchTerm + '" is invalid\nType "?" for help', botId);
	}
	});
  }

  //STOCK TICKER $
  if (trigger == '$') {
	  request('https://query.yahooapis.com/v1/public/yql?q=select%20*%20from%20yahoo.finance.quotes%20where%20symbol%20in%20(%22' + searchTerm + '%22)%0A%09%09&env=http%3A%2F%2Fdatatables.org%2Falltables.env&format=json', function (error, response, body) {
	  parsedData = JSON.parse(body);   
	  last = parseFloat(parsedData.query.results.quote.LastTradePriceOnly);
	  last = Number((last).toFixed(2));   
	  change = parseFloat(parsedData.query.results.quote.ChangeinPercent);
	  change = Number((change).toFixed(2));
	  name = String(parsedData.query.results.quote.Name);
	  if (change > 0) {
		change = String('+' + change);
	  }
	  if (!error && response.statusCode == 200 && name !== 'null' && name !== 'undefined') {
		postMessage(name.substring(0,23) + '\n$' + last + ' | ' + change + 'pct\n' + 'www.finance.yahoo.com/quote/' + searchTerm, botId);
	  } else {
	  postMessage('"' + searchTerm + '" is invalid\nType "?" for help', botId);
	  } 
	  }); 
  }
}

//Post message
function postMessage(botResponse, botId) {
  var options, body, botReq;
  options = {
    hostname: 'api.groupme.com',
    path: '/v3/bots/post',
    method: 'POST'
  };

  body = {
    "bot_id" : botId,
    "text" : botResponse 
  };

  botReq = https.request(options, function(res) {
      if(res.statusCode == 202) {
        console.log('Post success ' + res.statusCode);
      } else {
      console.log('Bad status code ' + res.statusCode);
      }
  });
  botReq.on('error', function(err) {
    console.log('error posting message '  + JSON.stringify(err));
  });
  botReq.on('timeout', function(err) {
    console.log('timeout posting message '  + JSON.stringify(err));
  });
  botReq.end(JSON.stringify(body));
}

exports.respond = respond;