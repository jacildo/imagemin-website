"use strict";

const express = require('express');
const bodyParser = require('body-parser');
const path = require('path');
const fs = require('fs');
const Busboy = require('busboy');
const app = express();
const port = 3000;

require('./src/extensions/Number.js');

// image compression packages
const imagemin = require('imagemin');
const imageminJpegtran = require('imagemin-jpegtran'); // lossless
const imageminJpegoptim = require('imagemin-jpegoptim');
const imageminPngquant = require('imagemin-pngquant');

const uploadDir = path.join(__dirname, "public", "uploads");
const downloadDir = path.join(__dirname, "public", "downloads");

app.use(express.static('public'));

app.use(bodyParser.json())
app.use(bodyParser.urlencoded({ 
    extended: false,
    limit: '500mb'
}))

app.get('/', (req, res) => 
    res.sendFile(path.join(__dirname, "public", "index.html")));

app.get('/api/downloads', (req, res) => {
    return res.json({dir: downloadDir})
});

app.post('/api/clean', (req, res) => {
    removeFiles(downloadDir);
    removeFiles(uploadDir);
    res.send(200);
});

app.post('/api/image', (req, res) => {
    console.log("Request received");

    var busboy = new Busboy({ headers : req.headers });
    var filePath;
    var fileType;
    var quality = req.body.quality || 100;

    // rename the file if it has parentheses. writefile doesnt like parentheses
    busboy.on('field', function (fieldname, val) {

    });

    busboy.on('file', function (fieldname, file, filename, encoding, mimetype) {
        console.log("Uploading: " + filename + " of type " + mimetype);

        fileType = mimetype;
        filePath = path.join(uploadDir, filename).replace(/[\(\)]/g, '');
        
        var regexp = /([\w\d\(\)\s_-]+)(\.\d\d\d)?(\.[\w\d]+)$/i;

        let tries = 0;
        while(fs.existsSync(filePath) && tries < 100){
            filename = filename.replace(regexp, renameDuplicate);
            console.log(`Renamed to ${filename}`)
            filePath = path.join(uploadDir, filename).replace(/[\(\)]/g, '');
            tries++;
        }

        if(tries >= 100) {
            console.log('Exceeded maximum tries. Stopped processing image.')
            return res.json({status: "Exceeded maximum tries. "});
        }

        // can't write files with parentheses
        var fstream = fs.createWriteStream(filePath);
        file.pipe(fstream);
    });

    busboy.on('finish', function () {
        console.log(`Upload done... Starting compression at quality ${quality}.`);

        if(fileType === 'image/jpeg') {
            imagemin([filePath], './public/downloads', {
                use: [imageminJpegoptim({
                    max: quality
                })]
            }).then(() => {
                console.log(`image optimized: ${filePath}`);
            });
        }
        
        if(fileType === 'image/png') {
            imagemin([filePath], './public/downloads', {
                use: [imageminPngquant()]
            }).then(() => {
                console.log(`image optimized: ${filePath}`);
            });
        }

        return res.json({ status: 'OK' });
    });

    return req.pipe(busboy);

});

app.listen(port, () => 
    console.log(`Example app listening on port ${port}!`));


function minify(file, cb) {

}

function removeFiles(directory) {
    fs.readdir(directory, (err, files) => {
        if (err) throw err;
      
        for (const file of files) {
            console.log(`removing file: ${path.join(directory, file)}`);
            fs.unlink(path.join(directory, file), err => {
                if (err) throw err;
            });
        }
    });
}

function renameDuplicate (match, p1, p2, p3) {
    if (p2 === void 0)
      return `${p1}.${(1).pad(3)}${p3}`;
    else {
      var version = '.' + (parseInt(p2.substring(1,4)) + 1).pad(3);
      return `${p1}${version}${p3}`;
    }
  }