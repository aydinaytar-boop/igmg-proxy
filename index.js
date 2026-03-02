const express = require("express");
const fetch = require("node-fetch");
const cheerio = require("cheerio");

const app = express();
const PORT = process.env.PORT || 3000;

app.get("/viyana", async (req, res) => {
    try {
        const url = "https://namazvakitleri.diyanet.gov.tr/tr-TR/11618/viyana-namaz-vakitleri";
        const response = await fetch(url);

        if (!response.ok) {
            throw new Error("HTTP status " + response.status);
        }

        const html = await response.text();
        const $ = cheerio.load(html);
        const result = {};

        // Mümkün olduğunca genel ama mantıklı bir tablo seçimi:
        // 1) İçinde "İmsak", "Güneş" vb geçen tabloyu bul
        let targetTable = null;

        $("table").each((i, table) => {
            const text = $(table).text();
            if (
                text.includes("İmsak") &&
                text.includes("Güneş") &&
                text.includes("Öğle") &&
                text.includes("İkindi") &&
                text.includes("Akşam") &&
                text.includes("Yatsı")
            ) {
                targetTable = table;
            }
        });

        if (!targetTable) {
            throw new Error("Namaz vakitleri tablosu bulunamadı");
        }

        // Bugünün satırını bulmaya çalış
        // 1) Önce "bugün" işaretli satır var mı diye bak (class vs.)
        let todayRow = null;

        $(targetTable)
            .find("tbody tr")
            .each((i, row) => {
                const rowText = $(row).text();
                // Çok kaba ama işe yarar bir yaklaşım:
                // Satırda hem "İmsak" hem de saat formatı varsa, muhtemelen günlük satırdır
                if (
                    rowText.includes("İmsak") ||
                    rowText.includes("Sabah") ||
                    rowText.includes("Güneş")
                ) {
                    todayRow = row;
                }
            });

        // Eğer böyle bir satır bulamazsak, fallback: ilk satır
        if (!todayRow) {
            todayRow = $(targetTable).find("tbody tr").first();
        }

        if (!todayRow || $(todayRow).length === 0) {
            throw new Error("Bugünün satırı bulunamadı");
        }

        // Şimdi bu satırdan vakitleri çek
        // Varsayım: satırda "İmsak, Güneş, Öğle, İkindi, Akşam, Yatsı" kolonları var
        const headers = [];
        $(targetTable)
            .find("thead tr th")
            .each((i, th) => {
                headers.push($(th).text().trim());
            });

        const cols = $(todayRow).find("td");
        if (cols.length === 0) {
            throw new Error("Bugün satırında kolon yok");
        }

        cols.each((i, col) => {
            const header = headers[i] || "";
            const value = $(col).text().trim();

            if (
                header &&
                /^[0-9]{1,2}:[0-9]{2}$/.test(value)
            ) {
                result[header] = value;
            }
        });

        if (Object.keys(result).length === 0) {
            throw new Error("Hiçbir vakit parse edilemedi");
        }

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
