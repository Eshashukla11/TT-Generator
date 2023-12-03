const date_data = document.querySelectorAll("#datepicker");
const day_text = document.querySelectorAll(".day");
const time_data = document.querySelectorAll(".time_row");
let round_off_index_time_row = Math.round(time_data.length / 2) - 1;
const printButton = document.querySelector(".print")
const mailButton = document.querySelector(".mail")
const semSpan = document.querySelector(".Sem_span")


const weekday = [
  "Sunday",
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
];

for(let i = 0;i<date_data.length;i++) {
date_data[i].addEventListener('change',() => {
    let day = new Date(date_data[i].value).getDay();
    day_text[i].textContent = weekday[day]
})
if(i == round_off_index_time_row) {
    time_data[i].innerHTML = `<td data-rel="time" class="time_row"><input required class="timepicker" type="time"></input> to <br> <input required class="timepicker" type="time"></input>
    </td>`
}
}

printButton.addEventListener('click',() => {
    window.print()
})