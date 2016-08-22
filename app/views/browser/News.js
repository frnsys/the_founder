const newsArticleTemplate = data => `
  <img src="${data.image}">
  <h3>${data.title}</h3>
  <p>${data.body}</p>
`;

const template = data => `
<div class="site-header">
  <h1>The Times Journal</h1>
  <h5>The best of the journalism.</h5>
</div>
<div class="site-body">
  <div class="news-header">
    ${data.news.mainArticle ? `<article class="news-main-article">${newsArticleTemplate(data.news.mainArticle)}</article>` : 'no news today'}
    ${data.news.topArticles ? `<div class="news-header-right">${data.news.topArticles.map(i => `<article>${newsArticleTemplate(i)}</article>`).join('')}</div>` : ''}
  </div>
    ${data.news.articles ? `<div class="news-other-articles">${data.news.articles.map(i => `<article>${newsArticleTemplate(i)}</article>`).join('')}</div>` : ''}
</div>`;

export default template;
