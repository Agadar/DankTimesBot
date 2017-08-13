# DankTimesBot

This Telegram bot keeps track of 'dank' times such as 13:37 and 04:20, and awards points to users who call them out in chat. This bot is highly configurable, allowing you to define custom 'dank' times, the points awarded for calling them out, the messages the bot sends, and so forth. Developers are encouraged to contribute to this bot to expand it even further.

![alt text](http://i.imgur.com/SMikVxA.png "Logo Title")

---

### Adding DankTimesBot to a Telegram group
1. Make sure you're an administrator of the group.
2. Go to the group's settings.
3. Click on __add members__.
4. In the search bar, search for '__danktimesbot__'.
5. In the search results, click on __DankTimesBot__.
6. Click on __invite__.

The bot should now have been added to the group. Type `/start` to start the bot or `/help` to show the available commands.

---

### Adding DankTimesBot to a Telegram chat
1. In the search bar, search for '__danktimesbot__'.
2. In the global search results, click on __DankTimesBot__.
3. Click on __start__ at the bottom of the opened chat.

You should now have opened a chat with the bot and the bot should have started. Type `/help` to show the available commands.

---

### Hosting and running DankTimesBot yourself
1. Create your own bot via the __BotFather__ following the [official guide](https://core.telegram.org/bots).
2. __Git clone__ or __download__ the version you wish to host to a location of your choosing. If you've downloaded it, make sure to unzip.
3. Install [NodeJS](https://nodejs.org/en/download/) with npm if you haven't already.
4. Install [TypeScript](https://www.typescriptlang.org/#download-links) for transpiling the code to JavaScript.
5. Go to the root of the cloned/downloaded folder.
6. Open a terminal or console, type `npm install`, and hit enter to download the dependencies.
7. Type `npm start` and hit enter. A script will run to transpile the code to JavaScript and launch the bot.
8. You will likely receive an error saying there was no API key found. This refers to the API key supplied to you by the BotFather. You can either insert this key in the newly generated file __config.json__ in the __data__ folder, or you can create an environment variable containing the API key named '__DANK_TIMES_BOT_API_KEY__'.
9. Type `npm start` and hit enter once again. The bot should now be running.

---

### Contributing to DankTimesBot
You can contribute to DankTimesBot in two ways:
1. Creating issues to suggest enhancements and bug fixes;
2. Helping develop the codebase by __forking__ the repository and making a __pull request__.

The workflow for helping develop the codebase is as follows:
* Versioning of DankTimesBot is accomplished via tags on the master branch, e.g. '__v.1.1.0__';
* The master branch always contains the latest stable release;
* Upcoming releases are worked on in seperate develop branches, e.g. '__dev-1.1.0__'. Develop branches should always contain the latest stable version of the corresponding upcoming release;
* Development on individual features and fixes is done in feature branches, e.g. '__dev-1.1.0-#10-add-a-readme.md__';
* Once such a feature or fix is fully implemented and tested, a __pull request__ to the corresponding develop branch may be made. If the request is approved, then the code is pulled;
* Once all of an upcoming release's goals have been reached, its corresponding develop branch is merged to the master branch and a new version tag is added.
