const express = require("express");
const jwt = require("jsonwebtoken");
const mysql = require("mysql");
const bodyParser = require("body-parser");
const app = express();
const port = 3000;

app.use(bodyParser.json());
app.use(
  bodyParser.urlencoded({
    extended: true
  })
);

const db = mysql.createConnection({
  host: "localhost",
  user: "root",
  password: "",
  database: "perkemahan"
});
db.connect(err => {
  if (err) throw err;
  console.log("Database connected");
});

const isAuthorized = (request, result, next) => {
  if (typeof request.headers["token"] == "undefined") {
    return result.status(403).json({
      success: false,
      message: "Unauthorized. Token is not provided"
    });
  }

  let token = request.headers["token"];

  jwt.verify(token, "SuperSecRetKey", (err, decoded) => {
    if (err) {
      return result.status(401).json({
        success: false,
        message: "Unauthorized. Token is invalid"
      });
    }
  });

  next();
};

app.post("/login/admin", (req, res, next) => {
  //membuat end point untuk login akun
  var username = req.body.username; // mengimpor email dari form
  var password = req.body.password; //mengimpor password dari form
  const sql = "SELECT * FROM admin WHERE username = ? AND password = ?"; // mencocokkan data form dengan data tabel
  if (username && password) {
    // jika email dan password ada
    db.query(sql, [username, password], function(err, rows) {
      if (err) throw err;
      // jika error akan menampilkan errornya
      else if (rows.length > 0) {
        jwt.sign(
          { username, password },
          "SuperSecRetKey",
          {
            expiresIn: 60 * 60 * 6
          },
          (err, token) => {
            res.send(token);
          }
        );
      } else {
        res.json({
          message: "email or password is incorrect"
        }); // jika semua if tidak terpenuhi maka menampilkan kalimat tersebut
      }
    });
  }
});

app.post("/login", (req, res) => {
  //membuat end point untuk login akun
  var email = req.body.email; // mengimpor email dari form
  var password = req.body.password; //mengimpor password dari form
  const sql = "SELECT * FROM akun WHERE email = ? AND password = ?"; // mencocokkan data form dengan data tabel
  if (email && password) {
    // jika email dan password ada
    db.query(sql, [email, password], function(err, rows) {
      if (err) throw err;
      // jika error akan menampilkan errornya
      else if (rows.length > 0) {
        // jika kolom lebih dari 0
        jwt.sign(
          // mengenkripsi data menggunakan jwt
          { email, password },
          "SuperSecRetKey",
          {
            expiresIn: 60 * 60 * 7 // waktu durasi token yang dikeluarkan
          },
          (err, token) => {
            res.send(token); // menampilkan token yang sudah ada
          }
        );
      } else {
        res.json({
          message: "email or password is incorrect"
        }); // jika semua if tidak terpenuhi maka menampilkan kalimat tersebut
      }
    });
  }
});

app.get("/", isAuthorized, (request, result) => {
  result.json({
    success: true,
    message: "Welcome"
  });
});

// CRUD BARANG KEMAH

app.post("/tambah", isAuthorized, function(request, result) {
  let data = request.body;

  var barang = {
    // membuat variabel data untuk menampung data dari form
    namaBarang: data.namaBarang, // mengambil data dari form
    deskripsi: data.deskripsi, // mengambil data dari form
    stok: data.stok,
    harga: data.harga // mengambil data dari form
  };

  db.query("insert into barang set ?", barang, (err, result) => {
    if (err) throw err;
  });

  result.json({
    success: true,
    message: "Data has been added"
  });
});

app.put("/edit/:id", isAuthorized, function(req, res) {
  let data = // membuat variabel data yang berisi sintaks untuk mengupdate tabel di database
    'UPDATE barang SET namaBarang="' +
    req.body.namaBarang +
    '", deskripsi="' +
    req.body.deskripsi +
    '", stok="' +
    req.body.stok +
    '", harga="' +
    req.body.harga +
    '" where id=' +
    req.params.id;
  db.query(data, function(err, result) {
    // mengupdate data di database
    if (err) throw err;
    // jika gagal maka akan keluar error
    else {
      result.json({
        success: true,
        message: "Data has been updated"
      });
    }
  });
});

