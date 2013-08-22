var sanitaze = require('validator').sanitize;

exports.name = 'kabamPluginPrivatMessage';
exports.model = {
  'private_messages': function (mongoose, config) {
    var messageSchema = new mongoose.Schema({
      'to': mongoose.Schema.Types.ObjectId,
      'from': mongoose.Schema.Types.ObjectId,
      'created_at': { type: Date, default: Date.now },
      'message': {type: String, trim: true } //trim whitespaces - http://mongoosejs.com/docs/api.html#schema_string_SchemaString-trim
    });

    messageSchema.index({
      to: 1,
      from: 1,
      created_at: 1
    });

    return mongoose.model('private_messages', messageSchema);
  }
};

exports.routes = function (kabam) {
  kabam.app.get('/api/messages', function (request, response) {
    if (request.user) {
      var mesgLimit = request.query['limit'] ? request.query['limit'] : 10,
        mesgOffset = request.query['offset'] ? request.query['offset'] : 0;
      request.model.private_messages
        .find({'to': request.user._id})
        .skip(mesgOffset)
        .limit(mesgLimit)
        .exec(function (err, messages) {
          if (err) {
            throw err;
          }
          response.json(messages);
        });
    } else {
      response.send(400);
    }
  });
  kabam.app.get('/api/messages/:username', function (request, response) {
    if (request.user) {
      var mesgLimit = request.query['limit'] ? request.query['limit'] : 10,
        mesgOffset = request.query['offset'] ? request.query['offset'] : 0;

      request.model.User.findOneByLoginOrEmail(request.params.username, function (err, userFound) {
        if (err) {
          throw err;
        }
        if (userFound) {
          request.model.private_messages
            .find({
              $or: [
                {'to': request.user._id, 'from': userFound._id},
                {'from': request.user._id, 'to': userFound._id}
              ]
            })
            .skip(mesgOffset)
            .limit(mesgLimit)
            .exec(function (err, messages) {
              if (err) {
                throw err;
              }
              response.json(messages);
            });
        } else {
          response.send(404);
        }
      });
    } else {
      response.send(400);
    }
  });


  kabam.app.post('/api/messages/:username', function (request, response) {
    if (request.user) {
      var text = sanitaze(request.body.text).xss(true); //https://npmjs.org/package/validator - see xss
      request.model.User.findOneByLoginOrEmail(request.body.username, function (err, userFound) {
        if (err) {
          throw err;
        }
        if (userFound) {
          request.model.private_messages.create({
            from : request.user._id,
            to : userFound._id,
            message: text
          },function(err,messageCreated){
            if(err) throw err;
            response.send(201);
          });
        } else {
          response.send(404);
        }
      });
    } else {
      response.send(400);
    }
  });
};