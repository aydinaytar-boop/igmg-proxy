const express = require("express");
const fetch = require("node-fetch");
const cheerio = require("cheerio");

const app = express();
const PORT = process.env.PORT || 3000;

app.get("/viyana", async (req, res) => {
    try {
        const url = "https://namazvakitleri.diyanet.gov.tr/tr-TR/11618/viyana-namaz-vakitleri";
        const response = await fetch(url);
        const html = await response.text();
        const $ = cheerio.load(html);

        const result = {};

        // Bugünün tarihi (ör: 02.03.2026)
        const today = new Date();
        const gun = String(today.getDate()).padStart(2, "0");
        const ay = String(today.getMonth() + 1).padStart(2, "0");
        const yil = today.getFullYear();
        const bugunTarih = `${gun}.${ay}.${yil}`;

        let todayRow = null;

        // Tablodaki satırlarda bugünün tarihini ara
        $("table tbody tr").each((i, row) => {
            const rowText = $(row).text();
            if (rowText.includes(bugunTarih)) {
                todayRow = row;
            }
        });

        if (!todayRow) {
            throw new Error("Bugünün satırı bulunamadı");
        }

        // Başlıkları al
        const headers = [];
        $("table thead tr th").each((i, th) => {
            headers.push($(th).text().trim());
        });

        // Bugünün satırındaki kolonları al
        const cols = $(todayRow).find("td");

        cols.each((i, col) => {
            const header = headers[i] || "";
            const value = $(col).text().trim();

            if (/^[0-9]{1,2}:[0-9]{2}$/.test(value)) {
                result[header] = value;
            }
        });

        res.setHeader("Access-Control-Allow-Origin", "*");
        res.json(result);

    } catch (err) {
        console.error("Parse error detail:", err);
        res.status(500).send("Parse error");
    }
});

app.listen(PORT, () => {
    console.log("Diyanet Viyana API running on port " + PORT);
});
