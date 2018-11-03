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
var REF_HASHTAGPUBLICACION = firebase.database().ref('hashtagpublicacion');
var REF_USERS = firebase.database().ref('usuarios');

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
//Jeninks test
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
   xhr.onreadystatechange = async function () 
   {
       if (xhr.readyState === 4 && xhr.status === 200) 
       {
           //LEYENDO RESPUESTA APIVISION
           var visionAnswer = xhr.responseText;
           console.log("Respuesta API Vision: "+visionAnswer);
           if(visionAnswer === "OK")
           {
               //Save post
                let hashtags = body.hashtags;
                let publication  = {};
                publication.contenido = body.contenido;
                publication.imagen = body.imagen;
                publication.nombre = body.nombre;
                publication.dislikes = 0;
                publication.likes = 0;
                publication.fecha = fecha.getTime();
                publication.usuario = body.usuario;
                let hashArray = [];
                for(let h in hashtags)
                {
                    hashArray.push(hashtags[h].nombre);
                }
                publication.hashtags = hashArray;
                let savedId = await saveFirebase(REF_PUBLICATIONS, publication);

                //Save Hashtags
                for(let h in hashtags)
                {
                    updateFirebase(REF_HASHTAGPUBLICACION.child(savedId).child(hashtags[h].nombre), true);
                }
                console.log("id guardado: "+savedId);
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
    console.log("likeando userid:"+userid+" id:"+id+" like:"+like);
    refLike.transaction(function(currentLike)
    {
        if(like === 1)
        {
            console.log("likeando");
            updateFirebase(REF_LIKEPUBLICATION.child(userid).child(id), true);
        }
        else
        {
            console.log("deslikeando");
            deleteFirebase(REF_LIKEPUBLICATION.child(userid), id);
        }
        return currentLike + like;
    });

    res.send("{\"estado\":true}");
});


app.post('/dislikePublication', async (req, res) => {

    var body = req.body; // este es el body que siempre jalo al principio para no estar llamando a cada rato a req.body
    var id = body.id;
    var like = body.like;
    var userid = body.userid;
    var refLike = REF_PUBLICATIONS.child(id).child("dislikes");
    console.log("dislikeando userid:"+userid+" id:"+id+" like:"+like);
    refLike.transaction(function(currentLike)
    {
        if(like === 1)
        {
            updateFirebase(REF_DISLIKEPUBLICATION.child(userid).child(id), true);
        }
        else
        {
            //console.log("disdeslikeando");
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


app.post('/createUser', async (req, res) => {

    console.log("Guardando usuario...");
    var body = req.body; // este es el body que siempre jalo al principio para no estar llamando a cada rato a req.body
    //console.log(body);
    
    REF_USERS
    .orderByChild("correo")
    .equalTo(body.correo)
    .once("value")
    .then(function(snapshot)
    {
        var queryResult = snapshot.val();
        if(!queryResult)
        {
            console.log("No existe, crear usuario!");
            saveFirebase(REF_USERS, body);
            res.send("{\"estado\":true}");
        }
        else
        {
            console.log("Usuario creado, hacer NADA");
            res.send("{\"estado\":false}");
        }
    });
});

app.post('/deleteUser', async (req, res) => {

    var body = req.body; // este es el body que siempre jalo al principio para no estar llamando a cada rato a req.body
    var id = body.id;
    deleteFirebase(REF_USERS, id);
    console.log("Eliminando Usuario...");
    res.send("{\"estado\":true}");
});

app.post('/updateUser', async (req, res) => {

    console.log("Actualizando...");
    var body = req.body; // este es el body que siempre jalo al principio para no estar llamando a cada rato a req.body
    var id = body.id;
    REF_USERS
        .child(id)
        .once("value")
        .then(function(snapshot)
    {
        var queryUser = snapshot.val();
        queryUser.nombre = body.nombre;
        queryUser.edad = body.edad;
        queryUser.pass = body.pass;
        console.log(queryUser);
        updateFirebase(REF_USERS.child(id), queryUser);
        res.send("{\"estado\":true}");
    });
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
    return new Promise((res, rej) => 
    {
        reference.push(object).then(r => 
        {
            res(r.getKey());
        }).catch(rej);
    })
    await reference.push(object);
    console.log("Guardado!");
    return true;
}

async function updateFirebase(reference, object)
{
    await reference.set(object).then(function(){}).catch(function(e)
    {
        console.log("\n\nERROR: "+e);
    });
    //console.log("Actualizado!");
    return true;
}

async function deleteFirebase(reference, id)
{
    await reference.child(id).remove().then(function()
    {
        console.log("Borrado!");
    }).catch(function(e)
    {
        console.log("\n\nERROR: "+e);
    });
    //console.log("Borrado!");
    return true;
}

