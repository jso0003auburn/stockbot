var request = require('request');
var https = require('https');
var mebots = require('mebots');

// https://dev.groupme.com/bots
// https://dashboard.heroku.com/apps/groupme-gif-bot/settings
//var alphaVantageAPIKey = process.env.alphaVantageAPIKey;
var alphaVantageAPIKey = process.env.alphaVantageAPIKey;
var bot = new mebots.Bot('stockbot', process.env.botToken);



// Process incoming groupme messages
function respond() {
    try {
        var message = JSON.parse(this.req.chunks[0]);
    } catch (e) {
        console.log('Invalid JSON passed.');
    }
    this.res.writeHead(200);

    console.log('@' + message.name + ': ' + message.text + ' in: ' + message.group_id);
    if (message.sender_type != 'bot') {
        tagCheck(message);
    }

    this.res.end("OK");
}


function trim(text) {
    return text.substring(1).trim();
}


function tagCheck(message) {
    // Was the bot tagged?
    if (message.text.toLowerCase().indexOf('@stockbot') >= 0) {
        botTag(message);
    }

    // GIF #
    if (message.text.substring(0,1) == '$') {
        stockTag(message);
    }
}


// If the bot was tagged
function botTag(message) {
    botResponse = 'try one of these:\n$MSFT - Microsoft\n$^GSPC - S&P500\n$^DJI - Dow Jones\n$aapl - 🍏\nhttps://mebotsco.herokuapp.com/bot/stockbot';
    postMessage(botResponse, message.group_id);
}


//stock quote
function stockTag(message) {
  
  
  try {
      request('https://www.alphavantage.co/query?function=SYMBOL_SEARCH&keywords=' + trim(message.text) + '&apikey=' + alphaVantageAPIKey, function (error, response, body) {
      symbolObj = JSON.parse(body);
      symbol = (symbolObj['bestMatches'][0]['1. symbol']);
      name = (symbolObj['bestMatches'][0]['2. name']);
      console.log(symbol);
      console.log(name);
      });
  } catch (e) {
      console.log("entering catch block");
      console.log(e);
      console.log("leaving catch block"); 
  }
  
  try {
      request('https://www.alphavantage.co/query?function=GLOBAL_QUOTE&symbol=' + trim(message.text) + '&outputsize=compact&apikey=' + alphaVantageAPIKey, function (error, response, body) {
      quoteObj = JSON.parse(body);
      
      
      open = Number(quoteObj['Global Quote']['02. open']);
      price = Number(quoteObj['Global Quote']['05. price']);
      price = parseFloat(price).toFixed(2);
      price = price.toString();
      lastRefreshed = quoteObj['Global Quote']['07. latest trading day'];
      change = quoteObj['Global Quote']['10. change percent'].slice(0,-3);
      percent = '\uFF05';
      change = Number(change);
      if (quoteObj['Global Quote']['10. change percent'].substring(0,1) == '-') {
        change = '🔽 ' + change + percent;
        chart = '📉';
      } else {
        change = '🔼 ' + change + percent;
        chart = '📈';
      }

      });
  } catch (e) {
    console.log("entering catch block");
    console.log(e);
    console.log(message.text + ' is invalid');
    console.log("leaving catch block");
  }
      
  botResponse = ('💵 $' + price + '\n' + change + '\n' + chart + ' https://finance.yahoo.com/quote/' + trim(message.text));
  postMessage(botResponse, message.group_id);
      

  
  
  
  
  
}

// Post message
function postMessage(text, groupID) {
    bot.getInstance(groupID).then((instance) => {
        var options, botReq;
        options = {
            hostname: 'api.groupme.com',
            path: '/v3/bots/post',
            method: 'POST',
            'bot_id': instance.id,
            'text': text
        };

        botReq = https.request(options, function(res) {
            if(res.statusCode == 202) {
                console.log('LOG: GroupMe SUCCESS: ' + res.statusCode + ' in group: ' + groupID + ' - ' + text);
            } else {
                console.log('LOG: GroupMe ERROR: ' + res.statusCode + ' in group: ' + groupID + ' - ' + text);
            }
        });
        botReq.end(JSON.stringify(options));
    });
}

exports.respond = respond;
