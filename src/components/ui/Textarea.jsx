import React from 'react';
import FormField from './FormField';

const Textarea = ({ rows = 4, ...props }) => {
  return <FormField as="textarea" rows={rows} {...props} />;
};

export default Textarea;
