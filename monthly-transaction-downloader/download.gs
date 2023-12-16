function get_month_blob(year, month, income, restaurant) {
  // income=true indicates 收入, income=false indicates everything else.

  // --------
  // Get data from main sheets and filter for given month and year.
  //  * This is done by copying the data from a "data_sheet" to a formatted "copy_sheet".
  //  * Then, we print the "copy sheet", leaving the "data_sheet" unchanged.
  // --------
  const sheets = SpreadsheetApp.getActiveSpreadsheet()

  const data_sheet_id = (restaurant === 'sv') ? sv_sheet_id : sushi_sheet_id

  let data_sheet, copy_sheet
  sheets.getSheets().forEach(sheet => {
    if (sheet.getSheetId() === data_sheet_id) data_sheet = sheet
    if (sheet.getSheetId() === copy_sheet_id) copy_sheet = sheet
  })
  if (!data_sheet) throw new Error(`data_sheet not found with id ${data_sheet_id}.`)
  if (!copy_sheet) throw new Error(`copy_sheet not found with id ${copy_sheet_id}.`)

  // Get all data from the data_sheet
  const input_data = data_sheet.getRange(`A1:F${data_sheet.getLastRow()}`).getValues()

  // Find which rows matches the year and month that we want to download.
  copied_data = []
  input_data.forEach(row => {
    const date_effective = new Date(row[2])
    const eff_year = date_effective.getFullYear()
    const eff_month = date_effective.getMonth() + 1

    if (eff_year == year && eff_month == month) {
      if ((income && row[1] == '收入') || ((!income) && row[1] != '收入')) copied_data.push(row)
    }
  })
  if (!copied_data.length) throw new Error(`No hay data para ${year}-${month}`)

  // Sort copied data by date.
  copied_data.sort((a, b) => {
    return new Date(a[2]).getDate() - new Date(b[2]).getDate()
  })

  const n = copied_data.length

  // --------
  // Copy data and format it into the copy_sheet.
  // --------
  copy_sheet.getRange(`A2:F${copy_sheet.getLastRow()}`).clearContent().setBackground('white') // clear values in sheet
  copy_sheet.getRange(`A2:F${n + 1}`).setValues(copied_data) // copy data into sheet
  
  // add a total at the last row
  copy_sheet.getRange(`A${n + 2}:F${n + 2}`).setBackground('#cccccc') 
  copy_sheet.getRange(`C${n + 2}`).setValue('总额')
  copy_sheet.getRange(`D${n + 2}`).setFormula(`=SUM(D2:D${n + 1})`)

  SpreadsheetApp.flush()

  // --------
  // Print output
  // --------

  // We can download the sheet using a URL:
  const url = "https://docs.google.com/spreadsheets/d/" + sheets.getId() + "/export" +
    "?format=pdf&" +
    "size=7&" +
    "fzr=true&" +
    "portrait=true&" +
    "fitw=true&" +
    "gridlines=true&" +
    "printtitle=false&" +
    "top_margin=0.127&" +
    "bottom_margin=0.127&" +
    "left_margin=0.5&" +
    "right_margin=0.5&" +
    "sheetnames=false&" +
    "pagenum=UNDEFINED&" +
    "attachment=true&" +
    "gid=" + copy_sheet.getSheetId() + '&' +
    "r1=0&c1=0&r2=" + (n + 2) + "&c2=6"

  // Make download request.
  let response, i = 0
  const params = {
    method: "GET",
    muteHttpExceptions: true,
    headers: { "authorization": "Bearer " + ScriptApp.getOAuthToken() }
  }
  for (; i < 5; i++) {
    response = UrlFetchApp.fetch(url, params)
    Utilities.sleep(3000)

    // Reading too fast, pause for a bit longer
    if (response.getResponseCode === 429) {
      continue
    } else break
  }

  if (i >= 4) throw new Error("Intentelo otra vez (demasiados requests).")

  return response.getBlob()
}