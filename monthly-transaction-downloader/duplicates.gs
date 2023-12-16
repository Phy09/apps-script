// The functions in this file are triggered one after another;
// get_sheet ==> get_matching_ym ==> find_row_duplicates.
// Despite the high coupling, it works well for the given task.

function get_sheet(restaurant) {
  // Given the restaurant, returns the Google Sheets object of the desired sheet.
  const sheets = SpreadsheetApp.getActiveSpreadsheet()
  data_sheet_id = (restaurant === 'sv') ? sv_sheet_id : sushi_sheet_id
  let data_sheet
  sheets.getSheets().forEach(sheet => {
    if (sheet.getSheetId() === data_sheet_id) data_sheet = sheet
  })
  if (!data_sheet) throw new Error(`data_sheet not found with id ${data_sheet_id} at duplicates.gs.`)

  return data_sheet
}

function get_matching_ym(year, month, data_sheet) {
  // Get all data from the given year and month to search for duplicates within.
  const input_data = data_sheet.getRange(`A2:F${data_sheet.getLastRow()}`).getValues()
  const matching_data = []

  // Get matching year and month for the data.
  let i = 2
  input_data.forEach(row => {
    const row_idx = i++
    const date_effective = new Date(row[2])
    const eff_year = date_effective.getFullYear()
    const eff_month = date_effective.getMonth() + 1

    if (eff_year == year && eff_month == month) {
      matching_data.push([row_idx, row])
    }
  })
  if (!matching_data.length) throw new Error(`No hay data para ${year}-${month}`)

  // Sort by date.
  matching_data.sort((a, b) => {
    return new Date(a[2]).getDate() - new Date(b[2]).getDate()
  })

  // Return the "indexed" rows by date.
  return matching_data
}

function find_row_duplicates(indexed_rows) {
  // ------------------------------------------------
  // Find duplicate rows in the data, and return their indices.
  //  * A row is defined as a duplicate from another if 
  //      it has the same 'category', 'date', and 'transaction amount'.
  // ------------------------------------------------

  const existing = {}
  const duplicate_rows = {} // sorted as {original_row_idx: [copied_row_idx1, copied_row_idx2, ...]}

  // For each indexed row, 
  indexed_rows.forEach(indexed_row => {
    // Get the key values
    const row_idx = indexed_row[0]
    const row = indexed_row[1]

    const date_effective = new Date(row[2])
    const eff_month = date_effective.getMonth() + 1
    const eff_date = date_effective.getDate()
    const dm = `${eff_date}-${eff_month}`

    const category = row[1]
    const amount = row[3]

    // This is a chain of guard statements.

    // If this is the first entry of a given date, add it to the set.
    if (!(dm in existing)) { existing[dm] = {} } else {return}

    // If the date is found, BUT this is the first entry of a given category, add it to the set.
    if (!(category in existing[dm])) { existing[dm][category] = {} } else {return}

    // If both the date and category are found, BUT the amount does not match, add it to the set.
    if (!(amount in existing[dm][category])) {
      existing[dm][category][amount] = row_idx
    } else { // Else, this must be a duplicate.
      
      // Add it to our "found duplicate" indices.
      const original_idx = existing[dm][category][amount]

      if (!(original_idx in duplicate_rows)) { duplicate_rows[original_idx] = [] }

      duplicate_rows[original_idx].push(row_idx)
    }
  })

  return duplicate_rows
}

// Finally, given the duplicate rows, highlight the original entries "green" amd the duplicate entries "red"
function highlight_duplicate_rows(duplicate_rows, data_sheet) {
  for (const [original_idx, copied_idxs] of Object.entries(duplicate_rows)) {
    data_sheet.getRange(`A${original_idx}:F${original_idx}`).setBackground('#acffaa')

    copied_idxs.forEach(idx => {
      data_sheet.getRange(`A${idx}:F${idx}`).setBackground('#f4c7c3')
    })
  }
}