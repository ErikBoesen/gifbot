## GroupMe Gif Bot
  * add this bot to your groupme group chat to provide GIFs or stock prices when summoned

## Post #lol or #happy birthday for a GIF
  <img src="https://i.imgur.com/ztk71Bj.jpg" alt="gifs" width="400"/>

## Post $BAC or $MSFT for a stock quote
  <img src="https://i.imgur.com/CHq3CVO.jpg" alt="stocks" width="400"/>

## Requirements:
  * GroupMe dev account [dev.GroupMe](https://dev.groupme.com/session/new),
  	* Create a bot and set your callback URL to your heroku app domain (your-heroku-app-name.herokuapp.com) 	
  * Heroku account [Heroku](http://heroku.com).
  	* use Heroku config vars to set the following (all variables come from dev.groupme.com)
  	<img src="https://i.imgur.com/CHq3CVO.jpg" alt="variables" width="400"/>

  	  * botName = gifbot (set this in heroku and dev.groupme.com)
      * botIdMain = bot id for your main group (from dev.groupme.com)
      * groupNameMain = name of your main group
      * ratingMain = determines the gif rating from giphy, options are: "r" or "pg-13" or "pg" or "g"
      * groupIdMain = group id for your main group (from dev.groupme.com)
      
      * botIdTest = bot id for your Test group (from dev.groupme.com)
      * groupNameTest = name of your Test group
      * ratingTest = determines the gif rating from giphy, options are: "r" or "pg-13" or "pg" or "g"
      * groupIdTest = group id for your Test group (from dev.groupme.com)

  * AlphaVantage API key for stock Quotes [AlphaVantage](https://www.alphavantage.co/).
      * alphaVantageAPIKey = API key for stock quotes

## Useful Heroku Command Line Tools
  * git add .
  * git commit -m "comment here"
  * git push -f heroku
  * heroku ps
  * heroku logs
  * heroku logs --source app
  * heroku logs --app groupme-gif-bot --source app --tail
  
## Contact

john.stephen.olson@gmail.com


