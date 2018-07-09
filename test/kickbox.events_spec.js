/* global describe it beforeEach afterEach */

const td = require('testdouble');

const events = require('./../test-output/kickbox.events');

describe('events', () => {
  describe('#register', () => {
    beforeEach(() => {
      events._spec.clearListeners();
    });

    afterEach(() => {
      td.reset();
    });

    it('should create a new listener array for the event name', () => {
      events.register('jarjar', function() { return 'binks'; });

      var subject = events._spec.getListeners();

      subject.should.have.property('jarjar').and.be.a('array');
    });

    it('should add the passed callback to the event array', () => {
      let cb = function() { return 'binks' };
      events.register('jarjar', cb);

      var subject = events._spec.getListeners()['jarjar'][0];

      subject.should.equal(cb);
    });
  });

  describe('#unregister', () => {
    beforeEach(() => {
      events._spec.clearListeners();
    });

    afterEach(() => {
      td.reset();
    });

    it('should remove the listener from the event map array', () => {
      let cb = function () { return 'Poe Dameron'; };
      let cb2 = function () { return 'Ackbar'; };
      events.register('bb8', cb);
      events.register('bb8', cb2);

      let subject = events._spec.getListeners()['bb8'];
      subject.should.have.lengthOf(2);
      subject[0].should.equal(cb);
      subject[1].should.equal(cb2);
      events.unregister('bb8', cb);

      subject = events._spec.getListeners()['bb8'];
      subject.should.have.lengthOf(1);
      subject[0].should.equal(cb2);
    });

    it('should the event map array if its the last callback to be unregistered', () => {
      let cb = function () { return 'Poe Dameron'; };
      events.register('bb8', cb);

      let subject = events._spec.getListeners()['bb8'];
      subject.should.have.lengthOf(1);

      events.unregister('bb8', cb);
      subject = events._spec.getListeners();

      subject.should.not.have.property('bb8');
    });
  });

  describe('#unregisterById', () => {
    afterEach(() => {
      td.reset();
    });

    beforeEach(() => {
      events._spec.clearListeners();
    });

    it('should unregister the callback', () => {
      let cb = function () { return 'Poe Dameron'; };
      cb.kbFnId = 'womprat';
      let cb2 = function () { return 'Power Converters'; };
      events.register('bb8', cb);
      events.register('bb8', cb2);

      let subject = events._spec.getListeners();
      subject.should.have.property('bb8').and.have.lengthOf(2);

      events.unregisterById('bb8', 'womprat');

      subject = events._spec.getListeners();
      subject.should.have.property('bb8').and.have.lengthOf(1);
    });

    it('should remove the array map from the listeners when no functions are present', () => {
      let cb = function () { return 'Poe Dameron'; };
      cb.kbFnId = 'womprat';
      events.register('bb8', cb);

      let subject = events._spec.getListeners();
      subject.should.have.property('bb8').and.have.lengthOf(1);

      events.unregisterById('bb8', 'womprat');

      subject = events._spec.getListeners();
      subject.should.not.have.property('bb8');
    });
  });

  describe('#trigger', () => {
    afterEach(() => {
      td.reset();
    });

    beforeEach(() => {
      events._spec.clearListeners();
    });

    it('should trigger all available listeners', () => {
      var subject = 'obi-wan';
      events.register('x-wing', () => { subject = 'master yoda'; });

      subject.should.equal('obi-wan');

      events.trigger('x-wing');

      subject.should.equal('master yoda');
    });
  });
});
