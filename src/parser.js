export default (data) => {
  const parser = new DOMParser();
  const doc = parser.parseFromString(data, 'application/xml');

  const items = doc.querySelectorAll('item');
  return [...items].map((item) => {
    const title = item.querySelector('title').textContent;
    const link = item.querySelector('link').textContent;
    const description = item.querySelector('description').textContent;

    return { title, link, description };
  });
};
