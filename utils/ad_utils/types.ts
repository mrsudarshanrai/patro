export namespace AdUtil {
  export type GetRawAdDate = {
    year: number;
    month: number;
    date: number;
    currDate: {
      month: number;
      year: number;
      date: number;
    };
  };

  export type Date = {
    dayOfMonth: string | number;
    year: number;
    month: number;
    adDate: string;
    extraDate: string;
    type: string;
  };
}
