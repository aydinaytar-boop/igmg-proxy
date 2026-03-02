const express = require("express");
const fetch = require("node-fetch");

const app = express();
const PORT = process.env.PORT || 3000;

app.get("/viyana", async (req, res) => {
    try {
        const url = "https://api.igmg.org/v1/prayertimes?country=AT&city=Vienna";
        const response = await fetch(url);

        if (!response.ok) {
            throw new Error("HTTP status " + response.status);
        }

        const data = await response.json();
        const today = data.data[0]; // IGMG formatı

        const result = {
            İmsak: today.Fajr,
            Güneş: today.Sunrise,
            Öğle: today.Dhuhr,
            İkindi: today.Asr,
            Akşam: today.Maghrib,
            Yatsı: today.Isha
        };

        res.setHeader("Access-Control-Allow-Origin", "*");
        res.json(result);

    } catch (err) {
        console.error("IGMG error:", err);
        res.status(500).send("Parse error: " + err.message);
    }
});

app.listen(PORT, () => {
    console.log("IGMG Viyana API running on port " + PORT);
});
