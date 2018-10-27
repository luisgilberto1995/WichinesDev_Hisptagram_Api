const firebase = require("firebase");

var config = {
    apiKey: "AIzaSyDtcfiG8xKUnspkThSUnr3-ulGUvZjcgAo",
    authDomain: "deep-pursuit-174322.firebaseapp.com",
    databaseURL: "https://deep-pursuit-174322.firebaseio.com",
    projectId: "deep-pursuit-174322",
    storageBucket: "deep-pursuit-174322.appspot.com",
    messagingSenderId: "595740310600"
  };
  firebase.initializeApp(config);

var REF_PUBLICATIONS = firebase.database().ref('publicacion');

const express = require('express');

const bodyParser = require ('body-parser');

const app = express();

app.use(bodyParser.urlencoded({extended:true}));

app.use(bodyParser.json());

app.get('/',function (req,res)
{
    res.send('Hello World!');
});

app.listen(3005,function()
{
    console.log('Servidor iniciado');
});

app.post('/postPublication', (req, res) => {


    var type = req.query.type;/* este sirve cuando pasas un parametro por url era el type que yo les pedia en lo de las colonias,
                                se pueden poner n parámetros y es como el body que te explice req.query.nombreparametro
                                */

    var body = req.body; // este es el body que siempre jalo al principio para no estar llamando a cada rato a req.body
    /*firebase.database().ref("/").once('value').then(function(snapshot)
    {
        console.log("Then:");
        console.log(snapshot.val());
    });
    */

    console.log(body.id);
    console.log(body.nombre);

    res.send("todo bien");

});

function json_converter( response, error, access) {

    var response_object = JSON.parse('{"response":"'+response+'","error":"'+error+'","access":"'+access+'"}');

    return response_object;

}

