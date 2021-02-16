import SQLite from "react-native-sqlite-storage";
SQLite.DEBUG(true);
SQLite.enablePromise(true);

const database_name = "quizapp.db";
const database_version = "1.0";
const database_displayname = "KeyLearning questions";
const database_size = 2000000;

export default class Database {

    // Works.
    initDB() {
        let db;
        return new Promise((resolve) => {
            console.log("Integrity check.....");
            SQLite.echoTest().then(() => {
                console.log("Integrity check passed...");
                console.log("Opening database...");
                SQLite.openDatabase({
                    name: database_name,
                    createFromLocation: 1
                    //location: 'Library'
                }).then(DB => {
                    db = DB;
                    console.log("Database opened");
                    db.executeSql('SELECT * FROM USERS').then(() => {
                        console.log("Database is ready... executing query");
                    }).catch((error)=>{
                        console.log(error);
                        console.log('Database not ready');
                        db.transaction((tx) => {
                            tx.executeSql('CREATE TABLE IF NOT EXISTS USERS (FirstName VARCHAR(20), LastName VARCHAR(20), Username VARCHAR(20) PRIMARY KEY, MobileNumber INT(20), LanguageID INT(1), Password VARCHAR(20))');
                        }).then(() => {
                            console.log("User table created successfully");
                        }).catch(error => {
                            console.log(error);
                        });
                    });
                    resolve(db);
                }).catch(error => {
                    console.log(error);
                });
            }).catch(error => {
                console.log("Echo test failed");
            });
        });
    }


    // Works.
    closeDatabase(db) {
        if (db) {
            console.log("Closing DB");
            db.close()
                .then(status => {
                    console.log("Database closed");
                })
                .catch(error => {
                    this.errorCB(error);
                });
        }else{
            console.log("Database was not opened");
        }
    }


    //COULD NOT SEE THE CHANGES IN EITHER OF THE DATABASES,
    addUser(user){
        return new Promise((resolve) => {
            this.initDB().then((db) => {
                db.transaction((tx) => {
                    tx.executeSql('INSERT INTO USER VALUES (?, ?, ?, ?, ?, ?)', [user.firstName, user.lastName, user.username, user.mobileNumber, user.password, user.langId]).then(([tx,results]) => {
                        resolve(results);
                    });
                }).then((result) => {
                    this.closeDatabase(db);
                }).catch((err) =>{
                    console.log(err);
                });
            }).catch((err) => {
                console.log(err);
            });
        });
    }

    // Works.
    getCred(username) { 
        console.log(username)
        return new Promise((resolve) => {
            const cred = []
            this.initDB().then((db) => {
                db.transaction((tx) => {
                    tx.executeSql('SELECT Username, Password, LangID FROM User WHERE Username = ?', [username]).then(([tx,results]) => { //    
                        console.log("Getting questions ready");
                        let row = results.rows.item(0);
                        cred.push(row);
                        console.log(cred)
                        resolve(cred);
                    });
                }).then((result) => {
                    this.closeDatabase(db);
                }).catch((err) => {
                    console.log(err);
                    throw err;
                });
            }).catch((err) => {
                console.log(err);
                throw err;
            });
        });
    }

    // Works. We can however query out only relevant info after the front end details are finalized
    getHome() {//FROM Quiz WHERE LanguageID = ? [languageId]
        return new Promise((resolve) => {
            const courses = []
            this.initDB().then((db) => {
                db.transaction((tx) => {
                    tx.executeSql('SELECT * FROM Quiz', []).then(([tx,results]) => {
                        console.log("Getting home screen courses");
                        var len = results.rows.length;
                        for(i=0;i<len;i++){
                            let row = results.rows.item(0);
                            courses.push(row)
                        }
                        console.log(courses);
                        resolve(courses);
                    });
                }).then((result) => {
                    this.closeDatabase(db);
                }).catch((err) => {
                    console.log(err);
                });
            }).catch((err) => {
                console.log(err);
            });
        });  
    }


    // Works.
    questionsById(quizreq) {
        console.log(quizreq)
        return new Promise((resolve) => {
            const questions = []    
            this.initDB().then((db) => {
                db.transaction((tx) => {
                    tx.executeSql('SELECT * FROM Questions WHERE LangID = ? and QuizID = ?', [quizreq.langId, quizreq.quizId]).then(([tx,results]) => {
                        console.log("Getting questions ready");
                        var len = results.rows.length;
                        for(i=0;i<len;i++){
                            let row = results.rows.item(0);
                            questions.push(row)
                        }
                        console.log(questions);
                        resolve(questions);
                    });
                }).then((result) => {
                    this.closeDatabase(db);
                }).catch((err) => {
                    console.log(err);
                });
            }).catch((err) => {
                console.log(err);
            });
        });  
    }

    //DID NOT TEST BECAUSE WE DON'T KNOW WHAT STATS TO SAVE AS PROGRESS
    saveProgress(progress){
        return new Promise((resolve) => {
            this.initDB().then((db) => {
                db.transaction((tx) => {
                    tx.executeSql('INSERT INTO Progress VALUES (?, ?, ?, ?, ?, ?)', [progress.quizID, ]).then(([tx,results]) => {
                        resolve(results);
                    });
                }).then((result) => {
                    this.closeDatabase(db);
                }).catch((err) =>{
                    console.log(err);
                });
            }).catch((err) => {
                console.log(err);
            });
        });
    }

    getUserData() {
        return new Promise((resolve) => {
            const records = []
            this.initDB().then((db) => {
                db.transaction((tx) => {
                    tx.executeSql('SELECT * FROM Quiz Q INNER JOIN Progress P ON Q.ID = P.QID', [], (tx, results) => {
                        console.log("Query completed");
                        var len = results.rows.length;
                        for(let i=0; i<len; i++){
                            let row = results.rows.item(i);
                            records.push(row);
                        }
                        resolve(records);
                    });
                }).then((result) => {
                    this.closeDatabase(db);
                }).catch((err) => {
                    console.log(err);
                });
            }).catch((err) => {
                console.log(err);
            });
        });
    }

}