const query = {
    insertQuery: (table, fields_array) =>{
        return `INSERT INTO ${table} (${fields_array.toString()}) values (${fields_array.map((field,index)=> `$${index+1}`)}) RETURNING *`
    }
}

module.exports = query