/* eslint no-template-curly-in-string: 0 */

import { setLocale } from 'yup';

const yupLocale = setLocale({
  string: {
    url: 'this must be a valid URL',
  },
  mixed: {
    notOneOf: '${value} already exist',
  },
});

export default {
  translation: {
    ...yupLocale,
    feedback: {
      loaded: 'Rss has been loaded',
    },
  },
};
