import $ from 'jquery';
import util from 'util';
import View from 'views/View';

const newsArticleTemplate = (data, image) => `
  ${image ? `<img src="${data.image}">` : ''}
  <h3>${data.title}</h3>
  <p>${data.body}</p>
`;

const otherNewsArticleTemplate = data => `
  <h3>${data.title}</h3>
  <img src="${data.image}">
  <p>${data.body}</p>
`;

const template = data => `
<div class="site-header">
  <img src="assets/news/logo.svg">
  <ul class="news-meta">
    <li>The best of the journalism.</li>
    <li class="clock"></li>
  </ul>
  <ul class="news-sections">
    <li>World</li>
    <li>U.S.</li>
    <li>Business</li>
    <li>Tech</li>
    <li>Science</li>
    <li>Health</li>
    <li>Culture</li>
    <li>Life</li>
    <li>Opinion</li>
  </ul>
</div>
<div class="site-body">
  <div class="news-header">
    <article class="news-main-article">${newsArticleTemplate(data.news.mainArticle, true)}</article>
    <div class="news-header-right">${data.news.topArticles.map(i => `<article>${newsArticleTemplate(i, false)}</article>`).join('')}</div>
  </div>
  <div class="news-other-articles">${data.news.articles.map(i => `<article>${otherNewsArticleTemplate(i)}</article>`).join('')}</div>
</div>`;

class NewsView extends View {
  constructor() {
    super({
      parent: '.news',
      template: template
    });
  }

  render(data) {
    this.news = data.news;
    super.render(data);
  }

  update(data) {
    if (data.news != this.news) {
      super.render(data);
    }
    this.el.find('.clock').text(`${util.enumName(data.month, Enums.Month)}, ${data.year}`);
  }
}

export default NewsView;
