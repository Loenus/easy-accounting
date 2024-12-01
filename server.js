const express = require('express');
const multer = require('multer');
const xlsx = require('xlsx');
const path = require('path');
const fs = require('fs');

require("dotenv").config();
const app = express();
const PORT = process.env.PORT || 3000;

app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, 'uploads/'); // Cartella di destinazione
    },
    filename: function (req, file, cb) {
        cb(null, Date.now() + path.extname(file.originalname)); // Nome univoco
    }
});
const upload = multer({ storage: storage });

app.get('/', (req, res) => {
    res.render('index', { title: 'Home Page' });
});

app.post('/upload', upload.single('file'), (req, res) => {
    try {
        console.log('File caricato:', req.file);
        const filePath = req.file.path;

        const workbook = xlsx.readFile(filePath);
        const sheetName = workbook.SheetNames[0];
        const newdata = xlsx.utils.sheet_to_json(workbook.Sheets[sheetName]);

        const testFilePath = './test.xlsx';
        let testWorkbook;
        if (fs.existsSync(testFilePath)) {
          testWorkbook = xlsx.readFile(testFilePath);
        } else {
          testWorkbook = xlsx.utils.book_new();
        }
        const testSheetName = testWorkbook.SheetNames[0] || 'Sheet1';
        const testSheet = testWorkbook.Sheets[testSheetName] || xlsx.utils.aoa_to_sheet([[]]);
        const testData = xlsx.utils.sheet_to_json(testSheet, { header: 1 });

        newdata.forEach(row => {
            testData.push(Object.values(row));
        })
        const updatedSheet = xlsx.utils.aoa_to_sheet(testData);
        testWorkbook.Sheets[testSheetName] = updatedSheet;
        xlsx.writeFile(testWorkbook, testFilePath);

        console.log('Dati estratti:', newdata);
        res.send(`File elaborato con successo: ${req.file.filename}`);
    } catch (err) {
        console.error(err);
        res.status(500).send('Errore durante il caricamento del file.');
    }
});

app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});