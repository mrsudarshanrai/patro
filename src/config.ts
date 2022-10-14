const current_year = +new Date().getFullYear();

const current_month = +new Date().getMonth() + 1;

const week_days = {
  Sunday: "Sun",
  Monday: "Mon",
  Tuesday: "Tue",
  Wednesday: "Wed",
  Thursday: "Thu",
  Friday: "Fri",
  Saturday: "Sat",
};

const months = {
  January: "Jan",
  February: "Feb",
  March: "Mar",
  April: "Apr",
  May: "May",
  June: "Jun",
  July: "Jul",
  August: "Aug",
  September: "Sep",
  October: "Oct",
  November: "Nov",
  December: "Dec",
};
const weeks_days_count = Object.values(week_days).length;

export { current_year, current_month, week_days, months, weeks_days_count };
