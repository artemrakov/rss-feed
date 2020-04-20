import 'bootstrap/dist/css/bootstrap.min.css';
import { watch } from 'melanke-watchjs';
import axios from 'axios';

const corsUrl = 'https://cors-anywhere.herokuapp.com/';

const app = () => {
  const state = {
    rssLinks: [],
    form: {
      textField: ''
    },
    request: 'initialized'
  };

  const rssInput = document.getElementById('rssInput');
  rssInput.addEventListener("input", (event) => {
    state.form.textField = event.target.value;
  });

  const form = document.querySelector(".rss-form");
  form.addEventListener("submit", (event) => {
    event.preventDefault();
    console.log(state.form.textField);
    axios({
      method: 'get',
      url: corsUrl + state.form.textField,
      responseType: 'xml'
    })
      .then((response) => {
        console.log(response);
        const parser = new DOMParser();
        const doc = parser.parseFromString(response.data, 'application/xml');
        console.log(doc);
      })
      .catch((error) => {
        console.error(error);
      });
  });
};


app();
