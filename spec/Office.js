import _ from 'underscore';
import Company from 'game/Company';

describe('Office', function() {
  var company;
  beforeEach(function() {
    company = new Company();
  });

  it('gets next office', function() {
    expect(company.office).toEqual(0);
    expect(company.nextOffice.name).toEqual('office');
    company.office = 1;
    expect(company.nextOffice.name).toEqual('campus');
    company.office = 2;
    expect(company.nextOffice).toEqual(undefined);
  });

  it('can be upgraded, to a limit', function() {
    company.cash = company.nextOffice.cost;
    expect(company.office).toEqual(0);
    expect(company.upgradeOffice()).toEqual(true);
    expect(company.office).toEqual(1);

    company.cash = company.nextOffice.cost;
    expect(company.upgradeOffice()).toEqual(true);
    expect(company.office).toEqual(2);

    company.cash = 1000000000000;
    expect(company.upgradeOffice()).toEqual(false);
    expect(company.office).toEqual(2);
  });

  it('affects employee size limit', function() {
    var oldSizeLimit = company.sizeLimit;
    company.cash = company.nextOffice.cost;
    company.upgradeOffice();
    expect(company.sizeLimit).toBeGreaterThan(oldSizeLimit);

    oldSizeLimit = company.sizeLimit;
    company.cash = company.nextOffice.cost;
    company.upgradeOffice();
    expect(company.sizeLimit).toBeGreaterThan(oldSizeLimit);
  });
});


