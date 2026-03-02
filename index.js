const express = require("express");
const fetch = require("node-fetch");
const cheerio = require("cheerio");

const app = express();
const PORT = process.env.PORT || 3000;

app.get("/viyana", async (req, res) => {
    try {
        const url = "https://namazvakitleri.diyanet.gov.tr/tr-TR/9541/viyana-icin-namaz-vakti";
        const response = await fetch(url);
        const html = await response.text();

        const $ = cheerio.load(html);
        const result = {};

        $(".timetable tbody tr").each((i, row) => {
            const cols = $(row).find("td");
            if (cols.length >= 2) {
                const name = $(cols[0]).text().trim();
                const time = $(cols[1]).text().trim();
                if (/^[0-9]{1,2}:[0-9]{2}$/.test(time)) {
                    result[name] = time;
                }
            }
        });

        res.setHeader("Access-Control-Allow-Origin", "*");
        res.json(result);

    } catch (err) {
        console.error("Parse error:", err);
        res.status(500).send("Parse error");
    }
});

app.listen(PORT, () => {
    console.log("Diyanet Viyana API running on port " + PORT);
});
