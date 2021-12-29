import express from "express";
const app = express();
const port = 9000;

const one: number = 1;
const two: number = 2;


app.get("/", ( _req, res) => res.send(`1 + 2 = ${one + two}! How neat!`));

app.listen(port);

console.log(`[app]: http://localhost:${port}`);
