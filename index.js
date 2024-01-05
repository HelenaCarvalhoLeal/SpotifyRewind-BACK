const express = require('express');
const axios = require('axios');
const cors = require("cors");
const querystring = require('querystring');
const {auth} = require("./src/auth");
const swaggerUi = require('swagger-ui-express');
// const fs = require('fs');
const swaggerFile = require('./swagger/swagger_output.json');

const app = express();
app.use(cors());
const PORT = 3000;

const REDIRECT_URI = 'http://192.168.100.21/info';

app.get('/login', async (req, res) => {
    const scope = 'user-read-private user-follow-read user-top-read';
    const authURL = `https://accounts.spotify.com/authorize?${querystring.stringify({
        response_type: 'code',
        client_id: auth.CLIENT_ID,
        scope,
        redirect_uri: REDIRECT_URI,
    })}`;

    res.send(authURL);
});


app.get('/callback', async (req, res) => {
    const code = req.query.code;

    try {
        
        const tokenResponse = await axios.post(
            'https://accounts.spotify.com/api/token',
            querystring.stringify({
                grant_type: 'authorization_code',
                code,
                redirect_uri: REDIRECT_URI,
                client_id: auth.CLIENT_ID,
                client_secret: auth.CLIENT_SECRET,
            }),
            {
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded',
                },
            }
        );

        const accessToken = tokenResponse.data.access_token;

        var followingArtist = new Array;
        var topArtist = new Array;
        var topTracks = new Array;
        var userProfile = new Array;

        await axios.get("https://api.spotify.com/v1/me", {
            headers: {
                Authorization: `Bearer ${accessToken}`
            }
        }).then(response => {
            userProfile.push({userProfile: response.data});
        });

        await axios.get('https://api.spotify.com/v1/me/following?type=artist', {
            headers: {
                Authorization: `Bearer ${accessToken}`
            },
            params: {
                limit: 5
            }
        }).then(response => {
            response.data.artists.items.forEach(element => {
                followingArtist.push({followingArtist: {element}});
            });
        });

        await axios.get('https://api.spotify.com/v1/me/top/artists', {
            headers: {
                Authorization: `Bearer ${accessToken}`
            },
            params: {
                limit: 5
            }
        }).then(response => {
            response.data.items.forEach(element => {
                topArtist.push({topArtist: {element}});
            });
        });

        await axios.get('https://api.spotify.com/v1/me/top/tracks', {
            headers: {
                Authorization: `Bearer ${accessToken}`
            },
            params: {
                limit: 5
            }
        }).then(response => {
            response.data.items.forEach(element => {
                topTracks.push({topTracks: {element}});
            });
        });
        const dadosSpotify = {nomeUsuario : userProfile[0].userProfile.display_name, topArtistas : new Array, topMusicas : new Array};
        topArtist.forEach(element => {
            dadosSpotify.topArtistas.push({'nome' : element.topArtist.element.name, 
            'imagem' : element.topArtist.element.images[0].url});
        });
        topTracks.forEach(element => {
            dadosSpotify.topMusicas.push({'nomeMusica' : element.topTracks.element.name, 'nomeAutor' : element.topTracks.element.artists[0].name, 
            'imagem' : element.topTracks.element.album.images[0].url});
        });
        res.send(dadosSpotify);
    } catch (error) {
        res.status(400).send('Erro ao obter os dados do usuário.');
    }
});

var accessToken = axios.post('https://accounts.spotify.com/api/token',
    querystring.stringify({
        grant_type: 'client_credentials',
        client_id: auth.CLIENT_ID,
        client_secret: auth.CLIENT_SECRET,
    }),
    {
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
        }
    }
).then((result) => {
    return result.data.access_token;
});

app.get("/search", async (req, res) => {
    var token = await accessToken;
    if (req.query.searchInput != '') {
        axios.get(`https://api.spotify.com/v1/search`, {
            headers: {
                Authorization: `Bearer ${token}`
            },
            params: {
                q: req.query.searchInput,
                type: "artist"
            }
        }).then(result => {
            axios.get("https://api.spotify.com/v1/artists/" + result.data.artists.items[0].id + "/albums", {
                headers: {
                    Authorization: `Bearer ${token}`
                },
                params: {
                    include_groups: "album",
                    market: "US"
                }
            }).then((result) => {
                res.send(result.data.items);
            });
        });
    } else {
        res.status(400).end();
    }
});

// app.use('/doc', swaggerUi.serve, swaggerUi.setup(swaggerFile));
app.use('/doc', swaggerUi.serve, swaggerUi.setup(swaggerFile));

app.listen(PORT, () => {
    console.log(`Servidor rodando em http://localhost:${PORT}`);
});