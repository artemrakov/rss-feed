export default (data) => {
  const parser = new DOMParser();
  const doc = parser.parseFromString(data, 'application/xml');

  const channel = doc.querySelector('channel');
  const channelTitle = channel.querySelector('title');
  const channelLink = channel.querySelector('link');
  const channelDescription = channel.querySelector('description');

  const items = doc.querySelectorAll('item');
  const parsedItems = [...items].map((item) => {
    const title = item.querySelector('title').textContent;
    const link = item.querySelector('link').textContent;
    const description = item.querySelector('description').textContent;

    return { title, link, description };
  });

  return {
    title: channelTitle,
    description: channelDescription,
    link: channelLink,
    items: parsedItems,
  };
};
