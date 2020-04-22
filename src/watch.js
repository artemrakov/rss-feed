import { watch } from 'melanke-watchjs';

export default (state) => {
  const createFeedbackItem = (message, classes) => {
    const feedbackItem = document.createElement('div');
    feedbackItem.classList.add(...classes);
    feedbackItem.innerHTML = message;

    return feedbackItem;
  };

  watch(state, 'rssItems', () => {
    const rssItemsContainer = document.querySelector('.rss-items');
    rssItemsContainer.innerHTML = '';
    const divNodes = state.rssItems.map((item) => {
      const div = document.createElement('div');
      const a = document.createElement('a');
      a.href = item.link;
      a.innerHTML = item.title;
      div.appendChild(a);

      return div;
    });

    divNodes.forEach((div) => rssItemsContainer.appendChild(div));
  });

  watch(state.form, 'rss', () => {
    const rssInput = document.getElementById('rssInput');

    rssInput.value = state.form.rss;
  });

  watch(state, 'error', () => {
    const form = document.querySelector('.rss-form');
    const input = document.getElementById('rssInput');

    if (!state.error) {
      input.classList.remove('is-invalid');
      const feedbackItem = document.querySelector('.feedback');
      feedbackItem.parentNode.removeChild(feedbackItem);

      return;
    }

    input.classList.add('is-invalid');

    const feedbackItem = createFeedbackItem(state.error, ['feedback', 'text-danger']);
    form.after(feedbackItem);
  });

  watch(state.form, 'process', () => {
    const { process } = state.form;
    const form = document.querySelector('.rss-form');
    const submitButton = form.querySelector('input[type="submit"]');
    const input = document.getElementById('rssInput');

    switch (process) {
      case 'filling': {
        submitButton.disabled = false;
        input.disabled = false;
        const feedbackItem = document.querySelector('.feedback');
        if (feedbackItem) {
          feedbackItem.parentNode.removeChild(feedbackItem);
        }
        break;
      }
      case 'finished': {
        submitButton.disabled = false;
        input.disabled = false;
        form.after(createFeedbackItem('Rss has been loaded', ['feedback', 'text-success']));
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
        form.after(createFeedbackItem(state.error, ['feedback', 'text-danger']));
        break;
      }
      default: {
        throw new Error(`Unknown state: ${process}`);
      }
    }
  });
};
