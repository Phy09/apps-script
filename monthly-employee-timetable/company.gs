class Company {
  constructor(company_data) {
    // -------------------------------------------
    // Create a `Company` object from `company_data` returned by 
    // `get_company`.
    // -------------------------------------------

    this.name = company_data['name']
    this.id = company_data['id']
    this.key_data = company_data['key_data']
    this.schedule = company_data['schedule']

    this.employees = []
  }


  add_employees_by_id(employees) {
    // -------------------------------------------
    // Adds employees to this.employees if the ID matches that
    // of the company:
    //   - `employees`: list created by `get_employees`
    // -------------------------------------------

    employees.forEach(employee => {
      if (parseInt(employee['EMPRESA']) == parseInt(this.id)) {
        this.employees.push(employee)
      }
    })
  }


  set_employee_schemes(schemes) {
    // -------------------------------------------
    // Sets the schemes of each employee.
    //   - `schemes`: list created by `get_schemes`
    // -------------------------------------------

    // Check if employee is in presets OR if employee is part-time
    //
    // NOTE: This uses a global variable `presets`
    //
    this.employees.forEach(employee => {
      if (employee['NIF'] in presets) {
        employee['SCHEME_NAME'] = presets[employee['NIF']]
      } else if (employee['HORAS'] < 40) {
        if (!(employee['HORAS'] in schemes)) throw new Error(`(Manda foto a Yangjie) Scheme for ${employee['HORAS']} hours does not exist.`)

        employee['SCHEME_NAME'] = employee['HORAS']
      }
    })

    // Get the keys of standard schemes.
    const standard_keys = []
    for (const key in schemes) {
      if (key.includes("STANDARD")) standard_keys.push(key)
    }

    // Assign standard schemes to employees without an assigned scheme.
    let j = 0
    for (let i = 0; i < this.employees.length; i++) {
      if (!this.employees[i]['SCHEME_NAME']) {
        ``
        this.employees[i]['SCHEME_NAME'] = standard_keys[(i - j) % 3]
      } else j++
    }

    // Assign scheme
    this.employees.forEach(employee => employee['SCHEME'] = schemes[employee['SCHEME_NAME']])
  }


  set_employee_schedules(schemes) {
    // -------------------------------------------
    // Sets the schedules of each employee, given the schemes.
    //   - `schemes`: list created by `get_schemes`
    // Calls `set_employee_schemes` first to set their schemes.
    // -------------------------------------------

    this.set_employee_schemes(schemes)

    // Create empty `Schedule` that will be filled in `set_employee_schedules`
    // This `Schedule` object will consist of a nested 2D array, with 7x arrays of length 4, one for each day.
    // Values are 7x [morning_clock_in_time, morning_clock_out_time, evening_clock_in_time, evening_clock_out_time].
    // Ex. 7x `[12:00, 16:00, 19:00, 23:00].`
    this.employees.forEach(employee => employee["SCHEDULE"] = [])

    for (let day = 0; day < 7; day++) {
      // Check if the company is closed on the day. If it is, set empty schedule for all employees.
      if (!this.schedule[day][0].trim().length) {
        this.employees.forEach(employee => {
          employee["SCHEDULE"].push(["", "", "", ""])
        })
        continue
      }

      // Get the clock-out time of the day (same for all employees)
      const morning_clock_out_time = new Time(this.schedule[day][1])
      const evening_clock_out_time = new Time(this.schedule[day][3])

      this.employees.forEach(employee => {
        // Get how many hours the employee works.
        const morning_hours = TimeFromHours(employee['SCHEME'][day][0])
        const evening_hours = TimeFromHours(employee['SCHEME'][day][1])

        // Get the clock-in time of the day (depends on hours worked by the employee)
        const morning_clock_in_time = morning_clock_out_time.subtract(morning_hours)
        const evening_clock_in_time = evening_clock_out_time.subtract(evening_hours)

        let morning_in, morning_out, evening_in, evening_out
        // Check if the employee is working. If not, set empty schedule.
        if (morning_hours.hours === 0) {
          morning_in = ''
          morning_out = ''
        } else {
          morning_in = morning_clock_in_time.parse_hhmm()
          morning_out = morning_clock_out_time.parse_hhmm()
        }
        if (evening_hours.hours === 0) {
          evening_in = ''
          evening_out = ''
        } else {
          evening_in = evening_clock_in_time.parse_hhmm()
          evening_out = evening_clock_out_time.parse_hhmm()
        }

        // Push parsed schedule times into the employee schedule.
        employee['SCHEDULE'].push([
          morning_in,
          morning_out,
          evening_in,
          evening_out
        ])
      })
    }
  }


  generate_pdf_blob(named_ranges, year, month, sheets_ID, sheet_ID) {
    // Set the company data
    named_ranges['print_company_ccc'].setValue(this.key_data['CCC'])
    named_ranges['print_company_cif'].setValue(this.key_data['CIF'])
    named_ranges['print_company_name'].setValue(this.name)
    named_ranges['print_month'].setValue(parseInt(month))
    named_ranges['print_year'].setValue(parseInt(year))

    if (this.employees.length > 14) throw new Error(`(Manda foto a Yangjie) Too many employees: ${this.employees.length}. Not enough print copy sheets in "IMPRESA"`)

    // Set the employee data
    for (let i = 0; i < this.employees.length; i++) {
      const employee = this.employees[i]
      named_ranges['print_employee_name'].setValue(employee['APELLIDO'] + ", " + employee['NOMBRE'])
      named_ranges['print_employee_naf'].setValue(employee['NAF'])
      named_ranges['print_employee_nif'].setValue(employee['NIF'])
      named_ranges['print_employee_schedule'].setValues(employee['SCHEDULE'])
      SpreadsheetApp.flush() // make sure spreadsheet updates properly

      // Copy the finished data into a "print_sheet_copy_x" range.
      // This is so that we can temporarily save it, and insert the next employee's data,
      // so that all the employee's schedules can be printed at the same time.
      const print_sheet_values = named_ranges['print_sheet_base'].getValues()
      named_ranges['print_sheet_copy_' + (i + 1)].setValues(print_sheet_values)
    }
    SpreadsheetApp.flush() // Finish updating all
    Utilities.sleep(1000) // sleep 1 second as buffer

    const pdf_name = this.key_data['N. BREVE'] + " " + year + "-" + month
    const blob = print_as_pdf(sheets_ID, sheet_ID, 49, 49 * (this.employees.length + 1) - 2, pdf_name)

    return blob
  }
}


















