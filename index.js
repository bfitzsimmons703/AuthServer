const express = require('express'),
      http = require('http'),
      bodyParser = require('body-parser'),
      mongoose = require('mongoose'),
      morgan = require('morgan');

const app = express();
const router = require('./router');

//Express Setup
app.use(morgan('tiny')); //logs incoming requests. Good for debugging
app.use(bodyParser.json({type: '*/*'})); //parses incoming requests into JSON, no matter what the request type is in this case
router(app);

//Connect Mongoose to MongoDB
const MONGO_URL = 'mongodb://USER:PASSWORD@ds161210.mlab.com:61210/react_redux_auth';
mongoose.connect(MONGO_URL);
mongoose.connection
    .once('open', () => console.log('MongoLab is up Lord Commander.'))
    .on('error', error => console.log('Error connecting to MongoLab:', error));

//Server Setup
const PORT = process.env.PORT || 3000;

const server = http.createServer(app);
server.listen(PORT);
console.log('Server up and running Lord Commander!');
