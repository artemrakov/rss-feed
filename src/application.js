import axios from 'axios';
import _ from 'lodash';
import * as yup from 'yup';
import i18next from 'i18next';
import watch from './watchers';
import resources from './locales';
import parse from './parser';

const proxyUrl = (url) => {
  const corsUrl = 'https://cors-anywhere.herokuapp.com';
  return `${corsUrl}/${url}`;
};

const updateRssFeed = (state, url) => {
  axios.get(proxyUrl(url))
    .then((response) => {
      const { items } = parse(response.data);
      const rssItemsToAdd = _.differenceBy(items, state.rssItems, 'link');

      state.rssItems.unshift(...rssItemsToAdd);

      setTimeout(() => updateRssFeed(state, url), 5000);
    });
};

const clearForm = (form) => {
  form.rss = '';
}

const formSchema = (urls) => yup.string().required().url().notOneOf(urls);

const app = () => {
  const state = {
    rssItems: [],
    rssUrls: [],
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
      formSchema(state.rssUrls).validate(state.form.rss)
        .then(() => {
          state.form.valid = true;
          state.form.process = 'sending';
          const url = state.form.rss;

          axios.get(proxyUrl(url))
            .then((response) => {
              const { items } = parse(response.data);
              state.rssItems.unshift(...items);
              state.rssUrls.push(url);
              state.form.process = 'finished';

              updateRssFeed(state, url);
              clearForm(state.form);
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
