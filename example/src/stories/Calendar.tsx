import '/home/fox/codes/patro/dist/css/style.css';
import {Calendar} from "/home/fox/codes/patro";

export const CalendarStory = (props: any) => {
  return (
    <div style={{ width: 300 }}>
      <Calendar {...props}/>
    </div>
  );
};