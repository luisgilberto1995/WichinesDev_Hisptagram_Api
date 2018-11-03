
var assert = require('assert');
var IP = "http://192.168.0.10:3005/";

describe('Publicaciones', function() 
{
    describe('Agregar Publicacion', function() 
    {
        it('Debería devolver true', function(done) 
        {
            var newPost = {};
            newPost.contenido = "Publicacion unitaria!";
            newPost.hashtags = [{nombre:"unitTest1"}, {nombre:"unitTest2"}];
            newPost.usuario = "unitTestUser";
            newPost.nombre = "NombreUnitTestUser";
            newPost.imagen = "https://store.playstation.com/store/api/chihiro/00_09_000/container/US/en/999/UP4016-CUSA11253_00-DEADCELLS0000000/1539714875000/image?w=240&h=240&bg_color=000000&opacity=100&_version=00_09_000";
            
            var xhr = new XMLHttpRequest();
            var url = IP+"postPublication";
            xhr.open("POST", url, true);
            xhr.setRequestHeader("Content-Type", "application/json");
            xhr.onreadystatechange = function () 
            {
                if (xhr.readyState === 4 && xhr.status === 200) 
                {
                    done();
                }
            };
            var data = JSON.stringify(newPost);
            xhr.send(data);
            
        });
    });
});

