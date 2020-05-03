import axios from 'axios';
import _ from 'lodash';
import * as yup from 'yup';
import i18next from 'i18next';
import watch from './watchers';
import resources from './locales';
import parse from './parser';

const getUrl = (path) => {
  const corsUrl = 'https://cors-anywhere.herokuapp.com';
  return `${corsUrl}/${path}`;
};

const updateRssFeed = (state, path) => {
  axios.get(getUrl(path))
    .then((response) => {
      const { items } = parse(response.data);
      const rssItemsToAdd = _.differenceBy(items, state.rssItems, 'link');

      state.rssItems.unshift(...rssItemsToAdd);

      setTimeout(() => updateRssFeed(state, path), 5000);
    });
};

const formSchema = (paths) => yup.string().required().url().notOneOf(paths);

const app = () => {
  const state = {
    rssItems: [],
    rssPaths: [],
    form: {
      rss: '',
      process: 'filling',
      processError: null,
      valid: true,
      error: null,
    },
  };


  i18next.init({
    lng: 'en',
    debug: true,
    resources,
  }).then(() => {
    watch(state);

    const rssInput = document.getElementById('rssInput');
    rssInput.addEventListener('input', (event) => {
      if (event.target.value) {
        state.form.process = 'filling';
      }

      state.form.rss = event.target.value;
    });

    const form = document.querySelector('.rss-form');
    form.addEventListener('submit', (event) => {
      event.preventDefault();
      formSchema(state.rssPaths).validate(state.form.rss)
        .then(() => {
          state.form.valid = true;
          state.form.process = 'sending';
          const path = state.form.rss;

          axios.get(getUrl(path))
            .then((response) => {
              const { items } = parse(response.data);
              state.rssItems.unshift(...items);
              state.rssPaths.push(path);
              state.form.process = 'finished';

              updateRssFeed(state, state.form.rss);
              state.form.rss = '';
            })
            .catch((error) => {
              state.form.processError = error.message;
              state.form.process = 'failed';
            });
        })
        .catch((err) => {
          state.form.error = err.message;
          state.form.valid = false;
        });
    });
  });
};

export default app;
