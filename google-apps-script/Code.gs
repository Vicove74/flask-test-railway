/**
 * @OnlyCurrentDoc
 * This script processes Romanian orders from an uploaded Excel file,
 * separating them into courier and locker deliveries.
 * FINAL VERSION - FIXED.
 */

// Adds a custom menu when the spreadsheet is opened.
function onOpen() {
  SpreadsheetApp.getUi()
    .createMenu('Romanian Orders')
    .addItem('Process Excel File', 'showUploadDialog')
    .addToUi();
}

/**
 * Displays an HTML dialog for file upload.
 */
function showUploadDialog() {
  const html = HtmlService.createHtmlOutputFromFile('UploadDialog')
    .setWidth(400)
    .setHeight(150);
  SpreadsheetApp.getUi().showModalDialog(html, 'Upload Excel Order File');
}

/**
 * Processes the uploaded file data sent from the client-side HTML.
 * @param {object} fileDataObject An object containing the file's name, mimeType, and base64 encoded content.
 * @return {string} A summary message of the processing results.
 */
function processFileFromUpload(fileDataObject) {
  try {
    // FIXED: Pass base64 string directly instead of decoding it first
    // The XLSX library will handle the base64 decoding internally
    const workbook = XLSX.read(fileDataObject.bytes, {type: 'base64'});

    const sheetName = workbook.SheetNames[0];
    const worksheet = workbook.Sheets[sheetName];
    const sourceData = XLSX.utils.sheet_to_json(worksheet, { header: 1 });

    if (sourceData.length <= 1) {
      throw new Error('The uploaded file contains no data to process.');
    }

    // Pass the data to the core processing logic.
    return _coreProcessingLogic(sourceData);

  } catch (e) {
    return 'An error occurred: ' + e.message;
  }
}

/**
 * The main logic for processing the Romanian order data.
 * @param {Array<Array<string>>} sourceData The 2D array of data read from the sheet.
 * @return {string} The final summary message.
 */
function _coreProcessingLogic(sourceData) {
  const headers = sourceData[0];
  const dataRows = sourceData.slice(1);

  // Map column headers to their index for easy access.
  const headerMap = headers.reduce((acc, header, index) => {
    acc[header] = index;
    return acc;
  }, {});

  const courierOrdersOutput = [];
  const lockerOrdersOutput = [];
  const outputHeadersInOut = ["Type", "Company/Name of Client", "Country", "Courier ID", "Service type", "Order Number-Client", "Date", "Recipient", "Product/SKU", "Number of Products", "Postcode", "Region", "City", "Address", "Address notes", "Telephone", "e-mail", "Number of Packages", "Insurance", "Preview", "Saturday Delivery", "Weight", "Width", "Height", "Length", "Cash on Delivery", "Contents"];
  courierOrdersOutput.push(outputHeadersInOut);

  const lockerHeaders = ['', 'Consignment Note Name'].concat(headers);
  lockerOrdersOutput.push(lockerHeaders);

  const today = Utilities.formatDate(new Date(), Session.getScriptTimeZone(), "dd.MM.yyyy");

  dataRows.forEach(row => {
    const shippingMethod = (row[headerMap['Shipping method']] || '').toLowerCase();
    const orderNumber = row[headerMap['Order number']];
    const awbNumber = row[headerMap['AWB number']];

    if (shippingMethod === 'courier') {
      const quantity = parseInt(row[headerMap['Quantity']], 10) || 1;

      for (let i = 0; i < quantity; i++) {
        const addressParts = (row[headerMap['Shipping address']] || '').split(',').map(part => part.trim());
        const city = addressParts.length > 2 ? addressParts[addressParts.length - 3] : '';
        const region = addressParts.length > 2 ? addressParts[addressParts.length - 2] : '';

        const paymentMethod = (row[headerMap['Payment method']] || '').toLowerCase();
        const cashOnDelivery = (paymentMethod !== 'card online' && paymentMethod !== '') ? row[headerMap['Total price with VAT']] : '0';

        const newRow = [
          'order', '591', 'RO', '8', 'crossborder',
          orderNumber, today, row[headerMap['Shipping name']],
          row[headerMap['Product code']], '1',
          row[headerMap['Shipping postal code']], region, city,
          row[headerMap['Shipping address']], row[headerMap['Observations']] || '',
          row[headerMap['Shipping phone']], '',
          '1', '', '', '', '1', '10', '10', '10',
          cashOnDelivery, 'cosmetics'
        ];
        courierOrdersOutput.push(newRow);
      }
    } else if (shippingMethod === 'locker') {
      const consignmentNoteName = `${orderNumber}_eMAG_Courier_${awbNumber}.pdf`;
      const newRow = ['', consignmentNoteName].concat(row);
      lockerOrdersOutput.push(newRow);
    }
  });

  let finalMessage = 'Processing complete!\n\n';

  if (courierOrdersOutput.length > 1) {
    const suggestedName = `InOut_RO_${Utilities.formatDate(new Date(), Session.getScriptTimeZone(), "yyyy-MM-dd")}`;
    const newSpreadsheet = SpreadsheetApp.create(suggestedName);
    const newSheet = newSpreadsheet.getSheets()[0];
    newSheet.getRange(1, 1, courierOrdersOutput.length, courierOrdersOutput[0].length).setValues(courierOrdersOutput);
    finalMessage += `A new file named "${suggestedName}" has been created with ${courierOrdersOutput.length - 1} courier order lines. You can find it in your Google Drive.\nURL: ${newSpreadsheet.getUrl()}\n\n`;
  } else {
    finalMessage += 'No courier orders were found to process.\n\n';
  }

  if (lockerOrdersOutput.length > 1) {
    const ss = SpreadsheetApp.getActiveSpreadsheet();
    let lockerSheet = ss.getSheetByName('Locker Deliveries');
    if (lockerSheet) {
      lockerSheet.clear();
    } else {
      lockerSheet = ss.insertSheet('Locker Deliveries');
    }

    lockerSheet.getRange(1, 1, lockerOrdersOutput.length, lockerOrdersOutput[0].length).setValues(lockerOrdersOutput);
    lockerSheet.getRange(2, 1, lockerOrdersOutput.length - 1, 1).insertCheckboxes();
    finalMessage += `A sheet named "Locker Deliveries" has been created/updated in the current file with ${lockerOrdersOutput.length - 1} locker orders.`;
  } else {
    finalMessage += 'No locker delivery orders were found.';
  }

  return finalMessage;
}
