import { ComponentStory, ComponentMeta } from '@storybook/react';

import { DatePicker } from './Datepicker';

export default {
  title: 'Datepicker',
  component: DatePicker,
  argTypes: {
    calendarType: {
      options: ['AD', 'BS'],
      control: { type: 'radio' }
    },
    onSelect: { action: 'onChange' }
  },
} as ComponentMeta<typeof DatePicker>;

const Template: ComponentStory<typeof DatePicker> = (args) => <DatePicker {...args} />;

export const Default = Template.bind({});
Default.args = {
  showExtra: true,
};