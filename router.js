
/*

  Copyright 2017 Emil Hemdal (https://emil.hemdal.se/) and
    Datateknologsektionen Chalmers Studentkår (https://www.dtek.se/)

  This file is part of tv.dtek.se.

  tv.dtek.se is free software: you can redistribute it and/or modify
  it under the terms of the GNU Affero General Public License as published by
  the Free Software Foundation, either version 3 of the License, or
  (at your option) any later version.

  tv.dtek.se is distributed in the hope that it will be useful,
  but WITHOUT ANY WARRANTY; without even the implied warranty of
  MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
  GNU Affero General Public License for more details.

  You should have received a copy of the GNU Affero General Public License
  along with tv.dtek.se.  If not, see <http://www.gnu.org/licenses/>.

*/

const config = require('./config.json');

const updateJSON = require('./updateJSON.js');

const http = require('http');

const fs = require('fs');

const express = require('express');

let mysql = require('mysql');

// Probably overkill using connectionpooling here!
let pool = mysql.createPool(config.mysql);

const bodyParser = require('body-parser');

const multiparty = require('multiparty');

const moment = require('moment');

const crypto = require('crypto');

const pug = require('pug');

const admin = pug.compileFile('./views/admin.pug');

const addNew = pug.compileFile('./views/addNew.pug');

const unauthed = pug.compileFile('./views/unauthed.pug');

const router = express.Router();

router.use(bodyParser.urlencoded({extended: false, })); // Yes, let that comma be there. JSHint is setup to complain otherwise.

router.use((req, res, next) => {
  if(!req.headers.cookie) {
    res.redirect(config.redirectToAuth + '/admin');
    return res.end();
  }
  validateUser(req.headers.cookie, (err, userData) => {
    if(err) {
      if(err === 'unauthed') {
        res.type('html');
        return res.end(unauthed());
      }
      console.error(err);
      res.status(503);
      return res.end('An error occured!');
    }

    req.tv = {};

    req.tv.data = userData;
    next();
  });
});

router.get('//addNew', (req, res) => { // Yes, double slash...
  res.type('html');
  let addNewData = {
    user: req.tv.data.user,
    error: req.query.error ? req.query.error : null,
  };
  res.end(addNew(addNewData));
});

router.get('//delete/:id', (req, res) => { // Yes, double slash...
  let poolQueryParameters = [
    0,
    req.params.id,
  ];
  pool.query('UPDATE advert SET endDate = ? WHERE id = ?', poolQueryParameters, (err) => {
      if(err) {
        console.error(err);
        res.status(503);
        return res.end("An error occured!");
      }

      res.redirect('/admin');
      res.end();
      updateJSON();
    }
  );
});

router.post('//addNew', (req, res) => { // Yes, double slash...
  let form = new multiparty.Form();

  form.parse(req, function(err, fields, files) {
    if(err) {
      console.error(err);
      res.status(503);
      return res.end('An error occured!');
    }

    let data = {
      name: null,
      committee: null,
      startDate: null,
      startTime: null,
      endDate: null,
      endTime: null,
    };

    for(let prop in fields) {
      if(fields.hasOwnProperty(prop)) {
        if(fields[prop][0].length === 0) {
          res.redirect('/admin/addNew?error=somethingIsMissing1');
          return res.end();
        }
      }
    }

    for(let prop in data) {
      if(data.hasOwnProperty(prop)) {
        if(typeof fields[prop] !== 'object') {
          res.redirect('/admin/addNew?error=somethingIsMissing2');
          return res.end();
        }
        data[prop] = fields[prop][0];
        if(typeof data[prop] !== 'string' || data[prop].length === 0) {
          res.redirect('/admin/addNew?error=somethingIsMissing3');
          return res.end();
        }
      }
    }

    let mEndDate = moment(data.endDate + ' ' + data.endTime, 'YYYY-MM-DD HH:mm');
    let mStartDate = moment(data.startDate + ' ' + data.startTime, 'YYYY-MM-DD HH:mm');

    if(!mStartDate.isValid() ||
      !mEndDate.isValid() ||
      mEndDate.isBefore(mStartDate)) {
      res.redirect('/admin/addNew?error=checkYourDates');
      return res.end();
    }

    if(files.file.length !== 1) {
      res.redirect('/admin/addNew?error=noFileUploaded');
      return res.end();
    }

    let hash = crypto.createHash('sha256');

    let fd = fs.createReadStream(files.file[0].path);

    let ofn = files.file[0].originalFilename;

    hash.setEncoding('hex');

    // console.log(mEndDate.unix());

    fd.on('end', () => {
      hash.end();

      let hashString = hash.read();

      let fdr = fs.createReadStream(files.file[0].path);

      let newFileName = hashString + ofn.substring(ofn.lastIndexOf('.'));

      let fdw = fs.createWriteStream('serve/img/' + newFileName);

      fdr.pipe(fdw);

      fdw.on('finish', () => { // Order of definitions regarding ".on" may matter

        let poolQueryParameters = [
          mStartDate.unix(),
          mEndDate.unix(),
          data.name,
          data.committee,
          ofn,
          newFileName,
          req.tv.data.user.cid,
          data.tempPriority === 'on' ? 1 : 0,
        ];

        pool.query('INSERT INTO ' +
          'advert(startDate, endDate, name, committee, originalFilename, currentFilename, author, tempPriority) '+
          'VALUES (?, ?, ?, ?, ?, ?, ?, ?);',
          poolQueryParameters,
          (err) => {
            if(err) {
              console.error(err);
              res.status(503);
              return res.end("An error occured!");
            }

            res.redirect('/admin');
            res.end();
            updateJSON();
          }
        );

      });

    });

    fd.pipe(hash);

  });
});

router.get('//', (req, res) => { // Yes, double slash!
  pool.query('SELECT * FROM advert ORDER BY endDate DESC;', (error, results) => {
    if(error) {
      console.error(error);
      res.status(503);
      return res.end('An error occured!');
    }
    res.type('html');
    let pugParameters = {
      user: req.tv.data.user,
      adverts: results,
      now: Math.round(Date.now() / 1000),
    };
    res.end(admin(pugParameters));
  });
});

function validateUser(cookieData, callback) {
  validateCookie(cookieData, (err, data) => {
    if(err) {
      return callback(err);
    }
    let poolQueryParameters = [
      data.user.cid,
    ];
    pool.query('SELECT cid FROM admins WHERE cid = ?;', poolQueryParameters, (error, results) => {
      if(error) {
        return callback(error);
      }
      if(results.length !== 1) {
        return callback('unauthed');
      }
      callback(null, data);
    });
  });
}

function validateCookie(cookieData, callback) {
  let validateCookieGetParams = config.externalAuthServerConfig;
  validateCookieGetParams.headers = {
    cookie: cookieData,
  };
  http.get(validateCookieGetParams, (res) => {
    if (res.statusCode !== 200) {
      return callback('error1');
    } else if (!/^application\/json/.test(res.headers['content-type'])) {
      return callback('error2');
    }
    res.setEncoding('utf8');
    let rawData = '';
    res.on('data', (chunk) => { rawData += chunk; });
    res.on('end', () => {
      try {
        let parsedData = JSON.parse(rawData);
        callback(null, parsedData);
      } catch (e) {
        console.error(e.message);
        callback('error3');
      }
    });
  }).on('error', (e) => {
    console.error(`Got error: ${e.message}`);
    callback('error4');
  });
}

module.exports = router;
