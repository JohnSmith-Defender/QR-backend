const express = require("express");
const cors = require('cors');

const app = express();

app.use(cors());

let saveMap = new Map();
const delayTime = 10 * 1000; // Delay time in milliseconds (10 seconds)

const getdata = async (unicode, res) => {
    if (!unicode) return;
    const apiKey = "AIzaSyDfp2_dl03fuS3s7Zzyo9p1FwIXxsj5Kf4";
    const spreadsheetId = "16evFayHhtojvEJQz21lr1Gmb2K1mUl9dlbWJnSbt9WA";
    const sheetName = "Form Responses";

    const url = `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values/${sheetName}?key=${apiKey}`;

    try {
        const response = await fetch(url);
        const data = await response.json();
        const fetchdata = data.values;
        let getindex = 0;
        let getdata = fetchdata.filter((val, index) => {
            if (val[8] === unicode) {
                getindex = index;
                return val;
            }
        });

        if (getdata.length === 0) {
            res.status(404).json({ ok: false, message: "Data not found" });
            return;
        }

        let returndata = {
            index: getindex,
            submissionDate: getdata[0][0],
            firstName: getdata[0][1],
            lastName: getdata[0][2],
            phoneNumber: getdata[0][3],
            eMail: getdata[0][4],
            products: getdata[0][5],
            uniqueId: getdata[0][6],
            total: getdata[0][7],
            unicode: getdata[0][8],
            qrCode: getdata[0][9],
        };
        res.json({ ok: true, returndata });
    } catch (error) {
        res.status(500).json({ ok: false, message: "Failed to fetch data", error });
        console.error("Error:", error);
    }
}

const requestHandle = async (req, res) => {
    const UNICODE = req.query.UNICODE;
    if (!UNICODE) {
        res.status(400).json({ ok: false, message: "UNICODE parameter is required" });
        return;
    }

    const currentTime = Date.now();
    const lastRequestTime = saveMap.get(UNICODE);

    if (lastRequestTime && (currentTime - lastRequestTime < delayTime)) {
        res.json({ ok: false, message: "Rate limit exceeded. Try again later." });
        return;
    }

    saveMap.set(UNICODE, currentTime);
    await getdata(UNICODE, res);
}

app.get('/read', requestHandle);

app.listen(5000, () => console.log("Server is listening at 5000!"));
