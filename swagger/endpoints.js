module.exports = function (app) {
    app.get('/login', (req, res) => {
        // #swagger.tags = ['Login']
        // #swagger.description = 'Requisita o Login e após realizado é entregue um token de acesso que só pode ser utilizado uma vez por acesso. (Razões de segurança da própria Spotify)'
        const error = res.status(400);
        const OK = res.send(authURL);
        // return res.send(authURL);
    });

    app.get('/callback', (req, res) => {
        // #swagger.tags = ['Acesso as informações e requisição dos dados']
        // #swagger.description = 'Após o token ser utilizado ele se torna invalido forçando o usuário a recarregar a página.'
        // #swagger.parameters['code'] = { description: 'token de acesso' }

         /* #swagger.responses[200] = { 
               schema: {

               },
               description: 'Usuário encontrado.' 
        } */

        const code = req.query.code;
        const error = [res.status(400), res.status(404), res.status(500)];
        const OK = res.send(authURL);
        // return res.send(authURL);
    });

}