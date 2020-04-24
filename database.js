const sqlite3 = require('sqlite3');

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
    console.log("create database table user");
    this.db.run("CREATE TABLE IF NOT EXISTS user(id INTEGER PRIMARY KEY, first_name TEXT, last_name TEXT, date_of_birth TEXT,  place_of_birth TEXT, code_postal TEXT, city TEXT, address TEXT)",  (err) => {if (err){
      console.log("Failed to create table")
    }});
  }
}
 
module.exports=Database

