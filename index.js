const express = require("express");

const app = express();
const PORT = process.env.PORT || 3000;

// Node 18+ içinde fetch global olarak var

app.get("/igmg", async (req, res) => {
    try {
        const url = "https://www.igmg.org/wp-json/igmg/v1/prayer-times?city=Aachen&country=DE&month=3&year=2026";
        const response = await fetch(url);
        const data = await response.json();

        res.setHeader("Access-Control-Allow-Origin", "*");
        res.json(data);

    } catch (err) {
        console.error("IGMG API error:", err);
        res.status(500).send("IGMG API error");
    }
});

app.listen(PORT, () => {
    console.log("IGMG proxy running on port " + PORT);
});