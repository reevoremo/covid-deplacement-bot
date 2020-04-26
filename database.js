const sqlite3 = require('sqlite3').verbose();

class Database {
  constructor(db_file_path) {
    this.db = new sqlite3.Database(db_file_path, (err) => {
      if (err) {
          console.log('Error when creating the database', err)
      } else {
          console.log('Database created!')
      }
    })
  }

  createTable = () => {
    this.db.run("CREATE TABLE IF NOT EXISTS user(id INTEGER PRIMARY KEY, first_name TEXT, last_name TEXT, date_of_birth TEXT,  place_of_birth TEXT, code_postal TEXT, city TEXT, address TEXT)",  (err) => {if (err){
      console.log("Failed to create table");
    }});
  }

  getUser = (user_id, cb) => {
    return this.db.get("SELECT * FROM user WHERE id=?", user_id, function(err, row) {
      if (err){
        console.log('User not found')
        return null
      }
      cb(row)
      return row
    });
  }

  insertUser = (user_id, callback) => {
    this.db.run('INSERT INTO user (id) VALUES (?)', user_id, (err) => {
      if (err) {
        console.log("User already exist");
        callback()
      }
      else
      {
        callback()
      }
    });
  }

  updateUser = (user_id, value, field_name, callback) => {
    const sql = `UPDATE user SET ${field_name} = ? WHERE id = ?`;
    console.log(sql)
    this.db.run(sql, [value, user_id], (err) => {
      if (err) {
        console.log("Update Failed");
      }
    });
  }
}

module.exports=Database
