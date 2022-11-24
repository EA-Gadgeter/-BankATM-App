const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const {router} = require("./Routes");

const app = express();

app.use(bodyParser.urlencoded({extended: false}));
app.use(cors());
app.use(bodyParser.json());
app.use("/", router);

app.listen(6969, () => {
    console.log('Server iniciado en el puerto 6969 jeje');
});
