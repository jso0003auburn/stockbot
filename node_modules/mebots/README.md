# mebots
[![NPM package summary for markipsum](https://nodei.co/npm/markipsum.png)](https://nodei.co/npm/markipsum)

> A JavaScript interface to the [MeBots](http://mebots.co) [API](http://mebots.co/documentation).

## Usage
First install with `npm` or your favorite package manager:
```sh
npm install mebots
```

Import into your project:
```js
const mebots = require('mebots');
// Alternative:
const Bot = require('mebots').Bot;
// If you choose this option, simply instantiate the bot as `new Bot(...)` below.
```

Instantiate your bot by passing the shortname and token:
```js
// var or let should work too
const bot = mebots.Bot('your_bot_shortname', 'token (at top of page while editing your bot)')
```
You will likely want to store the token in an environment variable or config file of some sort. At any rate, don't commit it to GitHub! :)

Finally, use a promise structure to fetch the instance and post a message, using the `id` field to fulfill the `bot_id` key as discussed in GroupMe's documentation [here](https://dev.groupme.com/docs/v3#bots_post)!

```js
bot.getInstance(receivedGroupId).then((instance) => {
    options = { // the parameters you're passing to
        // ...
        'bot_id': instance.id,
    };
    // Perform request just like you normally would!
});
```
Feel free to open an issue if you need help!

## Authorship
[Erik Boesen](https://github.com/ErikBoesen)