app.delete("/delete/:id", isAuthorized, function(req, res) {
  // membuat end point delete
  let id = "delete from barang where id=" + req.params.id;

  db.query(id, function(err, result) {
    // mengupdate data di database
    if (err) throw err;
    // jika gagal maka akan keluar error
    else {
      res.json({
        success: true,
        message: "Data has been Deleted"
      });
    }
  });
});

// CRUD USER

app.post("/daftar", (req, res) => {
  // membuat end point untuk daftar akun
  var data = {
    // membuat variabel data
    nama: req.body.nama, // mengambil data nama dari form
    email: req.body.email, // mengambil data email dari form
    password: req.body.password, // mengambil data password dari form
    no_telp: req.body.no_telp,
    alamat: req.body.alamat
  };
  db.query("INSERT INTO akun SET?", data, function(err, result) {
    // memasukkan data form ke tabel database
    if (err) throw err;
    // jika gagal maka akan keluar error
    else {
      res.json({
        message: "Data has been added"
      });
    }
  });
});

app.put("/editUser/:id", isAuthorized, function(req, res) {
  let data = // membuat variabel data yang berisi sintaks untuk mengupdate tabel di database
    'UPDATE akun SET nama="' +
    req.body.nama +
    '", alamat="' +
    req.body.alamat +
    '", password="' +
    req.body.password +
    '", no_telp="' +
    req.body.telepon +
    '", email="' +
    req.body.email +
    '" where id=' +
    req.params.id;
  db.query(data, function(err, result) {
    // mengupdate data di database
    if (err) throw err;
    // jika gagal maka akan keluar error
    else {
      res.json({
        success: true,
        message: "Data has been updated"
      });
    }
  });
});

app.delete("/deleteUser/:id", isAuthorized, function(req, res) {
  // membuat end point delete
  let id = "delete from akun where id=" + req.params.id;

  db.query(id, function(err, result) {
    // mengupdate data di database
    if (err) throw err;
    // jika gagal maka akan keluar error
    else {
      res.json({
        success: true,
        message: "Data has been Deleted"
      });
    }
  });
});

// CRUD TRANSAKSI

app.post("/barang/:id/take", isAuthorized, (req, res) => {
  let data = req.body;

  db.query(
    `
      insert into transaksi (id_akun, id_barang, jumlah, harga, total_harga)
      values ('` +
      data.id_akun +
      `', '` +
      req.params.id +
      `', '` +
      data.jumlah +
      `', '` +
      data.harga +
      `', '` +
      data.jumlah +
      `' * '` +
      data.harga +
      `')
      `,
    (err, result) => {
      if (err) throw err;
    }
  );

  db.query(
    `
      update barang
      set stok = stok - '` +
      data.jumlah +
      `'
      where id = '` +
      req.params.id +
      `'
      `,
    (err, result) => {
      if (err) throw err;
    }
  );

  res.json({
    message: "Book has been taked by user"
  });
});

app.get("/users/:id/transaksi", isAuthorized, (req, res) => {
  let data = req.params.id;
  db.query(`select * from transaksi where transaksi.id_akun = `+data,
    (err, result) => {
      if (err) throw err;

      res.json({
        message: "succes get user's books",
        data: result
      });
    }
  );
});

app.put("/editTransaksi/:id", isAuthorized, function(req, res) {
  let data = // membuat variabel data yang berisi sintaks untuk mengupdate tabel di database
    'UPDATE transaksi SET id_akun="' +
    req.body.id_akun +
    '", id_barang="' +
    req.body.id_barang +
    '", jumlah="' +
    req.body.jumlah +
    '", harga="' +
    req.body.harga +
    '", total_harga="' +
    req.body.harga * req.body.jumlah +
    '" where id=' +
    req.params.id;
  db.query(data, function(err, result) {
    // mengupdate data di database
    if (err) throw err;
    // jika gagal maka akan keluar error
    else {
      res.json({
        success: true,
        message: "Data has been Edited"
      });
    }
  });
});

app.delete("/deleteTransaksi/:id", isAuthorized, function(req, res) {
  // membuat end point delete
  let id = "delete from transaksi where id=" + req.params.id;

  db.query(id, function(err, result) {
    // mengupdate data di database
    if (err) throw err;
    // jika gagal maka akan keluar error
    else {
      res.json({
        success: true,
        message: "Data has been Deleted"
      });
    }
  });
});

// nama,stok,harga,deskripsi,gambar

app.listen(port, () => console.log(`Example app listening on port port!`));
