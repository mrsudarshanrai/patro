const currentYear = +new Date().getFullYear()
const currentMonth = +new Date().getMonth() + 1
const currentDate = +new Date().getDate() + 1

const config = {
  en: {
    months: {
      January: 'Jan',
      February: 'Feb',
      March: 'Mar',
      April: 'Apr',
      May: 'May',
      June: 'Jun',
      July: 'Jul',
      August: 'Aug',
      September: 'Sep',
      October: 'Oct',
      November: 'Nov',
      December: 'Dec',
    },
    days: {
      Sunday: 'Sun',
      Monday: 'Mon',
      Tuesday: 'Tue',
      Wednesday: 'Wed',
      Thursday: 'Thu',
      Friday: 'Fri',
      Saturday: 'Sat',
    },
  },
  np: {
    months: {
      बैशाख: 'बै',
      जेष्ठ: 'जे',
      आषाढ: 'आषा',
      श्रावण: 'श्रा',
      भाद्र: 'भा',
      आश्विन: 'आश',
      कार्तिक: 'का',
      मंसिर: 'मं',
      पौष: 'पौ',
      माघ: 'मा',
      फाल्गुन: 'फा',
      चैत्र: 'चै',
    },
    days: {
      आइतवार: 'आइ',
      सोमवार: 'सोम',
      मंगलवार: 'मंगल',
      बुधवार: 'बुध',
      बिहिवार: 'बिहि',
      शुक्रवार: 'शुक्र',
      शनिवार: 'शनि',
    },
    numbers: {
      0: '०',
      1: '१',
      2: '२',
      3: '३',
      4: '४',
      5: '५',
      6: '६',
      7: '७',
      8: '८',
      9: '९',
    },
  },
}

const weeksDaysCount = Object.values(config.en.days).length

export { currentYear, currentMonth, currentDate, weeksDaysCount, config }
