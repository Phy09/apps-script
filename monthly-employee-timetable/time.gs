// Simple class to handle time.

class Time {
  constructor(hhmm) {
    // reads time format of "hh:mm"
    this.hours = parseInt(hhmm.split(":")[0])
    this.minutes = parseInt(hhmm.split(":")[1])

    if (isNaN(this.hours) || isNaN(this.minutes)) throw new Error(`Invalid time input: ${hhmm}`)
  }

  subtract(other) {
    // subtracts from another `Time` object
    let minutes = this.minutes - other.minutes
    if (minutes < 0) {
      minutes += 60
      this.hours -= 1
    }
    const hours = this.hours - other.hours

    const parsed_time = hours.toString() + ":" + minutes.toString()
    return new Time(parsed_time)
  }

  parse_hhmm() {
    return (this.hours.toString().padStart(2, "0") + ":" + this.minutes.toString().padStart(2, "0"))
  }
}

function TimeFromHours(hours) {
  let hh = parseFloat(hours)
  const mm = Math.floor(hh % 1 * 60)
  hh = Math.floor(hh)

  return new Time(hh + ":" + mm)
}