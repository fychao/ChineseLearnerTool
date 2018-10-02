
/**
 * Module dependencies.
 */

var express = require('express')
  , formidable = require('formidable')
  , fs = require('fs')
  , routes = require('./routes')
  , http = require('http')
  , https = require('https')
  , path = require('path')
  , bodyParser = require('body-parser')
  , favicon = require('serve-favicon')
  , logger = require('morgan')
  , methodOverride = require('method-override');

// Certificate
const privateKey = fs.readFileSync('/etc/letsencrypt/live/chinese.fychao.info/privkey.pem', 'utf8');
const certificate = fs.readFileSync('/etc/letsencrypt/live/chinese.fychao.info/cert.pem', 'utf8');
const ca = fs.readFileSync('/etc/letsencrypt/live/chinese.fychao.info/chain.pem', 'utf8');

const credentials = {
	key: privateKey,
	cert: certificate,
	ca: ca
};

var app = express();

app.set('port', process.env.PORT || 80);
app.set('views', __dirname + '/views');
app.set('view engine', 'jade');
app.use(favicon(__dirname + '/public/images/favicon.png'));
app.use(logger('dev'));
app.use(bodyParser.urlencoded({ extended: false }));
app.use(methodOverride('_method'));
app.use(require('stylus').middleware(__dirname + '/public'));
app.use(express.static(path.join(__dirname, 'public')));

if (app.get('env') == 'development') {
	app.locals.pretty = true;
}

app.get('/', routes.index);
app.post('/upload', function (req, res) {
    var form = new formidable.IncomingForm();
    form.parse(req, function (err, fields, files) {
      var oldpath = files.audio_data.path;
      var newpath = '/home/fychao_tw/ChineseLearnerTool/public/wav/' + files.audio_data.name + ".wav";
      fs.rename(oldpath, newpath, function (err) {
        if (err) throw err;
        res.write('File uploaded and moved!');
        res.end();
      });
    })
});


//http.createServer(app).listen(app.get('port'), function(){
//  console.log("Express server listening on port " + app.get('port'));
//});

https.createServer(credentials, app).listen(443, () => {
	console.log('HTTPS Server running on port 443');
});
