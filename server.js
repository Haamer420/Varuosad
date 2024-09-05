const { parse } = require("csv-parse");
const fs = require("fs");
const express = require("express");
const app = express();



// specify the path of the CSV file
const path = "./LE.txt";
const records = [];

generateJson();

async function search() {
  app.get("/search/:searchString", (req, res) => {
    let items = [];
    let currentPage = req.query.page;
    const itemsPerPage = 30
    const dataSearch = req.params.searchString

    if (dataSearch !== undefined) {
      searchLoop(records, dataSearch);
    } else {
      console.log("No valid search parameters provided");
    }

    if (currentPage === undefined) {
      currentPage = 1;
    }

    

    function searchLoop(response, data) {
      for (let item in response) {
        if (response[item].name === data || response[item].ID === data) {
          items.push(response[item]);
        }
      }
    }

    function getItemsForCurrentPage() {
      const start = (currentPage - 1) * itemsPerPage;
      const end = currentPage * itemsPerPage;
      return items.slice(start, end);
    }

    console.log(JSON.stringify(getItemsForCurrentPage()));
    res.send(JSON.stringify(getItemsForCurrentPage()));
  });
}

function generateJson() {
  const parser = fs.createReadStream(path).pipe(
    parse({
      delimiter: "/n",
      rowdelimiter: " ",
      from_line: 1,
      relax_quotes: true,
      escape: "\\",
    })
  );

  parser.on("readable", function () {
    let record;

    while ((record = parser.read()) !== null) {
      record[0] = record[0].replaceAll("\t", "ˇ");
      record[0] = record[0].split("ˇ");

      for (let i = 0; i < record[0].length; i++) {
        record[0][i] = record[0][i].substring(1, record[0][i].length - 1);
      }

      record[0] = {
        ID: record[0][0],
        name: record[0][1],
        something1: record[0][2],
        something2: record[0][3],
        something3: record[0][4],
        something4: record[0][5],
        something5: record[0][6],
        something6: record[0][7],
        something7: record[0][8],
        something8: record[0][9],
        something9: record[0][10],
      };
      records.push(record[0]);
    }
  });

  parser.on("error", function (error) {
    console.log(error.message);
  });
  parser.on("end", function () {
    search();

    console.log("done");
  });
}

app.listen(3000, ()=>{
  console.log("Server running on port 3000")
});