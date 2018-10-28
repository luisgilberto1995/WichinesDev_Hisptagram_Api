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
var REF_LIKEPUBLICATION = firebase.database().ref('likepublicacion');
var REF_DISLIKEPUBLICATION = firebase.database().ref('dislikepublicacion');

const express = require('express');
const cors = require("cors");
var XMLHttpRequest = require("xmlhttprequest").XMLHttpRequest;

const bodyParser = require('body-parser');

const app = express();

app.use(bodyParser.urlencoded({extended:true}));

app.use(bodyParser.json());

app.use(cors({origin:true}));

app.get('/',function (req,res)
{
    res.send('Hello World!');
});

app.listen(3005,function()
{
    console.log('Servidor iniciado');
});

app.post('/postPublication', async (req, res) => {

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
   //VALIDAR HASHTAGS NO OFENSIVOS
   //VALIDAR IMAGEN

   console.log("Publicando...");
   let fecha = new Date();
   var xhr = new XMLHttpRequest();
   var url = "http://35.227.59.137:3005/ping";
   xhr.open("POST", url, true);
   xhr.setRequestHeader("Content-Type", "application/json");
   xhr.onreadystatechange = function () 
   {
       if (xhr.readyState === 4 && xhr.status === 200) 
       {
           //LEYENDO RESPUESTA APIVISION
           var visionAnswer = xhr.responseText;
           console.log("Respuesta API Vision: "+visionAnswer);
           if(visionAnswer === "OK")
           {
                let publication  = {};
                publication.contenido = body.contenido;
                publication.imagen = body.imagen;
                publication.dislikes = 0;
                publication.likes = 0;
                publication.fecha = fecha.getTime();
                let hashtags = body.hashtags;
                //console.log(hashtags);
                publication.usuario = body.usuario;
                saveFirebase(REF_PUBLICATIONS, publication);
                res.send("{\"estado\":true}");
           }
           else
           {
                res.send("{\"estado\":false}");
           }
       }
   };
   console.log("Inicio el test API Vision...");
   var imagen = {};
   imagen.url = body.imagen;
   imagen.name = "x.jpg";
   var data = JSON.stringify(imagen);
   xhr.send(data);
});


app.post('/likePublication', async (req, res) => {

    var body = req.body; // este es el body que siempre jalo al principio para no estar llamando a cada rato a req.body
    var id = body.id;
    var like = body.like;
    var userid = body.userid;
    var refLike = REF_PUBLICATIONS.child(id).child("likes");
    refLike.transaction(function(currentLike)
    {
        return currentLike + like;
    });

    REF_LIKEPUBLICATION.child(userid).child(id).transaction(function(likebool)
    {
        if(like === 1)
        {
            console.log("likeando");
            return true;
        }
        else
        {
            console.log("deslikeando");
            return null;
        }
    });
        
    res.send("{\"estado\":true}");
});


app.post('/dislikePublication', async (req, res) => {

    var body = req.body; // este es el body que siempre jalo al principio para no estar llamando a cada rato a req.body
    var id = body.id;
    var like = body.like;
    var userid = body.userid;
    var refLike = REF_PUBLICATIONS.child(id).child("dislikes");
    refLike.transaction(function(currentLike)
    {
        if(like === 1)
        {
            console.log("likeando");
            updateFirebase(REF_DISLIKEPUBLICATION.child(userid).child(id), true);
        }
        else
        {
            console.log("deslikeando");
            deleteFirebase(REF_DISLIKEPUBLICATION.child(userid), id);
        }
        return currentLike + like;
    });
    res.send("{\"estado\":true}");
});


app.post('/deletePublication', async (req, res) => {

    var body = req.body; // este es el body que siempre jalo al principio para no estar llamando a cada rato a req.body
    var id = body.id;
    deleteFirebase(REF_PUBLICATIONS, id);
    console.log("Eliminando...");
    res.send("{\"estado\":true}");
});

function json_converter( response, error, access) {

    var response_object = JSON.parse('{"response":"'+response+'","error":"'+error+'","access":"'+access+'"}');

    return response_object;

}

async function saveFirebase(reference, object)
{
    await reference.push(object);
    console.log("Guardado!");
    return true;
}

async function updateFirebase(reference, object)
{
    await reference.set(object);
    console.log("Actualizado!");
    return true;
}

async function deleteFirebase(reference, id)
{
    await reference.child(id).remove();
    console.log("Borrado!");
    return true;
}
