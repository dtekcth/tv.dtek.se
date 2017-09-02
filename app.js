
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

const express = require('express');

const app = express();

app.set('trust proxy', 1);

const router = require('./router.js');

app.use(router);

const port = process.env.PORT || config.port;

if(typeof port !== 'string' && typeof port !== 'number') {
  throw new Error('You must define a port/socket to start the server!');
}

app.listen(port, () => {
  console.log('TV service listening on', typeof port === 'string' ? 'socket' : 'port', port);
});

require('./updateJSON.js');
