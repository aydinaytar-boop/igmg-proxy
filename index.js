const express = require("express");
const fetch = require("node-fetch");
const cheerio = require("cheerio");

const app = express();
const PORT = process.env.PORT || 3000;

app.get("/viyana", async (req, res) => {
    try {
        const url = "https://www.derislam.at/gebetszeiten";
        const response = await fetch(url);
        const html = await response.text();

        const $ = cheerio.load(html);

        const result = {};

        $("table tbody tr").each((i, row) => {
            const cols = $(row).find("td");
            const name = $(cols[0]).text().trim();
            const time = $(cols[1]).text().trim();
            result[name] = time;
        });

        res.setHeader("Access-Control-Allow-Origin", "*");
        res.json(result);

    } catch (err) {
        console.error("Parse error:", err);
        res.status(500).send("Parse error");
    }
});

app.listen(PORT, () => {
    console.log("Viyana API running on port " + PORT);
});
