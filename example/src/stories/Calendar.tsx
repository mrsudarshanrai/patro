import '/home/fox/Desktop/codes/patro-v1/dist/css/style.css';
import {Calendar} from "/home/fox/Desktop/codes/patro-v1";

export const CalendarStory = (props: any) => {
  return (
    <div style={{ width: 300 }}>
      <Calendar {...props}/>
    </div>
  );
};