const mysql = require("mysql");
const inquire = require("inquirer");

let connection = mysql.createConnection({
  host: "localhost",
  port: 3306,

  user: "root",
  password: "root",

  database: "bamazon"
});

// connect to the mysql server and sql database
connection.connect(function(err) {
  if (err) throw err;
  // run the start function after the connection is made to prompt the user
  displayProducts();
});

function displayProducts() {
  connection.query("SELECT * FROM products", function(err, res) {
    if (err) throw err;
    console.log("\n");
    for (let i = 0; i < res.length; i++) {
      console.log(res[i].item_id + " | " + res[i].product_name + " | " + res[i].price + " | " + res[i].stock_quantity);
    }
    console.log("\n")
    buyProducts();
  });
}

function buyProducts() {
  inquire.prompt([
    {
      name: "idChoice",
      message: "Please enter the ID of the product you would like to buy.",
      type: "input"
    },
    {
      name: "numberOfUnits",
      message: "Please enter the quantity of the item you would like to buy.",
      type: "input"
    }
  ]).then(function(answers) {
    let quant = parseInt(answers.numberOfUnits);
    let idChoice = parseInt(answers.idChoice);
    let queryString = "SELECT * FROM products WHERE item_id=?";

    connection.query(queryString, [idChoice], function(error, res) {
      if (error) throw error;
      if (quant > res[0].stock_quantity) {
        console.log("\nInsufficient quantity! Try again.\n");
        displayProducts();
      } else {
        connection.query(
            "UPDATE products SET ? WHERE ?",
            [
              {
                stock_quantity: parseInt(res[0].stock_quantity) - quant
              },
              {
                item_id: idChoice
              }
            ],
            function(error) {
              if (error) throw error;
              console.log("\nPurchase successful!");
              console.log("Total purchase price: $" + res[0].price * quant + "\n");
              inquire.prompt([
                {
                  name: "again",
                  message: "Would you like to purchase more?",
                  type: "confirm"
                }
              ]).then(function(answers) {
                if (answers.again === true) {
                  displayProducts();
                } else if (answers.again === false) {
                  connection.end();
                }
              });
            });
      }
    });

  });
}

