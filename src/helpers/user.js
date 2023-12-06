require('dotenv').config()

const pool = require('../../database.config'); // Import your database configuration
const queryHelper = require('./query')
const crypto = require('crypto');

const generateAccessToken = (length) => {
    return crypto.randomBytes(length).toString('hex');
}


const user = {
    getUserByEmail: async email => {
        let client = await pool.connect();
        let result = await client.query(`SELECT * FROM users WHERE email = '${email}'`)
        client.release();
        return result.rows
    },
    createUser: async (user, access_acode) =>{
        let query = queryHelper.insertQuery('users', ['name','email','google_access_key', 'picture', 'access_token'])
        return pool.query(query, [user.name, user.email, access_acode, user.picture, generateAccessToken(16)])
    }
}

module.exports = user