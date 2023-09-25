const express = require('express');
const http = require('http');
const { SerialPort } = require('serialport');
const { ReadlineParser } = require('@serialport/parser-readline');

const app = express();
const server = http.createServer(app);
const port = new SerialPort({ path: 'COM6', baudRate: 9600 });
const parser = port.pipe(new ReadlineParser({ delimiter: '\r\n' }));

let latestSerialData = '';

app.use(express.static('public'));

// Menggunakan fungsi untuk memproses data timbangan
function processData(rawData) {
  const startIndex = rawData.indexOf('n') + 1; // Mencari indeks setelah huruf 'n'
  const endIndex = rawData.indexOf('kg'); // Mencari indeks sebelum 'kg'
  const numericData = rawData.substring(startIndex, endIndex);

  // Menghapus angka nol di depan angka
  const trimmedData = numericData.replace(/^0+/, '');

  return trimmedData;
}

app.get('/data', (req, res) => {
  res.json({ data: latestSerialData });
});

// Menangani data yang diterima dari timbangan
parser.on('data', (data) => {
  // Memproses data dari timbangan
  const processedData = processData(data);

  // Memperbarui latestSerialData dengan data yang telah diproses
  latestSerialData = processedData;
});

server.listen(3000, () => {
  console.log('Server is running on port 3000');
});
