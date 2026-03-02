const express = require("express");
const fetch = require("node-fetch");

const app = express();
const PORT = process.env.PORT || 3000;

app.get("/viyana", async (req, res) => {
    try {
        const url = "https://namazvakitleri.diyanet.gov.tr/api/PrayerTimes?cityId=11618";
        const response = await fetch(url);
        const data = await response.json();

        // Bugünün verisi ilk eleman
        const today = data[0];

        const result = {
            İmsak: today.Imsak,
            Güneş: today.Gunes,
            Öğle: today.Ogle,
            İkindi: today.Ikindi,
            Akşam: today.Aksam,
            Yatsı: today.Yatsi
        };

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
