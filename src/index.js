const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser')
const jsonParser = bodyParser.json();



const app = express();
app.use(cors());
app.use(express.json());
app.use(jsonParser); // use it globally

require('./controllers/usuarioController')(app);
require('./controllers/grupoController')(app);
app.listen(3333);