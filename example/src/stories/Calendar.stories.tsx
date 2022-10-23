import { ComponentStory, ComponentMeta } from '@storybook/react';

import { CalendarStory } from './Calendar';

export default {
  title: 'Calendar',
  component: CalendarStory,
  argTypes: {
    calendarType: {
      options: ['AD', 'BS'],
      control: { type: 'radio' }
    },
    onChange: { action: 'onChange' }
  },
} as ComponentMeta<typeof CalendarStory>;

const Template: ComponentStory<typeof CalendarStory> = (args) => <CalendarStory {...args} />;

export const Default = Template.bind({});
Default.args = {
  showExtra: true,
};