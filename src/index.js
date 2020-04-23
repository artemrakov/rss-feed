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

const getUrl = (url) => {
  const corsUrl = 'https://cors-anywhere.herokuapp.com/';
  return corsUrl + url;
};

const updateRssItems = (state) => {
  const promises = state.rssUrls.map(url => axios.get(getUrl(url)));
  Promise.all(promises)
    .then((responses) => {
      const newRssItems = responses.map((response) => parse(response.data)).flat();
      const rssItemsToAdd = differenceBy(newRssItems, state.rssItems, 'link');

      state.rssItems = [...rssItemsToAdd, ...state.rssItems];

      setTimeout(() => updateRssItems(state), 5000);
    });
}

const app = () => {
  const state = {
    rssItems: [],
    rssUrls: [],
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

    const formSchema = ({ urls }) => yup.object().shape({
      rss: yup.string().required().url().notOneOf(urls),
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
      formSchema({ urls: state.rssUrls }).validate(state.form)
        .then(() => {
          state.error = null;
          state.form.process = 'sending';

          axios.get(getUrl(state.form.rss))
            .then((response) => {
              const items = parse(response.data);
              state.rssItems = [...state.rssItems, ...items];
              state.rssUrls = [...state.rssUrls, state.form.rss];
              state.form.rss = '';
              state.form.process = 'finished';
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

    updateRssItems(state);
  })
}

app();
