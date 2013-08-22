Kabam-plugin-private-message
===========================

Kabam plugin for sending and recieving private message

It exposes messages mongoose model
It exposes 3 routes

GET /api/messages?limit=10&offset=0
==========================

Get all recent messages for current authenticated user, in reverse 
chronological order - the most recent messages on top.


GET /api/messages/:username?limit=10&offset=0
==========================

Get all recent messages of dialog between current authenticated user and other one
with :username. Messages are sorted in chronological order - the most recent on top.


POST /api/messages/:username
==========================

Sends the message to :username.
Mandatory parameters are `username` and `message`


When user recieves message, the kabamKernel emits event.

See example

```javascript
MWC.on('notify:pm',function(pm){
      console.log('Sendind email to '+pm.user.username+' with text "' + pm.message+'" from user "'+pm.from.username+'"');
});

```