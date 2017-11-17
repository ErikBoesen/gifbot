var request = require('request');
var https = require('https');
var botName = process.env.botName;
var groupIdMain = process.env.groupIdMain;
var botIdMain = process.env.botIdMain;
var groupIdAlt = process.env.groupIdAlt;
var botIdAlt = process.env.botIdAlt;


//processes incoming groupme posts
function respond() {
  var post = JSON.parse(this.req.chunks[0]);
  this.res.writeHead(200);
  botId = '1';
  sendingGroup = post.group_id;
  sendingUser = post.name;
  message = post.text;

  //From the main group?
  if (sendingGroup == groupIdMain) {
    botId = botIdMain;
  }
  
  //from the alt group?
  if (sendingGroup == groupIdAlt) {
    botId = botIdAlt;
  }
  
  //from an unrecognized group?
  if (botId == '1') {
    console.log(message + ' sent without a valid group id from: ' + sendingGroup);
  }

  //Was the bot tagged?
  if (message.indexOf('@' + botName) >= 0 && botId !== '1') {
    botTag(botId);
  }

  //GIF #
  if (message.substring(0,1) == '#' && botId !== '1') {
    gifTag(botId);
  }

  //STOCK TICKER $
  if (message.substring(0,1) == '$' && botId !== '1') {
    stockTag(botId);
  }  
  console.log(sendingUser + ' : ' + message);
  this.res.end();
}

//if @gifbot was tagged this will post a help message
function botTag(botId) {
  botResponse = 'GIFS = # + (search keyword)\nStocks = $ + (ticker symbol)';
  deets = 'gifbot';
  postMessage(botResponse, botId);
}

//posts message
function gifTag(botId) {
  request('https://api.giphy.com/v1/gifs/translate?s=' + message.substring(1).trim() + '&api_key=dc6zaTOxFJmzC&rating=r', function (error, response, body) {
  parsedData = JSON.parse(body);
  
  if (!error && response.statusCode == 200 && parsedData && parsedData.data.images) {
	botResponse = parsedData.data.images.downsized.url;
	deets = ('gif size: ' + String(Math.ceil(parsedData.data.images.downsized.size/1000)).replace(/(.)(?=(\d{3})+$)/g,'$1,') + 'kB');
	postMessage(botResponse, botId);
  } else {
  console.log(message + ' is invalid');
  }
  });
}

//posts message
function stockTag(botId) {
  request('https://query.yahooapis.com/v1/public/yql?q=select%20*%20from%20yahoo.finance.quotes%20where%20symbol%20in%20(%22' + message.substring(1).trim() + '%22)&format=json&diagnostics=true&env=store%3A%2F%2Fdatatables.org%2Falltableswithkeys&callback=', function (error, response, body) {
  parsedData = JSON.parse(body);
  if (parsedData.query.results.quote.Name == undefined || parsedData.query.results.quote.Name == null) {
	console.log(message + ' is invalid');
  } else {
  companyName = String(parsedData.query.results.quote.Name);
  companyName = companyName.substring(0,15);
  deets = companyName;
  lastPrice = Number((parseFloat(parsedData.query.results.quote.LastTradePriceOnly)).toFixed(2));
  change = Number((parseFloat(parsedData.query.results.quote.PercentChange)).toFixed(2));
  if (change > 0) {
    change = String('+' + change);
  }
  botResponse = (companyName + '\n$' + lastPrice + ' / ' + change + '\n' + 'www.finance.yahoo.com/quote/' + message.substring(1).trim());
  postMessage(botResponse, botId);  } 
  }); 
}

//posts message
function postMessage(botResponse, botId) {
  

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
        console.log('Post success: ' + res.statusCode + ' ' + deets);
      } else {
      console.log('Bad status code: ' + res.statusCode);
      }
  });
  botReq.end(JSON.stringify(options));
}

exports.respond = respond;
