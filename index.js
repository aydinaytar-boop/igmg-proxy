const express = require("express");
const fetch = require("node-fetch");
const cheerio = require("cheerio");

const app = express();
const PORT = process.env.PORT || 3000;

// Türkçe ay adları
const aylar = [
    "Ocak", "Şubat", "Mart", "Nisan", "Mayıs", "Haziran",
    "Temmuz", "Ağustos", "Eylül", "Ekim", "Kasım", "Aralık"
];

app.get("/viyana", async (req, res) => {
    try {
        const url = "https://namazvakitleri.diyanet.gov.tr/tr-TR/11618/viyana-namaz-vakitleri";
        const response = await fetch(url);
        const html = await response.text();
        const $ = cheerio.load(html);

        const result = {};

        // Bugünün tarihi (ör: "02 Mart 2026")
        const now = new Date();
        const gun = String(now.getDate()).padStart(2, "0");
        const ay = aylar[now.getMonth()];
        const yil = now.getFullYear();
        const bugun = `${gun} ${ay} ${yil}`;

        let todayRow = null;

        // Tablodaki satırlarda bugünün tarihini ara
        $("table.vakit-table tbody tr").each((i, row) => {
            const tarih = $(row).find("td").first().text().trim();
            if (tarih.includes(bugun)) {
                todayRow = row;
            }
        });

        if (!todayRow) {
            throw new Error("Bugünün satırı bulunamadı");
        }

        const cols = $(todayRow).find("td");

        result["İmsak"] = $(cols[2]).text().trim();
        result["Güneş"] = $(cols[3]).text().trim();
        result["Öğle"] = $(cols[4]).text().trim();
        result["İkindi"] = $(cols[5]).text().trim();
        result["Akşam"] = $(cols[6]).text().trim();
        result["Yatsı"] = $(cols[7]).text().trim();

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
