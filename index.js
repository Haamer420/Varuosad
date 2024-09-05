const express = require('express');
const fs = require('fs');
const path = require('path');
const readline = require('readline');

const app = express();
const PORT = 3300;

let spareParts = [];


const loadCSV = async () => {
  const fileStream = fs.createReadStream(path.join(__dirname, 'LE.txt'));

  const rl = readline.createInterface({
    input: fileStream,
    crlfDelay: Infinity,
  });

  for await (const line of rl) {
    const columns = line.split('\t');
    if (columns.length > 1) {
      const part = {
        name: columns[1].trim(),
        sn: columns[0].trim(),
        price: columns[7].trim(),
      };
      spareParts.push(part);
    }
  }

  console.log('CSV fail laetud mällu.');
};

loadCSV();


app.get('/spare-parts', (req, res) => {
  let results = [...spareParts];


  if (req.query.name) {
    results = results.filter(part =>
      part.name.toLowerCase().includes(req.query.name.toLowerCase())
    );
  }
  
  if (req.query.sn) {
    results = results.filter(part =>
      part.sn.toLowerCase().includes(req.query.sn.toLowerCase())
    );
  }


  if (req.query.sort) {
    const sortField = req.query.sort.replace('-', '');
    const sortOrder = req.query.sort.startsWith('-') ? -1 : 1;

    results.sort((a, b) => {
      if (a[sortField] < b[sortField]) {
        return -1 * sortOrder;
      } else if (a[sortField] > b[sortField]) {
        return 1 * sortOrder;
      } else {
        return 0;
      }
    });
  }

  
  const page = parseInt(req.query.page, 10) || 1;
  const pageSize = parseInt(req.query.pageSize, 10) || 30;
  const startIndex = (page - 1) * pageSize;
  const endIndex = page * pageSize;
  const paginatedResults = results.slice(startIndex, endIndex);

  
  const response = {
    page,
    pageSize,
    total: results.length,
    totalPages: Math.ceil(results.length / pageSize),
    data: paginatedResults,
  };

  res.setHeader('Content-Type', 'application/json');
  res.send(JSON.stringify(response, null, 2));
});

app.listen(PORT, () => {
  console.log(`Server töötab pordil ${PORT}`);
});
