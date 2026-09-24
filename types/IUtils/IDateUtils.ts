import { IUseCalendarData } from '../IHooks/IUseCalendarData';

export namespace IDateUtils {
  export type ICreateDateArray_Params = [
    length: number,
    month: number,
    year: number,
    date: number,
    currDate: IUseCalendarData.ICurrDate,
  ];

  export type IOffsetMonthDates_Params = {
    monthCount: number;
    length: number;
    year: number;
    month: number;
    direction: 'prev' | 'next';
    self: 'AD' | 'BS';
    convertToOther: (ownDate: string) => string;
  };
}
