const express = require('express');
const http = require('http');
const { SerialPort } = require('serialport');
const { ReadlineParser } = require('@serialport/parser-readline');
const mysql = require('mysql');
const bodyParser = require('body-parser');

const app = express();
const server = http.createServer(app);
const port = new SerialPort({ path: 'COM6', baudRate: 9600 });
const parser = port.pipe(new ReadlineParser({ delimiter: '\r\n' }));

let latestSerialData = ''; 
// Konfigurasi koneksi MySQL
const db = mysql.createConnection({
  host: 'localhost',
  user: 'root',
  password: '',
  database: 'node'
});

db.connect((err) => {
  if (err) {
    console.error('Error connecting to MySQL:', err);
  } else {
    console.log('Connected to MySQL');
  }
});

app.use(express.static('public'));
app.use(bodyParser.json());

app.get('/data', (req, res) => {
  res.json({ data: latestSerialData });
});

app.post('/saveData', (req, res) => {
    const dataToSave = req.body.data;
  
    const now = new Date();
    const formattedDate = now.toISOString().slice(0, 10);
    const formattedTime = now.toISOString().slice(11, 19);
  
    const sql = 'INSERT INTO berat (berat, tanggal, jam) VALUES (?, ?, ?)';
    db.query(sql, [dataToSave, formattedDate, formattedTime], (err, result) => {
      if (err) {
        console.error('Error saving data:', err);
        res.status(500).send('Error saving data');
      } else {
        console.log('Data saved to database');
        res.status(200).send('Data saved successfully');
      }
    });
  });

parser.on('data', (data) => {
  latestSerialData = data; // Memperbarui data serial terbaru
});

server.listen(3000, () => {
  console.log('Server is running on port 3000');
});
