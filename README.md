gitchat
=======

Chat application build on top of GitHub API.

We are using GitHub issues API and web hooks. 
After receiving webhook server code will broacast message to other people in the room.


Protocol:
  github issue is a room.
  github issue comment is a message inside the room.
  
Multiple rooms support for free.
Unlimited amount of private rooms (just create an issue in private repository).


Build using Node.js.

### License

MIT
