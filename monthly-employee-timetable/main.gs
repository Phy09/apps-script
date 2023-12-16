function prelim_checks() {
  const sheets = SpreadsheetApp.getActiveSpreadsheet()
  const named_ranges = []
  sheets.getNamedRanges().forEach(range => {
    named_ranges.push(range.getName())
  })

  // Do some checks to make sure all the necessary named ranges are there.
  // This is just in case one is accidentally deleted by the user. 
  const required_named_ranges = [
    'employee_data',
    'sushi_data',
    'sushi_scheme',
    'sv_data',
    'sv_scheme',
    'print_company_ccc',
    'print_company_cif',
    'print_company_name',
    'print_employee_name',
    'print_employee_naf',
    'print_employee_nif',
    'print_employee_schedule',
    'print_sheet_base',
    'print_sheet_copy_1',
    'print_sheet_copy_2',
    'print_sheet_copy_3',
    'print_sheet_copy_4',
    'print_sheet_copy_5',
    'print_sheet_copy_6',
    'print_sheet_copy_7',
    'print_sheet_copy_8',
    'print_sheet_copy_9',
    'print_sheet_copy_10',
    'print_sheet_copy_11',
    'print_sheet_copy_12',
    'print_sheet_copy_13',
    'print_sheet_copy_14',
    'print_month',
    'print_year',
  ]

  required_named_ranges.forEach(name => {
    if (!name in named_ranges) throw new Error("(Error; Contact ___) Named range missing: " + name)
  })
}

// Download SV
function download_pdf_sv(year, month) {
  const sheets = SpreadsheetApp.getActiveSpreadsheet()
  const sheets_ID = sheets.getId()

  const ranges = {}
  sheets.getNamedRanges().forEach(range => {
    ranges[range.getName()] = range.getRange()
  })

  const employees = get_employees(ranges['employee_data'])

  const sv_data = get_company(ranges['sv_data'])
  const sv_schemes = get_schemes(ranges['sv_scheme'])
  const SV_Company = new Company(sv_data)
  SV_Company.add_employees_by_id(employees)
  SV_Company.set_employee_schedules(sv_schemes)

  const blob = SV_Company.generate_pdf_blob(ranges, year, month, sheets_ID, print_sheet_ID)

  return blob
}

// Download Sushi
function download_pdf_sushi(year, month) {
  const sheets = SpreadsheetApp.getActiveSpreadsheet()
  const sheets_ID = sheets.getId()

  const ranges = {}
  sheets.getNamedRanges().forEach(range => {
    ranges[range.getName()] = range.getRange()
  })

  const employees = get_employees(ranges['employee_data'])

  const sushi_data = get_company(ranges['sushi_data'])
  const sushi_schemes = get_schemes(ranges['sushi_scheme'])
  const SUSHI_Company = new Company(sushi_data)
  SUSHI_Company.add_employees_by_id(employees)
  SUSHI_Company.set_employee_schedules(sushi_schemes)

  const blob = SUSHI_Company.generate_pdf_blob(ranges, year, month, sheets_ID, print_sheet_ID)

  return blob
}