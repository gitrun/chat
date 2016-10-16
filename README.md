gitchat
=======

[![Chat](http://chat.gitrun.com/images/gitchat-badge.svg)](http://chat.gitrun.com/room/gitrun/chat/17)

Chat application build on top of GitHub API. It was build in 24 hours during Berlin LinkedIn

Hackathon (October 2012).

We are using [GitHub Issues API](http://developer.github.com/v3/issues/) and [web hooks](http://developer.github.com/v3/repos/hooks/).

After receiving webhook server code will broacast message to other people in the room.


# Protocol

Protocol is super simple:

  * github issue is a room.
  * github issue comment is a message inside the room.


# Tools

Build using Node.js, Socket.io, jQuery. Hosted on [Heroku](https://heroku.com).


# Demo

Checkout this [Berlin Hackathon Room](http://chat.gitrun.com/room/gitrun/chat/4) for chat room of hackers.

Or you can try it by downloading code locally and running it with following commands:

```
 npm install
 npm start
```
Then just open [http://localhost:3000/](http://localhost:3000/) in your browser.

Note that real-time updates will not work since web hooks will not work with local servers.


# Run yourself locally

If you want to run this app locally do following:

```
  git clone https://github.com/gitrun/chat/
  cd chat
  npm install
```  

There is a configuration file with GitHub clientID and clientSecret in the `configs/development.config.json`.
You can keep it as is and just run `npm start`. It will use default GitHub app created by me.

You can also create your own GitHub application on https://github.com/settings/developers. Please specify callback URL as http://localhost:3000/auth/callback and copy new clientID and clientSecret into the `configs/development.config.json`.

Run `npm start` and visit `http://localhost:3000/`.
You can verify that everything works if you can open `http://localhost:3000/room/gitrun/chat/4` and click "Join!" button in the top right corner.


# Run yourself on Heroku

If you want to run this app on Heroku do following:

```
  git clone https://github.com/gitrun/chat/
  cd chat
  npm install
```  

There is a configuration file with GitHub clientID and clientSecret in the `configs/development.config.json`.
You can keep it as is and proceed further or you can also create your own GitHub application on https://github.com/settings/developers. Please copy new clientID and clientSecret into the `configs/development.config.json`.

In order to continue with Heroku you need to install [Toolbelt](https://devcenter.heroku.com/articles/getting-started-with-nodejs#set-up).
Then in the chat directory do `heroku create` as mentioned [here](https://devcenter.heroku.com/articles/getting-started-with-nodejs#deploy-the-app) and then `git push heroku master`.
At this point Heroku will create new URL for your app (something like http://sharp-rain-871.herokuapp.com/). If you decided to use your own GitHub App you need to update callback URL to the one created by Heroku. Please update this URL in both `configs/development.config.json` and on GitHub settings page for your application.


# Features

Chat app has following cool features:

  * desktop notifications
  * email notifications
  * real-time updates (you get all new messages in room immediately)
  * multiple rooms support
  * unlimited amount of users inside the room
  * private rooms support (just create an issue in private repository)

# How to

To create new chat room just create new issue in your own repository.
Then just type following url in browser:

```
  http://chat.gitrun.com/room/#{USER_NAME}/#{REPO_NAME}/#{ISSUE_ID}
```
where:
  * `#{USER_NAME}` - username of orgnisation name that holds the GitHub repo where you created issue.
  * `#{REPO_NAME}` - GitHub repo name where you created issue.
  * `#{ISSUE_ID}` - id of issue you just created on GitHub. It's the last token of URL for that issue.


## License
==========

(The MIT License)

Copyright © 2013-2014 Hashobject Ltd (team@hashobject.com).

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the 'Software'), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED 'AS IS', WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
