const icons = {
  clearIcon: (
    <svg
      style={{ width: 12, height: 12 }}
      viewBox='0 0 256 256'
      fill='currentColor'
      aria-hidden='true'
    >
      <path d='M205.66,194.34a8,8,0,0,1-11.32,11.32L128,139.31,61.66,205.66a8,8,0,0,1-11.32-11.32L116.69,128,50.34,61.66A8,8,0,0,1,61.66,50.34L128,116.69l66.34-66.35a8,8,0,0,1,11.32,11.32L139.31,128Z' />
    </svg>
  ),
  nextIcon: (
    <svg
      style={{ width: 14, height: 14 }}
      viewBox='0 0 256 256'
      fill='currentColor'
      aria-hidden='true'
    >
      <path d='M181.66,133.66l-80,80a8,8,0,0,1-11.32-11.32L164.69,128,90.34,53.66a8,8,0,0,1,11.32-11.32l80,80A8,8,0,0,1,181.66,133.66Z' />
    </svg>
  ),
  prevIcon: (
    <svg
      style={{ width: 14, height: 14 }}
      viewBox='0 0 256 256'
      fill='currentColor'
      aria-hidden='true'
    >
      <path d='M165.66,202.34a8,8,0,0,1-11.32,11.32l-80-80a8,8,0,0,1,0-11.32l80-80a8,8,0,0,1,11.32,11.32L91.31,128Z' />
    </svg>
  ),
  calendarIcon: (
    <svg
      style={{ width: 16, height: 16 }}
      viewBox='0 0 256 256'
      fill='currentColor'
      aria-hidden='true'
    >
      <path d='M208,32H184V24a8,8,0,0,0-16,0v8H88V24a8,8,0,0,0-16,0v8H48A16,16,0,0,0,32,48V208a16,16,0,0,0,16,16H208a16,16,0,0,0,16-16V48A16,16,0,0,0,208,32ZM72,48v8a8,8,0,0,0,16,0V48h80v8a8,8,0,0,0,16,0V48h24V80H48V48ZM208,208H48V96H208V208Z' />
    </svg>
  ),
};

export { icons };
