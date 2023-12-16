// This function triggers on spreadsheet open,
// and creates the UI to interact with the script from index.html
function trigger_on_open(e) {
  const html = HtmlService.createHtmlOutputFromFile('index').setTitle("Descargador PDF")
  SpreadsheetApp.getUi().showSidebar(html)
}

// ----------------------------------------
// This is the function that the client calls using the UI.
// Functions referenced here can be found in main.gs
//----------------------------------------

function dl_pdf(company, year, month) {
  prelim_checks()

  let blob

  if (company === "SV") {
    blob = download_pdf_sv(year, month)
  } else if (company === "SUSHI") {
    blob = download_pdf_sushi(year, month)
  } else {
    throw new Error("(Manda foto a Yangjie) Company not found: " + company)
  }

  return {
    data: `data:${MimeType.PDF};base64,` + Utilities.base64Encode(blob.getBytes()),
    filename: blob.getName()
  }
}