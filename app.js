const express = require('express');
const app = express();
const cors = require('cors');
const router = require('./utils/router.js');
const swaggerUi = require('swagger-ui-express');
const swaggerDocument = require('./swagger.json');

app.use(express.json())

app.use(cors());
app.use('/api', router);
// app.use('api-documentation', swaggerUi.)

app.listen(process.env.APP_PORT, () => console.log("Server Berjalan di port "+process.env.APP_PORT));