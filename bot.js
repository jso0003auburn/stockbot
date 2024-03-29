var request = require('request');
var https = require('https');
var mebots = require('mebots');

// https://dev.groupme.com/bots
// https://dashboard.heroku.com/apps/groupme-gif-bot/settings
var alphaVantageAPIKey = process.env.alphaVantageAPIKey;
var FinnhubAPIKey = process.env.FinnhubAPIKey;
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

function trimToTicker(text) {
    formattedTicker = text.substring(1);
    formattedTicker = formattedTicker.toUpperCase();
    return formattedTicker
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
      symbolSearch = trimToTicker(message.text);
      console.log(symbolSearch);
      request('https://finnhub.io/api/v1/search?q=' + symbolSearch + '&token=' + FinnhubAPIKey, function (error, response, body) {
      symbolObj = JSON.parse(body);
      //console.log(body);
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
      symbolSearch = trimToTicker(message.text);
      console.log(symbolSearch);
      request('https://finnhub.io/api/v1/quote?symbol=' + symbolSearch + '&token=' + FinnhubAPIKey, function (error, response, body) {
      quoteObj = JSON.parse(body);
      console.log(body);
      assembleStockPost(message, symbolObj, quoteObj);
      //console.log(response);
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
    symbolSearch = trimToTicker(message.text);
    name = "N/A"
    json = symbolObj['result']
    json.forEach((item) => {
      if (item.symbol == symbolSearch){
      name = item.description;
      console.log('SYMBOL: ' + item.symbol);
      console.log('DISPLAYSYMBOL: ' + item.displaySymbol);
      console.log('DESCRIPTION: ' + item.description);
      console.log('TYPE: ' + item.type);
      }

    });
  } catch (e) {
      name = "N/A"
      //postGoAhead = "no symbolObj";
      //console.log(e);
  }
  
  
  try {
      open = Number(quoteObj['o']);
      //console.log('open:');
      //console.log(open);

      price = Number(quoteObj['c']);
      priceString = parseFloat(price).toFixed(2);
      priceString = priceString.toString();
      //console.log('price:');
      //console.log(price);
      
      previousClose = quoteObj['pc'];
      change = (((Number(price) / Number(previousClose))-1)*100);
      change = change.toFixed(2);
      //console.log('change:');
      //console.log(change);
      
      if (open == 0) {
        postGoAhead = "No price returned for that ticker";
        console.log("check if there's a price" + postGoAhead);
      }
      
      percent = '\uFF05';      
      if (price < Number(previousClose)) {
        change = '🔽 ' + change + percent;
        chart = '📉';
      } else {
        change = '🔼 ' + change + percent;
        chart = '📈';
      }
  } catch (e) {
      postGoAhead = "no quoteObj";
      console.log(e);
  }
  
  
  if (postGoAhead == "yes") {
    console.log("SUCCESS: " + postGoAhead);
    botResponse = ('💵 $' + priceString + '\n' + change + '\n' + chart + ' https://finance.yahoo.com/quote/' + trimToTicker(message.text) + '\n' + name);
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
