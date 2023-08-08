export namespace Constant {
  export type Config = {
    en: EN;
    np: NP;
  };

  type EN = {
    months: {
      [key: string]: string;
    };
    days: {
      [key: string]: string;
    };
  };

  type NP = {
    months: {
      [key: string]: string;
    };
    days: {
      [key: string]: string;
    };
    numbers: NPNumbers;
  };

  export type NPNumbers = {
    [key: number]: string;
  };
}
