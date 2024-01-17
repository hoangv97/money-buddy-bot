import { GoogleSpreadsheet } from 'google-spreadsheet';
import { JWT } from 'google-auth-library';

const SCOPES = [
  'https://www.googleapis.com/auth/spreadsheets',
  'https://www.googleapis.com/auth/drive.file',
];

const jwt = new JWT({
  email: process.env.GOOGLE_SHEET_CLIENT_EMAIL,
  key: process.env.GOOGLE_SHEET_PRIVATE_KEY,
  scopes: SCOPES,
});

export const addRow = async (rowValues: any, sheetId = 0) => {
  const doc = new GoogleSpreadsheet(process.env.GOOGLE_SHEET_DOC_ID || '', jwt);
  await doc.loadInfo();

  const sheet = doc.sheetsByIndex[sheetId];

  const response = await sheet.addRow(rowValues);
  return response;
};

export const getRows = async (sheetId = 0) => {
  const doc = new GoogleSpreadsheet(process.env.GOOGLE_SHEET_DOC_ID || '', jwt);
  await doc.loadInfo();

  const sheet = doc.sheetsByIndex[sheetId];

  const rows = await sheet.getRows();
  return rows;
};
