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
      const { posts } = parse(response.data);
      const postsToAdd = _.differenceBy(posts, state.posts, 'link');

      state.posts.unshift(...postsToAdd);

      setTimeout(() => updateRssFeed(state, url), 5000);
    });
};

const clearForm = (form) => {
  form.rssUrl = '';
}

const formSchema = (urls) => yup.string().required().url().notOneOf(urls);

const app = () => {
  const state = {
    posts: [],
    rssUrls: [],
    form: {
      rssUrl: '',
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

      state.form.rssUrl = event.target.value;
    });

    const form = document.querySelector('.rss-form');
    form.addEventListener('submit', (event) => {
      event.preventDefault();
      formSchema(state.rssUrls).validate(state.form.rssUrl)
        .then(() => {
          state.form.valid = true;
          state.form.process = 'sending';
          const url = state.form.rssUrl;

          axios.get(proxyUrl(url))
            .then((response) => {
              const { posts } = parse(response.data);
              state.posts.unshift(...posts);
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
