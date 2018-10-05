
/**
 * Module dependencies.
 */

var sys = require('util')
var exec = require('child_process').exec;
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

function getLastWav(){
}

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

function getSampleRate(fn){
    return fn.split("Z_", 2)[1].split(".wav", 1)[0];
}

app.get('/get_res', function (req, res){
    console.log(getLastWav());
    const testFolder = '/home/fychao_tw/ChineseLearnerTool/public/wav';
    const fs = require('fs');
    fs.readdir(testFolder, (err, files) => {
        var fns = new Array();
        files.forEach(file => {
            fns.push(testFolder+"/"+file);
        });
        fns.sort();
        t_file = fns.pop();
        console.log(t_file);
        sampleRate = getSampleRate(t_file);

        cli = "export GCLOUD_PROJECT=voice-214817; export GOOGLE_APPLICATION_CREDENTIALS=/home/fychao_tw/voice4chinese-d0dd7e9b60a1.json; node /home/fychao_tw/nodejs-speech/samples/recognize -r " + sampleRate + " -l zh-TW sync " + t_file;
        console.log(cli);
        dir = exec(cli, function(err, stdout, stderr) {
            if (err) { console.log(stderr); }

            var the_user_input = stdout.replace("Transcription:  ", "");
            cli2 = "/usr/bin/python3 /home/fychao_tw/CKIP_PyCCS.py "+the_user_input.replace(" ", "\ ");
            console.log(cli2);
            dir = exec(cli2, function(err, stdout, stderr) {
                console.log(stdout);
                res.json({ input: the_user_input, proc: stdout });
            });
            //console.log("STDOUT:" +stdout);
            //console.log("ERR:" +err);
            //console.log("STDERR:" +stderr);
        });
    })
});

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
