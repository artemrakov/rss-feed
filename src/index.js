import 'bootstrap/dist/css/bootstrap.min.css';
// import { watch } from 'melanke-watchjs';
import axios from 'axios';

const corsUrl = 'https://cors-anywhere.herokuapp.com/';

const extractRssItems = (response) => {
  const parser = new DOMParser();
  const doc = parser.parseFromString(response.data, 'application/xml');

  const items = doc.querySelectorAll('item');
  return [...items].map((item) => {
    const title = item.querySelector('title').textContent;
    const link = item.querySelector('link').textContent;
    const description = item.querySelector('description').textContent;

    return { title, link, description };
  });
};

const app = () => {
  const state = {
    rssItems: [],
    rssUrls: [],
    form: {
      textField: '',
    },
    request: {
      status: 'initialized',
      error: '',
    },
  };

  const rssInput = document.getElementById('rssInput');
  rssInput.addEventListener('input', (event) => {
    state.form.textField = event.target.value;
  });

  const form = document.querySelector('.rss-form');
  form.addEventListener('submit', (event) => {
    event.preventDefault();
    axios.get(corsUrl + state.form.textField)
      .then((response) => {
        state.rssItems = extractRssItems(response);
        state.rssUrls = [...state.rssUrls, state.form.textField];
      })
      .catch((error) => {
        console.error(error);
      });
  });
};


app();
