
const express = require('express');
const { google } = require('googleapis');
const fs = require('fs');

const app = express();
const PORT = 4000;

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static('public'));
app.set("view engine", "ejs");

const CREDENTIALS = JSON.parse(fs.readFileSync('client_secret.json'));

function authorize() {
  const { client_secret, client_id, redirect_uris } = CREDENTIALS.web;
  const oAuth2Client = new google.auth.OAuth2(client_id, client_secret, redirect_uris[0]);

  const token = fs.readFileSync('token.json');
  oAuth2Client.setCredentials(JSON.parse(token));
  return oAuth2Client;
}

app.get('/', (req, res) => {
  res.render('index');
})

app.post('/submit', async (req, res) => {
  const {name, email, message} = req.body;
  console.log(name + " " + email + " " + message);
  const auth = authorize();

  const sheets = google.sheets({ version: 'v4', auth });
  const values = [[name, email, message]];

  const resource = {
    values,
  };

  try {
    await sheets.spreadsheets.values.append({
      spreadsheetId: '1FR7mqyBcEIM5eOKB891GOUDQs7B7ahPNW7T3BXRBIkw', 
      range: 'Sheet1!A:C', 
      valueInputOption: 'RAW',
      resource,
    });
    res.send('Data submitted successfully!');
  } catch (error) {
    console.error('Error appending data to Google Sheets', error);
    res.status(500).send('Error submitting data');
  }
});

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
