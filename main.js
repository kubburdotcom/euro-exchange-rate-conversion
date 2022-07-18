const express = require('express');
const fetch = require('node-fetch');
const xml2js = require('xml2js');

const app = express();
const parser = new xml2js.Parser;

app.disable('x-powered-by');

app.get('/', async (req, res) => {
    const rates = await fetch('https://www.ecb.europa.eu/stats/eurofxref/eurofxref-daily.xml');
    const json_rates = await parser.parseStringPromise(await rates.text());

    let rates_array = [];
    let response_json = {
        "$comment": "This shows the value of 1 EUR in other currencies, not the other way around.",
        subject: json_rates["gesmes:Envelope"]["gesmes:subject"][0],
        sender: json_rates["gesmes:Envelope"]["gesmes:Sender"][0]["gesmes:name"][0],
        last_updated: {
            iso: new Date(json_rates["gesmes:Envelope"]["Cube"][0]["Cube"][0]["$"]["time"]).toISOString(),
            utc: new Date(json_rates["gesmes:Envelope"]["Cube"][0]["Cube"][0]["$"]["time"]).toUTCString(),
            unix: new Date(json_rates["gesmes:Envelope"]["Cube"][0]["Cube"][0]["$"]["time"]).getTime()
        },
        retrieved_from_cache: false,
        rates: rates_array
    };

    json_rates["gesmes:Envelope"]["Cube"][0]["Cube"][0]["Cube"].map(rate => {
        rates_array.push(rate["$"]);
    });

    res.send(response_json);
});

app.listen(8080, () => {
    console.log('Listening on port 8080');
});