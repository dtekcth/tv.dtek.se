
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

const fs = require('fs');

let mysql = require('mysql');

// Probably overkill using connectionpooling here!
let pool = mysql.createPool(config.mysql);

let lastFiles = [ // One item to force the lastFiles.length === 0 below force one update.
  '1',
];

// Updates the JSON file on a regular basis if needed.
function updateJSON() {
  let now = Math.round(Date.now()/1000);
  let nowArr = [
    now,
    now,
  ];
  pool.query('SELECT currentFilename FROM advert WHERE startDate < ? AND endDate > ?;', nowArr, (err, results) => {
    if(err) {
      console.error(err);
      return;
    }
    let updated = true;
    let files = [];
    if(lastFiles.length === 0 && results.length === 0) {
      return;
    }
    if(lastFiles.length === results.length) {
      for(let i = 0, ii = results.length; i < ii; i++) {
        files.push(results[i].currentFilename);
        let currentUpdated = true;
        for(let j = 0, jj = lastFiles.length; j < jj; j++) {
          if(results[i].currentFilename === lastFiles[j]) {
            currentUpdated = false;
            break;
          }
        }
        if(!currentUpdated) {
          updated = false;
        }
      }
    } else {
      for(let i = 0, ii = results.length; i < ii; i++) {
        files.push(results[i].currentFilename);
      }
    }
    if(updated) {
      let writeFileSettings = {
        encoding: 'utf8',
        mode: 0o644, 
      };
      fs.writeFile('./serve/currentImages.json', JSON.stringify(files), writeFileSettings, (err) => {
        if(err) {
          console.error('Failed writing JSON file!');
          console.error(err);
        }
        lastFiles = files;
      });
    }
  });
}

setInterval(updateJSON, 60000); // One minute

setTimeout(updateJSON, 1000); // Initial update

module.exports = updateJSON;
