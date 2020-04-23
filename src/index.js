import 'bootstrap/dist/css/bootstrap.min.css';
import axios from 'axios';
import * as yup from 'yup';
import i18next from 'i18next';
import watch from './watchers';
import resources from './locales';
import parse from './parser';

const corsUrl = 'https://cors-anywhere.herokuapp.com/';
const differenceBy = (initialArray, newArray, key) => {
  const itemNotExist = (item, array) => !array.some((element) => element[key] === item[key]);

  return initialArray.filter((item) => itemNotExist(item, newArray));
};

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

          axios.get(corsUrl + state.form.rss)
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

    setInterval(() => {
      const promises = state.rssUrls.map((url) => axios.get(corsUrl + url));
      axios.all(promises)
        .then((responses) => {
          const newRssItems = responses.map((response) => parse(response.data)).flat();
          const rssItemsToAdd = differenceBy(newRssItems, state.rssItems, 'link');

          state.rssItems = [...rssItemsToAdd, ...state.rssItems];
        });
    }, 10000);
  });
};


app();
