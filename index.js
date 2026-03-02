const express = require("express");
const fetch = require("node-fetch");

const app = express();
const PORT = process.env.PORT || 3000;

const URL = "https://namazvakitleri.diyanet.gov.tr/api/PrayerTimes?cityId=11618";

// 1) Ham cevap: ne dönüyor, önce onu görelim
app.get("/viyana-raw", async (req, res) => {
    try {
        const response = await fetch(URL);
        const text = await response.text();

        res.setHeader("Content-Type", "text/plain; charset=utf-8");
        res.setHeader("Access-Control-Allow-Origin", "*");
        res.send(text);
    } catch (err) {
        console.error("RAW error:", err);
        res.status(500).send("RAW error: " + err.message);
    }
});

// 2) Güzel JSON (ham cevap düzgünse)
app.get("/viyana", async (req, res) => {
    try {
        const response = await fetch(URL);

        if (!response.ok) {
            throw new Error("HTTP status " + response.status);
        }

        const data = await response.json();

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
        console.error("JSON error:", err);
        res.status(500).send("Parse error: " + err.message);
    }
});

app.listen(PORT, () => {
    console.log("API running on port " + PORT);
});
