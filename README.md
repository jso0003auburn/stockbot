## GroupMe stockbot
  * add this bot to your groupme group chat to provide stock prices when summoned
  * You can use [MeBots](https://mebotsco.herokuapp.com/) to simply add this bot to your own GroupMe group or feel free to reuse code as necessary to run it yourself
    * [Add stockbot directly to your group using MeBots](https://mebotsco.herokuapp.com/bot/stockbot)
    * Huge thanks to [Erik Boesen](https://github.com/ErikBoesen) for helping me clean things up and integrate into [MeBots](https://mebotsco.herokuapp.com/)

## Post $MSFT or $bac for a stock price
  <img src="https://i.groupme.com/750x1334.jpeg.dce68ae7dec54487b658771436ed0127" alt="gifs" width="300"/>

## Requirements:
  * GroupMe dev account [dev.GroupMe](https://dev.groupme.com/session/new)
  	* Create a bot and set your callback URL to your heroku app domain (your-heroku-app-name.herokuapp.com)
  	* This is managed within [MeBots](https://mebotsco.herokuapp.com/)
  * Heroku account [Heroku](http://heroku.com)
    * Only if you want to host the bot yourself


## Useful Heroku Commands
Install Homebrew (`brew`) and install Heroku CLI(https://devcenter.heroku.com/articles/heroku-cli#download-and-install)
```sh
git add .
git commit -m "comment here"
git push -f heroku
heroku ps
heroku logs
heroku logs --source app
heroku logs --app groupme-gif-bot --source app --tail
```

## Contact

john.stephen.olson@gmail.com
