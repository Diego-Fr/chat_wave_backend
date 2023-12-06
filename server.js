require('dotenv').config()

const { default: axios } = require('axios');
const express  = require('express');//express
const http = require('http')
const cors = require('cors')//evitar erros de cors
const port = 4000;//porta
const pool = require('./database.config'); // Import your database configuration
const _ = require('lodash')
const userModule = require('./src/helpers/user')

const app = express();

app.use(cors())

app.get('/', (req, res) =>{
    res.redirect('http://localhost:3000/');
})

app.get('/googleLogin', async (req, res) =>{
    const {code} = req.query
    const userSerializerFields = ['id','name', 'email', 'picture', 'access_token', 'created_at']
    
    //request options do google Login
    let requestOptions = {
        code: code,
        client_id: process.env.GOOGLE_CLIENT_ID,
        client_secret: process.env.GOOGLE_CLIENT_SECRET,
        redirect_uri: 'http://localhost:3000', // redirect obrigatório
        grant_type: 'authorization_code',
    }

    try{
        //fazendo login com o code no google que retornará o access_token do usuário
        let responseToken = await axios.post('https://oauth2.googleapis.com/token', requestOptions)
        let access_token = responseToken.data.access_token

        //usando o access token para consultar a API de informações básicas da conta do usuário
        let responseUser = await axios.get('https://www.googleapis.com/userinfo/v2/me', {headers:{Authorization:`Bearer ${access_token}`}})

        userModule.getUserByEmail(responseUser.data.email).then(rows=>{
            if(rows.length === 0){
                //usuário ainda não cadastrado, cadastrar
                userModule.createUser(responseUser.data, access_token).then(result=>{
                    res.send({access_token:access_token, user: _.pick(result.rows[0], userSerializerFields)});            
                }).catch(error=>{
                    console.log('Erro ao criar usuário', error)
                })
            } else {
                res.send({access_token:access_token, user: _.pick(rows[0], userSerializerFields)});
            }
        })
    } catch(e){
        res.status(400).send(`Erro ao logar ${e}`);
    }
    
})

app.get('/user', async(req, res)=>{
    let fields = ['name', 'id']

    const client = await pool.connect();//conectando ao database com o Pool do pg
    const result = await client.query('SELECT * FROM users where id = 2'); //selecionando na tabela
    client.release();//fechando conexão
    
    res.json(result.rows.length);
})

http.createServer(app).listen(port, _ =>{
    console.log('Server esta funcionando na porta ' + port)
})

