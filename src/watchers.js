import { watch } from 'melanke-watchjs';
import i18next from 'i18next';

export default (state) => {
  const createFeedbackItem = (message, classes) => {
    const feedbackItem = document.createElement('div');
    feedbackItem.classList.add(...classes);
    feedbackItem.innerHTML = message;

    return feedbackItem;
  };

  watch(state, 'posts', () => {
    const postsContainer = document.querySelector('.posts');
    postsContainer.innerHTML = '';
    const divNodes = state.posts.map((post) => {
      const div = document.createElement('div');
      const a = document.createElement('a');
      a.href = post.link;
      a.innerHTML = post.title;
      div.appendChild(a);

      return div;
    });

    divNodes.forEach((div) => postsContainer.appendChild(div));
  });

  watch(state.form, 'rssUrl', () => {
    const rssInput = document.getElementById('rssInput');

    rssInput.value = state.form.rssUrl;
  });

  watch(state.form, 'valid', () => {
    const form = document.querySelector('.rss-form');
    const input = document.getElementById('rssInput');
    const feedbackItem = document.querySelector('.feedback');

    if (feedbackItem) {
      feedbackItem.remove();
      input.classList.remove('is-invalid');
    }

    if (state.form.valid) {
      return;
    }

    input.classList.add('is-invalid');
    const feedbackItemNew = createFeedbackItem(state.form.error, ['feedback', 'text-danger']);
    form.after(feedbackItemNew);
  });

  watch(state.form, 'process', () => {
    const { process } = state.form;
    const form = document.querySelector('.rss-form');
    const submitButton = form.querySelector('input[type="submit"]');
    const input = document.getElementById('rssInput');

    const feedbackItem = document.querySelector('.feedback');
    if (feedbackItem) {
      feedbackItem.remove();
    }

    switch (process) {
      case 'filling': {
        submitButton.disabled = false;
        input.disabled = false;
        break;
      }
      case 'finished': {
        submitButton.disabled = false;
        input.disabled = false;
        form.after(createFeedbackItem(i18next.t('feedback.loaded'), ['feedback', 'text-success']));
        break;
      }
      case 'sending': {
        submitButton.disabled = true;
        input.disabled = true;
        break;
      }
      case 'failed': {
        submitButton.disabled = false;
        input.disabled = false;
        form.after(createFeedbackItem(state.form.processError, ['feedback', 'text-danger']));
        break;
      }
      default: {
        throw new Error(`Unknown state: ${process}`);
      }
    }
  });
};
