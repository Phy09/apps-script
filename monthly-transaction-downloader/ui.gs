function trigger_on_open(e) {
  const html = HtmlService.createHtmlOutputFromFile('index').setTitle("Descargador PDF / Comprobador de Copia")
  SpreadsheetApp.getUi().showSidebar(html)
}

// --------------------------------------------
// Purpose: to download the transactions that occured in a month, and neatly format them by date
// uses functions from ONLY 'download.gs'
// --------------------------------------------
function download(year, month, income, restaurant) {
  const blob = get_month_blob(year, month, income, restaurant)

  const output_type = income ? '收入' : '支出'
  const restaurant_name = (restaurant === 'sv') ? "San Vicente" : "Sushi"

  return {
    data: `data:${MimeType.PDF};base64,` + Utilities.base64Encode(blob.getBytes()),
    filename: `${year}-${month.toString().padStart(2, '0')} ${restaurant_name} ${output_type}.pdf`,
  }
}

// --------------------------------------------
// Purpose: to find any duplicate entries in the data, and highlight them.
// uses functions from ONLY 'duplicates.gs'
//
// * NOTE: we require a person to check whether an entry is "duplicate".
//          This is because it is _impossible_ to determine algorithmically with
//          _100% confidence_ whether an entry is duplicate due to data structure.
// --------------------------------------------
function duplicates_main(year, month, restaurant) {
  const data_sheet = get_sheet(restaurant)
  const indexed_rows = get_matching_ym(year, month, data_sheet)
  const duplicate_rows = find_row_duplicates(indexed_rows)
  highlight_duplicate_rows(duplicate_rows, data_sheet)

  let duplicate_count = 0
  for (const [_, copied_idxs] of Object.entries(duplicate_rows)) {
    duplicate_count += copied_idxs.length
  }

  sheet_id = (restaurant === 'sv') ? sv_sheet_id : sushi_sheet_id

  return {
    duplicates: duplicate_rows,
    sheetID: sheet_id,
    length: duplicate_count,
  }
}

// --------------------------------------------
// Purpose: to highlight, with a UI, the rows that are found to be duplicate.
// uses functions from ONLY 'counter.gs'
// --------------------------------------------
function activate_cells(sheet_id, duplicates, number, original) {
  // original=true indicates activation of original cell (not to delete)

  const activation_idx = get_idx(duplicates, number, original)

  activate_idx(sheet_id, activation_idx)

  // NO return
}