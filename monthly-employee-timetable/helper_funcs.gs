function get_employees(range) {
  // -------------------------------------------
  // Given a range, return a list of `employee`, each a json (dictionary).
  // -------------------------------------------

  // -------------------------------------------
  // Look at the range given and separate into headers and data.
  // -------------------------------------------

  const values = range.getValues()
  const headers = values[1]
  const data = values.slice(2, values.length)

  // -------------------------------------------
  // Iterate through each row of the data, and add a new 
  // `employee` to `employees` containing key data stored as json (dictionary)
  // -------------------------------------------

  const employees = []
  data.forEach(row => {
    if (!row[4].trim().length) { // indicating that the row is empty (or only contains whitespace)
      return
    }

    const employee = {}
    for (let i = 0; i < row.length; i++) {
      employee[headers[i]] = row[i].trim()
    }

    check_valid_employee(employee)

    employees.push(employee)
  })

  return employees
}

function check_valid_employee(employee) {
  // Checks that the given employee is valid.
  if (!employee['APELLIDO'].trim().length) throw new Error('Falta un apellido.')
  if (!employee['NOMBRE'].trim().length) throw new Error('Falta un nombre.')
  if (!employee['NIF'].trim().length) throw new Error('Falta el NIF.')
}


function get_schemes(range) {
  // -------------------------------------------
  // Given a google sheet and range, return the working schemes.
  // -------------------------------------------

  // -------------------------------------------
  // Look at the range given and separate into headers and data.
  // -------------------------------------------

  const values = range.getValues()

  const scheme_ids = values[1]
  const data = values.slice(3, values.length)

  const schemes = {}

  for (let i = 1; i < scheme_ids.length; i += 2) {
    const scheme_id = scheme_ids[i]
    const hours = []

    let skip = false

    data.forEach(row => {
      if (!row[i].trim().length) skip = true
      hours.push(row.slice(i, i + 2))
    })

    if (skip) continue

    schemes[scheme_id] = hours
  }

  return schemes
}


function get_company(range) {
  // -------------------------------------------
  // Given a google sheet and range, return the company information.
  // -------------------------------------------

  // -------------------------------------------
  // Look at the range given and extract simple information.
  // -------------------------------------------

  const values = range.getValues()
  const name = values[0][0]
  const id = values[1][0].at(-1)

  // -------------------------------------------
  // Get the key information (stored in row indeces 2 and 3.)
  // -------------------------------------------

  const key_data = {}
  const headers = values[2]
  const data = values[3]

  for (let i = 0; i < headers.length; i++) {
    if (headers[i].trim().length) { // if the cell is not empty
      key_data[headers[i]] = data[i]
    }
  }

  // -------------------------------------------
  // Iterate through the schedule (horarios) and store into a list
  // -------------------------------------------

  const schedule = []

  for (let i = 6; i < 13; i++) { // from i=6 to i=12 inclusive
    schedule.push(values[i].slice(1, 5))
  }

  return {
    'name': name,
    'id': id,
    'key_data': key_data,
    'schedule': schedule
  }
}



function print_as_pdf(sheets_ID, sheet_ID, first_row, last_row, pdf_name) {
  // get download url
  const fc = 0, lc = 12 // print rage (cols 1 -> 12)
  const url = "https://docs.google.com/spreadsheets/d/" + sheets_ID + "/export" +
    "?format=pdf&" +
    "size=7&" +
    "fzr=true&" +
    "portrait=true&" +
    "fitw=true&" +
    "gridlines=false&" +
    "printtitle=false&" +
    "top_margin=0.127&" +
    "bottom_margin=0.127&" +
    "left_margin=0.5&" +
    "right_margin=0.5&" +
    "sheetnames=false&" +
    "pagenum=UNDEFINED&" +
    "attachment=true&" +
    "gid=" + sheet_ID + '&' +
    "r1=" + first_row + "&c1=" + fc + "&r2=" + last_row + "&c2=" + lc


  // Make request
  let response
  let i = 0
  const params = {
    method: "GET",
    muteHttpExceptions: true,
    headers: { "authorization": "Bearer " + ScriptApp.getOAuthToken() }
  }

  for (; i < 5; i++) {
    response = UrlFetchApp.fetch(url, params)
    Utilities.sleep(3000)

    // Reading too fast
    if (response.getResponseCode === 429) {
      continue
    } else break
  }

  if (i >= 4) throw new Error("Intentelo otra vez (demasiados requests).")

  return response.getBlob().setName(pdf_name + '.pdf')
}
