import $ from 'jquery';
import _ from 'underscore';
import util from 'util';
import View from 'views/View';


const template = data => `
<div class="site-header">
  <img src="assets/computer/corpwatch.jpg">
  <h1>CorpWatch</h1>
  <div class="meta">Keeping an eye on corporations</div>
</div>
<div class="site-body">
  <h1>${data.name} has resulted in...</h1>
  <ul>
      <li>${data.pollution} metric tons of pollution</li>
      <li>${util.formatCurrency(data.debtOwned)} of consumer debt</li>
      <li>${data.deathToll} killed</li>
      <li>${data.moralPanic} fearing for the future</li>
      <li>${((1 - data.wageMultiplier) * 100).toFixed(1)}% decrease in average wage</li>
      <li>${((data.forgettingRate - 1) * 100).toFixed(1)}% increase in public distractedness</li>
      <li>${util.formatCurrencyAbbrev(data.taxesAvoided)} taxes avoided</li>
  </ul>
</div>
`

class CorpwatchView extends View {
  constructor(player) {
    super({
      parent: '.corpwatch',
      template: template
    });
    this.player = player;
  }

  update(data) {
  }
}

export default CorpwatchView;
