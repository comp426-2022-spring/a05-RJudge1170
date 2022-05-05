// Place your server entry point code here
//installed fs, http, minimist, express, morgan

// Require minimist module
const args = require('minimist')(process.argv.slice(2))
// See what is stored in the object produced by minimist
console.log(args)
// Store help text 
const help = (`
server.js [options]

--port	Set the port number for the server to listen on. Must be an integer
            between 1 and 65535.

--debug	If set to true, creates endlpoints /app/log/access/ which returns
            a JSON access log from the database and /app/error which throws 
            an error with the message "Error test successful." Defaults to 
            false.

--log		If set to false, no log files are written. Defaults to true.
            Logs are always written to database.

--help	Return this message and exit.
`)
// If --help or -h, echo help text to STDOUT and exit
if (args.help || args.h) {
    console.log(help)
    process.exit(0)
}

const express = require('express')
const req = require('express/lib/request')
const app = express()

app.use(express.urlencoded({ extended: true }));
app.use(express.json());

const logdb = require('./src/services/database.js')

const morgan = require('morgan')

const fs = require('fs')

app.use(express.json())
app.use(express.urlencoded({extended: true}))

const logging = (req, res, next) => {
    console.log(req.body.number)
    next()
}

args["port"]

const port = args.port || 5555

const server = app.listen(port, () => {
    console.log('App is running on port %PORT%'.replace('%PORT%', port))
})

app.use(express.static('./public'));

function coinFlip() {
  
    let x = Math.floor(Math.random() * 10);
  
    if (x < 5) {
      return 'heads';
    } else {
      return 'tails';
    }
}

function coinFlips(flips) {
    const resultArray = new Array();
  
    for (let i = 0; i < flips; i++) {
  
      resultArray[i] = coinFlip();
  
    }
  
    return resultArray;
}

function countFlips(array) {
    let tailsCount = 0;
    let headsCount = 0;

    for (let i = 0; i < array.length; i++) {

      if (array[i] === 'heads') {
        headsCount++;
      } else {
        tailsCount++;
      }

    }
    
    if (tailsCount > 0 && headsCount === 0) {

      return { tails: tailsCount};

    }

    if (headsCount === 0 && headsCount > 0) {

      return { heads: headsCount };

    }

    var returnObj = { tails: tailsCount, heads: headsCount }

    return returnObj;

}

function flipACoin(call) {

    let flipResult = coinFlip();
  
    if (flipResult === call) {
      return {call: call, flip: flipResult, result: 'win'};
    } else {
      return {call: call, flip: flipResult, result: 'lose'};
    }
  
}

// Use morgan for logging to files
// Create a write stream to append (flags: 'a') to a file
const WRITESTREAM = fs.createWriteStream('accesslog', { flags: 'a' })
// Set up the access logging middleware
app.use(morgan('combined', { stream: WRITESTREAM }))

app.use( (req, res, next) => {
    let theLog = {

        remoteaddr: req.ip,
        remoteuser: req.user,
        time: Date.now(),
        url: req.url,
        protocol: req.protocol,
        httpversion: req.httpVersion,
        status: req.statusCode,
        referer: req.headers['referer'],
        useragent: req.headers['user-agent']

    }

    const logit = logdb.prepare('INSERT INTO accesslog (remote_addr, remote_user, datetime, url, http_version, status, referrer_url, user_agent) VALUES (?, ?, ?, ?, ?, ?, ?, ?)');
    const runit = logit.run(theLog.remoteaddr, theLog.remoteuser, theLog.time, theLog.url, theLog.httpversion, theLog.status, theLog.referer, theLog.useragent);
    next();
});

app.get('/app/error', (req, res) => {
  throw new Error('Error test successful.')
})

app.get('/app', (req, res) => {
    res.type('text/plain')
    res.status(200).end('OK')
})

app.get('/app/log/access', (req, res) => {
    const out = logdb.prepare('SELECT * FROM accesslog').all()
    res.status(200).json(out)
})

app.get('/app/echo/:number', express.json(), (req, res) => {
    res.status(200).json({ 'message' : req.params.number })
})

// app.get('/app/echo/', (req, res) => {
   // res.status(200).json({ 'message' : req.query.number })
// })

app.get('/app/echo/', logging, (req, res) => {
    res.status(200).json({ 'message' : req.body.number })
})

app.get('/app/flip', (req, res) => {
    res.status(200).json({ 'flip' : coinFlip() })
})

app.get('/app/flips/:number', (req, res) => {

    let array = coinFlips(req.params.number);

    res.status(200).json({ 'raw' : array, 'summary' : countFlips(array) })
})

app.get('/app/flip/call/:call', (req, res) => {
    res.status(200).json( flipACoin(req.params.call) )
})

app.use(function(req, res) {
    res.type("text/plain")
    res.status(404).send("Endpoint does not exist")
})