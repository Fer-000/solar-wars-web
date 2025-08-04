const getSolarDate = (date = new Date()) => {
  const start = new Date(2023, 4, 1);
  const today = date;
  const monthStart = new Date(today.getFullYear(), today.getMonth(), 1);
  const monthEnd = new Date(today.getFullYear(), today.getMonth() + 1, 1);

  let year = ((monthStart.getFullYear() - start.getFullYear()) * 12);
  year += (monthStart.getMonth() - start.getMonth());
  year += 2123;

  const yearLen = monthEnd - monthStart - 1;
  const point = today - monthStart;
  const day = Math.floor((point / yearLen) * (leap(year) ? 366 : 365));

  const md = convertDay(day);

  return [year, md.month, md.day];
};

const leap = year => (year % 4 === 0) && (year % 100 !== 0 || year % 400 === 0);

const convertDay = (dayOfYear) => {
  const months = [
    { name: 'Jan', days: 31 },
    { name: 'Feb', days: 28 },
    { name: 'Mar', days: 31 },
    { name: 'Apr', days: 30 },
    { name: 'May', days: 31 },
    { name: 'Jun', days: 30 },
    { name: 'Jul', days: 31 },
    { name: 'Aug', days: 31 },
    { name: 'Sep', days: 30 },
    { name: 'Oct', days: 31 },
    { name: 'Nov', days: 30 },
    { name: 'Dec', days: 31 }
  ];

  let remainingDays = dayOfYear;
  let month = 1;

  for (let i = 0; i < months.length; i++) {
    if (remainingDays <= months[i].days) {
      month = i + 1;
      break;
    }
    remainingDays -= months[i].days;
  }

  return {
    month: month.toString().padStart(2, '0'),
    day: Math.max(1, remainingDays).toString().padStart(2, '0')
  };
};

const formatSolarDate = (date = new Date()) => {
  const [year, month, day] = getSolarDate(date);
  return `Stardate ${year}.${month}.${day}`;
};

export { getSolarDate, leap, convertDay, formatSolarDate };
