import Player from 'app/Player';
import Company from 'game/Company';


describe('Company', function() {
  var player;
  var company;
  beforeEach(function() {
    player = new Player();
    company = player.company;
  });

  it('pays taxes', function() {
    company.cash = 1000;
    company.annualRevenue = 1000;
    player.taxRate = 0.5;
    company.payAnnual();
    expect(company.cash).toEqual(1000 - (1000 * 0.3 * 0.5));
  });

  it('pays rent', function() {
    company.cash = 1000;
    company.locations.push({cost: 500});
    company.payMonthly();
    expect(company.cash).toBeLessThan(1000);
  });

  it('pays salaries', function() {
    company.cash = 1000;
    company.workers.push({salary: 500});
    company.payMonthly();
    expect(company.cash).toEqual(1000 - Math.round(500/12));
  });
});
