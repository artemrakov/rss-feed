export default (data) => {
  const parser = new DOMParser();
  const doc = parser.parseFromString(data, 'application/xml');

  const channel = doc.querySelector('channel');
  const channelTitle = channel.querySelector('title');
  const channelLink = channel.querySelector('link');
  const channelDescription = channel.querySelector('description');

  const posts = doc.querySelectorAll('item');
  const parsedPosts = [...posts].map((post) => {
    const title = post.querySelector('title').textContent;
    const link = post.querySelector('link').textContent;
    const description = post.querySelector('description').textContent;

    return { title, link, description };
  });

  return {
    title: channelTitle,
    description: channelDescription,
    link: channelLink,
    posts: parsedPosts,
  };
};
