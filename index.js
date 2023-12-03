const express = require("express");
const app = express();
const bcrypt = require("bcrypt");
const bodyParser = require("body-parser");
const PORT = process.env.PORT || 8000;
const sql = require("./configs/db.config");
const session = require("express-session");
const async = require("async");

app.use(
  session({
    key: "userId",
    secret: "VeryBigSecret",
    resave: false,
    saveUninitialized: false,
    cookie: {
      expires: 60 * 60 * 60 * 24,
    },
  })
);
app.set("view engine", "ejs");
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static("public"));

// //creating db
// app.get("/createdb", (req, res) => {
//   // let sql = "CREATE DATABASE Main_Database"
//   let sql_query = "CREATE DATABASE CT_time_table_generator_db";
//   sql.query(sql_query, (err, result) => {
//     if (err) throw err;
//     console.log("result");
//     res.send("database created");
//   });
// });

//creating tables in database
// app.get("/createtable", (req, res) => {
//     let sql_query =
//       "CREATE TABLE users(name VARCHAR(50) NOT NULL,email VARCHAR(100) NOT NULL,password VARCHAR(150) NOT NULL)";
//     sql.query(sql_query, (err, result) => {
//       if (err) throw err;
//       console.log("result");
//       res.send("user table created");
//     });
//   });

// app.get("/createtable", (req, res) => {
//   let sql_query =
//     "CREATE TABLE users(name VARCHAR(50) NOT NULL,user_id VARCHAR(10) NOT NULL,password VARCHAR(150) NOT NULL);";
//   sql.query(sql_query, (err, result) => {
//     if (err) throw err;
//     console.log("result");
//     res.send("user table created");
//   });
// });

app.get("/", (req, res) => {
  if (req.session.user) {
    console.log("hello from home_page");
    res.render("index", {
      name: req.session.user[0].name,
    });
  } else {
    res.redirect("/Login");
  }
});

// app.get("/home", (req, res) => {
//   if (req.session.user) {
//     console.log("hello from main_page");
//     const exam = {
//       1:"CLASS TEST - I",
//       2:"CLASS TEST - II",
//       3:"END SEM. EXAM",
//       4:"PACTICAL EXAM",
//     }
//     sql.query("SELECT DISTINCT Sem FROM courses;", (err, result_sem) => {
//       sql.query(
//         "SELECT DISTINCT Course FROM courses;",
//         (err, result_courses) => {
//           res.render("Home_page", {
//             courses: result_courses,
//             sem: result_sem,
//             exam:exam,
//           });
//         }
//       );
//     });
//   } else {
//     res.redirect("/Login");
//   }
// });

app.get("/main", (req, res) => {
  if (req.session.user) {
    console.log("hello from main_page");
    const exam = {
      1: "CLASS TEST - I",
      2: "CLASS TEST - II",
      3: "END SEM. EXAM",
      4: "PACTICAL EXAM",
    };
    sql.query("SELECT DISTINCT semester FROM courses;", (err, result_sem) => {
      sql.query(
        "SELECT DISTINCT Course FROM courses;",
        (err, result_courses) => {
          res.render("main_page", {
            courses: result_courses,
            sem: result_sem,
            exam: exam,
          });
        }
      );
    });
  } else {
    res.redirect("/Login");
  }
});

app.get("/manage", (req, res) => {
  if (req.session.user) {
    sql.query("SHOW TABLES FROM time_table_db;", (err, result) => {
      console.log(result);
      res.render("manage_page", {
        tables_options: result,
      });
    });
  } else {
    res.redirect("/login");
  }
});

app.post("/manage_table", (req, res) => {
  let value = req.body.select_table;
  if (req.session.user) {
    sql.query(`SELECT * FROM ${value};`, (err, result) => {
      // console.log(Object.keys(result[0]))
      app.locals.selected_course = value;
      res.render("edit_page", {
        tables: result,
        columns: Object.keys(result[0]),
        course: value,
      });
    });
  } else {
    res.redirect("/login");
  }
});

app.get("/add_data", (req, res) => {
  if (req.session.user) {
    res.render("add_data_page", {
      selected_course: app.locals.selected_course,
    });
  } else {
    res.redirect("/");
  }
});

//todo
//to style the preview page  ✅
app.post("/save_data", (req, res) => {
  if (req.session.user) {
    let table_name = app.locals.selected_course;
    if (table_name == "courses") {
      let data = { Course: req.body.course, semester: req.body.semester };
      sql.query(
        `INSERT INTO ${table_name} SET ?;`,
        data,
        (err, save_data_result) => {
          if (err) throw err;
          sql.query(`SELECT * FROM ${table_name};`, (err, preview_result) => {
            res.render("preview_table", {
              tables: preview_result,
              columns: Object.keys(preview_result[0]),
            });
          });
        }
      );
    } else {
      let data = {
        Course: req.body.course,
        Subject: req.body.subject,
        Subject_code: req.body.subject_code,
        semester: req.body.semester,
      };
      sql.query(
        `INSERT INTO ${table_name} SET ?;`,
        data,
        (err, save_data_result) => {
          if (err) throw err;
          sql.query(`SELECT * FROM ${table_name};`, (err, preview_result) => {
            res.render("preview_table", {
              tables: preview_result,
              columns: Object.keys(preview_result[0]),
            });
          });
        }
      );
    }
    // console.log(data)
  } else {
    res.redirect("/");
  }
});

