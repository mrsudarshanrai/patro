type Props = { label: string; disabled: boolean; onClick: () => void };

const TodayButton = ({ label, disabled, onClick }: Props) => (
  <div className='_patro_footer'>
    <button type='button' className='_patro_footer_today' disabled={disabled} onClick={onClick}>
      {label}
    </button>
  </div>
);

export { TodayButton };
