import 'bootstrap/dist/css/bootstrap.min.css';
import axios from 'axios';
import * as yup from 'yup';
import watch from './watch';

const corsUrl = 'https://cors-anywhere.herokuapp.com/';

const parse = (data) => {
  const parser = new DOMParser();
  return parser.parseFromString(data, 'application/xml');
};

const normalizeData = (doc) => {
  const items = doc.querySelectorAll('item');
  return [...items].map((item) => {
    const title = item.querySelector('title').textContent;
    const link = item.querySelector('link').textContent;
    const description = item.querySelector('description').textContent;

    return { title, link, description };
  });
};

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

  const formSchema = yup.object().shape({
    rss: yup.string().required().url().test('rss', 'Rss already exists', (value) => !state.rssUrls.includes(value)),
  });

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
    formSchema.validate(state.form)
      .then(() => {
        state.error = null;
        state.form.process = 'sending';

        axios.get(corsUrl + state.form.rss)
          .then((response) => {
            const doc = parse(response.data);
            state.rssItems = [...state.rssItems, ...normalizeData(doc)];
            state.rssUrls = [...state.rssUrls, state.form.rss];
            state.form.rss = '';
            state.form.process = 'finished';
          })
          .catch((error) => {
            state.form.process = 'failed';
            state.form.processError = error.message;
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
        const newRssItems = responses.map((response) => {
          const doc = parse(response.data);
          return normalizeData(doc);
        }).flat();


        const rssItemsToAdd = differenceBy(newRssItems, state.rssItems, 'link');
        console.log('ITEMS TO ADD');
        console.log(rssItemsToAdd);
        console.log('new RSS');
        console.log(newRssItems);
        console.log('old rss');
        console.log(state.rssItems);
        // console.log(state.rssItems);

        state.rssItems = [...rssItemsToAdd, ...state.rssItems];
      });
  }, 10000);
};


app();
