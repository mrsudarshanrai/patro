// Public holidays and festivals for BS 2083 Ashwin–Poush, as listed on nepalipatro.com.np
// (fetched 13 Oct 2026). Keyed by BS date. Check the official government notice before relying on them.
export interface Holiday {
  ne: string;
  en: string;
  /** A day off for everyone, not only for one community. */
  publicHoliday: boolean;
}

export const holidays: Record<string, Holiday> = {
  '2083-06-03': { ne: 'संविधान दिवस', en: 'Constitution Day', publicHoliday: true },
  '2083-06-25': { ne: 'घटस्थापना', en: 'Ghatasthapana', publicHoliday: true },
  '2083-06-31': { ne: 'फूलपाती', en: 'Fulpati', publicHoliday: true },
  '2083-07-01': { ne: 'महाअष्टमी', en: 'Maha Ashtami', publicHoliday: true },
  '2083-07-02': { ne: 'दशैंको बिदा', en: 'Dashain holiday', publicHoliday: true },
  '2083-07-03': { ne: 'महानवमी', en: 'Maha Navami', publicHoliday: true },
  '2083-07-04': { ne: 'विजया दशमी', en: 'Vijaya Dashami', publicHoliday: true },
  '2083-07-05': { ne: 'दशैंको बिदा', en: 'Dashain holiday', publicHoliday: true },
  '2083-07-06': { ne: 'दशैंको बिदा', en: 'Dashain holiday', publicHoliday: true },
  '2083-07-22': { ne: 'लक्ष्मी पूजा', en: 'Laxmi Puja', publicHoliday: true },
  '2083-07-23': { ne: 'गाई तिहार', en: 'Gai Tihar', publicHoliday: true },
  '2083-07-24': { ne: 'गोरु तिहार', en: 'Goru Tihar', publicHoliday: true },
  '2083-07-25': { ne: 'भाइटीका', en: 'Bhai Tika', publicHoliday: true },
  '2083-07-26': { ne: 'तिहार बिदा', en: 'Tihar holiday', publicHoliday: true },
  '2083-07-29': { ne: 'छठ पर्व', en: 'Chhath', publicHoliday: true },
  '2083-08-08': { ne: 'गुरु नानक जयन्ती', en: 'Guru Nanak Jayanti', publicHoliday: false },
  '2083-09-10': { ne: 'क्रिसमस', en: 'Christmas', publicHoliday: false },
  '2083-09-15': { ne: 'तमु ल्होसार', en: 'Tamu Lhosar', publicHoliday: true },
  '2083-09-27': { ne: 'पृथ्वी जयन्ती', en: 'Prithvi Jayanti', publicHoliday: true },
};

export const isPublicHoliday = (bs: string) => !!holidays[bs]?.publicHoliday;
