# Google Apps Script - Romanian Orders Processor

## 🔧 Fixed Issues

**Problem:** `t.charCodeAt is not a function` error when processing Excel files.

**Solution:** Changed the data type passed to XLSX library from decoded byte array to base64 string.

## 📁 Files

1. **Code.gs** - Main Google Apps Script code with the fix
2. **XLSX.gs** - XLSX library for reading Excel files
3. **UploadDialog.html** - HTML dialog for file upload

## 🚀 How to Use

### Step 1: Create a New Google Sheets Project

1. Go to [Google Sheets](https://sheets.google.com)
2. Create a new spreadsheet
3. Click on **Extensions** → **Apps Script**

### Step 2: Add the Script Files

1. In the Apps Script editor, delete the default `Code.gs` content
2. Paste the content of **Code.gs** into the editor
3. Click the **+** button next to "Files" and select **Script** to add a new file
4. Name it `XLSX` (or `XLSX.gs`)
5. Paste the content of **XLSX.gs**
6. Click the **+** button again and select **HTML** to add an HTML file
7. Name it `UploadDialog`
8. Paste the content of **UploadDialog.html**

### Step 3: Save and Authorize

1. Click the **Save** icon (💾)
2. Close the Apps Script editor
3. Refresh your Google Sheet
4. You should see a new menu called **"Romanian Orders"** appear in the menu bar
5. Click **Romanian Orders** → **Process Excel File**
6. You may need to authorize the script on first use

## 🎯 What It Does

This script processes Romanian orders from an Excel file and:

1. **Courier Orders**: Creates a new Google Sheet with formatted courier delivery data
2. **Locker Orders**: Creates/updates a "Locker Deliveries" sheet in the current spreadsheet

## 📝 Key Fix Details

### Before (Bug):
```javascript
const decodedContent = Utilities.base64Decode(fileDataObject.bytes);
const workbook = XLSX.read(decodedContent, {type: "array"});
```

### After (Fixed):
```javascript
const workbook = XLSX.read(fileDataObject.bytes, {type: 'base64'});
```

**Why this works:**
- `Utilities.base64Decode()` returns a Google Apps Script `Byte[]` object
- This object is not compatible with JavaScript's standard array methods
- The XLSX library expects either a standard JavaScript array or a base64 string
- By passing the base64 string directly, we let the library handle the decoding internally

## ⚠️ Important Notes

- The script requires authorization to:
  - Create new spreadsheets
  - Access the current spreadsheet
  - Display dialogs
- Excel files must be in `.xlsx` format
- The script expects specific column headers in the Excel file:
  - Shipping method
  - Order number
  - AWB number
  - Quantity
  - Shipping address
  - Payment method
  - Total price with VAT
  - Shipping name
  - Product code
  - Shipping postal code
  - Observations
  - Shipping phone

## 🐛 Troubleshooting

If you still encounter errors:

1. Make sure all three files are properly added to the Apps Script project
2. Check that file names match exactly (Code.gs, XLSX.gs, UploadDialog.html)
3. Try refreshing the Google Sheet after adding the scripts
4. Check the browser console (F12) for any client-side errors
5. View Apps Script execution logs: Apps Script Editor → Executions

## 📧 Support

If issues persist, check the execution logs in the Apps Script editor for detailed error messages.
