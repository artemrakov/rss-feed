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
          return state.form.rssUrl;
        })
        .then((url) => axios.get(proxyUrl(url)))
        .then((response) => {
          const { posts } = parse(response.data);
          state.posts.unshift(...posts);
          state.rssUrls.push(state.form.rssUrl);
          state.form.process = 'finished';

          updateRssFeed(state, state.form.rssUrl);
          state.form.rssUrl = '';
        })
        .catch((error) => {
          switch (error.name) {
            case 'ValidationError':
              state.form.valid = false;
              state.form.error = error.message;
              break;
            default:
              state.form.process = 'failed';
              state.form.processError = error.message;
              break;
          }
        });
    });
  });
};

export default app;
