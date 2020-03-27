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
        stockNameCheck(message);
    }
}


// If the bot was tagged
function botTag(message) {
    botResponse = 'try one of these:\n$MSFT - Microsoft\n$^GSPC - S&P500\n$^DJI - Dow Jones\n$aapl - 🍏\nhttps://mebotsco.herokuapp.com/bot/stockbot';
    postMessage(botResponse, message.group_id);
}



function stockNameCheck(message) {
  try {
      request('https://www.alphavantage.co/query?function=SYMBOL_SEARCH&keywords=' + trim(message.text) + '&apikey=' + alphaVantageAPIKey, function (error, response, body) {
      symbolObj = JSON.parse(body);
      stockPriceCheck(message, symbolObj);
      });
  } catch (e) {
      console.log("entering catch block");
      console.log(e);
      console.log("leaving catch block"); 
  }
}

function stockPriceCheck(message, symbolObj) {
  try {
      request('https://www.alphavantage.co/query?function=GLOBAL_QUOTE&symbol=' + trim(message.text) + '&outputsize=compact&apikey=' + alphaVantageAPIKey, function (error, response, body) {
      quoteObj = JSON.parse(body);
      assembleStockPost(message, symbolObj, quoteObj);

      });
  } catch (e) {
      console.log("entering catch block");
      console.log(e);
      console.log("leaving catch block"); 
  }
}


function assembleStockPost(message, symbolObj, quoteObj) {
  postGoAhead = "yes";
    
      
  try {
      symbol = (symbolObj['bestMatches'][0]['1. symbol']);
      name = (symbolObj['bestMatches'][0]['2. name']);
      symbolTwo = (symbolObj['bestMatches'][1]['1. symbol']);
      nameTwo = (symbolObj['bestMatches'][1]['2. name']);
      console.log(symbol);
      console.log(name);
      console.log(symbolTwo);
      console.log(nameTwo);
  } catch (e) {
      postGoAhead = "no symbolObj";
      //console.log(e);
  }
  
  
  try {
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
  } catch (e) {
      postGoAhead = "no quoteObj";
      //console.log(e);
  }
  
  
  if (postGoAhead == "yes") {
    console.log("SUCCESS: " + postGoAhead);
    botResponse = ('💵 $' + price + '\n' + change + '\n' + chart + ' https://finance.yahoo.com/quote/' + trim(message.text) + '\n' + name);
    postMessage(botResponse, message.group_id);
  } else {
    console.log("ERROR: " + postGoAhead);
  }


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