// TODO
//to complete the edit and delete module (half done) delete module left

app.get("/edit/:s_no", (req, res) => {
  if (req.session.user) {
    let s_no = req.params.s_no;
    let table_name = app.locals.selected_course;
    sql.query(
      `SELECT * FROM ${table_name} where s_no =?`,
      [s_no],
      (err, result) => {
        console.log(result[0].Course);
        res.render("edit_data_page", { result: result[0] });
      }
    );
  } else {
    res.redirect("/");
  }
});

// edit-page-route-module

app.post("/update_data", (req, res) => {
  if (req.session.user) {
    let table_name = app.locals.selected_course;
    if (table_name == "courses") {
      let data = { Course: req.body.course, semester: req.body.semester };
      let s_no = req.body.id;
      sql.query(
        `UPDATE ${table_name} SET ? WHERE s_no=${s_no};`,
        data,
        (err, save_data_result) => {
          if (err) throw err;
          sql.query(`SELECT * FROM ${table_name};`, (err, preview_result) => {
            res.render("preview_table", {
              tables: preview_result,
              columns: Object.keys(preview_result[0]),
            });
          });
        }
      );
    } else {
      let data = {
        Course: req.body.course,
        Subject: req.body.subject,
        Subject_code: req.body.subject_code,
        semester: req.body.semester,
      };
      let s_no = req.body.id;
      sql.query(
        `UPDATE ${table_name} SET ? WHERE s_no=${s_no};`,
        data,
        (err, save_data_result) => {
          if (err) throw err;
          sql.query(`SELECT * FROM ${table_name};`, (err, preview_result) => {
            res.render("preview_table", {
              tables: preview_result,
              columns: Object.keys(preview_result[0]),
            });
          });
        }
      );
    }
    // console.log(data)
  } else {
    res.redirect("/");
  }
});

// delete-page-route-module ✅

app.get("/delete_data/:s_no", (req, res) => {
  if (req.session.user) {
    let s_no = req.params.s_no;
    let table_name = app.locals.selected_course;
    sql.query(
      `DELETE FROM ${table_name} WHERE s_no=${s_no}`,
      (err, delete_result) => {
        if (err) throw err;
        sql.query(`ALTER TABLE ${table_name} AUTO_INCREMENT=${s_no - 1}`,(err,result) => {
          sql.query(`SELECT * FROM ${table_name}`, (err, result_table) => {
            if (err) throw err;
            res.render("preview_table", {
              tables: result_table,
              columns: Object.keys(result_table[0]),
            });
          });
        })
      }
    );
  } else {
    res.redirect("/");
  }
});

app.post("/main", (req, res) => {
  if (req.session.user) {
    const course = req.body.select_course;
    const sem = req.body.select_sem;
    const exam_options = req.body.select_exam;
    console.log(course);
    console.log(sem);
    if (exam_options != "PACTICAL EXAM") {
      sql.query(
        "SELECT * FROM course_subjects WHERE Course=? AND semester=?;",
        [course, sem],
        (err, result) => {
          // console.log(result);
          res.render("time_table", {
            data: result,
            sem: sem,
            course: course,
            exam_options: exam_options,
          });
        }
      );
    } else if (exam_options == "PACTICAL EXAM") {
      sql.query(
        "SELECT * FROM practical_course_subjects WHERE Course=? AND semester=?;",
        [course, sem],
        (err, result) => {
          // console.log(result);
          res.render("time_table", {
            data: result,
            sem: sem,
            course: course,
            exam_options: exam_options,
          });
        }
      );
    }
  } else {
    res.redirect("/Login");
  }
});


app.get("/Login", (req, res) => {
  if (!req.session.user) {
    res.render("form_login", { error_msg: "" });
  } else {
    res.redirect("/");
  }
});

app.post("/login", (req, res) => {
  const user_id = req.body.user_id;
  const password = req.body.password;
  sql.query(
    "SELECT * FROM users WHERE user_id = ?;",
    [user_id],
    (err, result) => {
      if (err) {
        res.render("form_login", { error_msg: err });
      }
      if (result.length > 0) {
        bcrypt.compare(password, result[0].password, (err, response) => {
          if (response) {
            req.session.user = result;
            res.redirect("/");
          } else {
            res.render("form_login", { error_msg: "Credentials Are Invalid" });
          }
        });
      } else {
        res.render("form_login", { error_msg: "User Does Not Exist" });
      }
    }
  );
});

app.get("/LogOut", (req, res) => {
  if (req.session.user) {
    req.session.destroy((err) => {
      if (err) console.log(err);
      console.log("logging out......");
      res.redirect("/Login");
    });
  } else {
    res.redirect("/Login");
  }
});

app.listen(PORT, () => console.log(`listening on ${PORT}`));
