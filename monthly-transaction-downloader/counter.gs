

function get_idx(duplicates, number, original) {
  // original=true indicates activation of original cell (not to delete)
  let count = 0

  let return_value
  for (const [original_idx, copied_idxs] of Object.entries(duplicates)) {
    copied_idxs.forEach(idx => {
      count++
      if (count == number) {
        if (original) return_value = original_idx // returns original index
        else return_value = idx // returns copied idx instead.

        return
      }
    })
  }

  return return_value
}

// 
function activate_idx(sheet_id, idx) {
  const sheets = SpreadsheetApp.getActiveSpreadsheet()

  let data_sheet
  sheets.getSheets().forEach(sheet => {
    if (sheet.getSheetId() === sheet_id) data_sheet = sheet
  })
  if (!data_sheet) throw new Error(`sheet not found with id ${sheet_id} at counter.gs.`)

  data_sheet.getRange(`A${idx}:F${idx}`).activate()
}