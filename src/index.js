import 'bootstrap/dist/css/bootstrap.min.css';
import axios from 'axios';
import * as yup from 'yup';
import i18next from 'i18next';
import watch from './watchers';
import resources from './locales';
import parse from './parser';

const differenceBy = (initialArray, newArray, key) => {
  const itemNotExist = (item, array) => !array.some((element) => element[key] === item[key]);

  return initialArray.filter((item) => itemNotExist(item, newArray));
};

const getUrl = (path) => {
  const corsUrl = 'https://cors-anywhere.herokuapp.com/';
  return corsUrl + path;
};

const updateRssFeed = (state, path) => {
  axios.get(getUrl(path))
    .then((response) => {
      const newRssItems = parse(response.data);
      const rssItemsToAdd = differenceBy(newRssItems, state.rssItems, 'link');

      // eslint-disable-next-line no-param-reassign
      state.rssItems = [...rssItemsToAdd, ...state.rssItems];

      setTimeout(() => updateRssFeed(state, path), 5000);
    });
};

const app = () => {
  const state = {
    rssItems: [],
    rssPaths: [],
    form: {
      rss: '',
      process: 'filling',
      processError: null,
    },
    error: null,
  };


  i18next.init({
    lng: 'en',
    debug: true,
    resources,
  }).then(() => {
    watch(state);

    const formSchema = ({ paths }) => yup.object().shape({
      rss: yup.string().required().url().notOneOf(paths),
    });

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
      formSchema({ paths: state.rssPaths }).validate(state.form)
        .then(() => {
          state.error = null;
          state.form.process = 'sending';

          axios.get(getUrl(state.form.rss))
            .then((response) => {
              const items = parse(response.data);
              state.rssItems = [...items, ...state.rssItems];
              state.rssPaths = [...state.rssPaths, state.form.rss];
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
          state.error = err.message;
        });
    });
  });
};

app();
