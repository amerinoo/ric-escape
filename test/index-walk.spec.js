const ricEscape = require('../index.js');
const ricEscapeData = require('../ric-escape-data').data;
const scure = require('../scure/scure').buildScureFor(ricEscapeData);


describe('Ric Escape - when walking', () => {
  it('changes the roomId when walking', () => {
    const request = aDfaRequestBuilder()
      .withIntent('walk')
      .withArgs({ arg: 'pasillo norte' })
      .withData({ roomId: 'sala-mandos' })
      .build();

    ricEscape.ricEscape(request);

    expect(getDfaApp().data.roomId).to.equal('pasillo-norte');
    expect(getDfaApp().lastAsk).to.equal(scure.rooms.getRoom('pasillo-norte').description);
  });

  it('cannot change the roomId when walking to somewhere not according to map', () => {
    const request = aDfaRequestBuilder()
      .withIntent('walk')
      .withArgs({ arg: 'biblioteca' })
      .withData({ roomId: 'sala-mandos' })
      .build();

    ricEscape.ricEscape(request);

    expect(getDfaApp().data.roomId).to.equal('sala-mandos');
    expect(getDfaApp().lastAsk).to.contains('No sé ir al sitio biblioteca.');
    expect(getDfaApp().lastAsk).to.contains('Desde aquí puedo ir a: Pasillo norte');
  });

  const TEST_DATA = [
    { room: 'pasillo-norte', destinations: 'Sala de mandos, Comedor y Pasillo central' },
    { room: 'sala-mandos', destinations: 'Pasillo norte' },
    { room: 'pasillo-sur', destinations: 'Habitación 108 y Pasillo central' },
  ];

  TEST_DATA.forEach((data) => {
    it('explains places to go when no arg is given', () => {
      const request = aDfaRequestBuilder()
        .withIntent('walk')
        .withArgs({})
        .withData({ roomId: data.room })
        .build();

      ricEscape.ricEscape(request);

      expect(getDfaApp().data.roomId).to.equal(data.room);
      expect(getDfaApp().lastAsk).to.equal(`Desde aquí puedo ir a: ${data.destinations}`);
    });
  });


  it('does not change if the room cannot be found', () => {
    const request = aDfaRequestBuilder()
      .withIntent('walk')
      .withArgs({ arg: 'pasillo de la muerte' })
      .withData({ roomId: 'sala-mandos' })
      .build();

    ricEscape.ricEscape(request);

    expect(getDfaApp().data.roomId).to.equal('sala-mandos');
    expect(getDfaApp().lastAsk).to.contains('No sé ir al sitio pasillo de la muerte.');
  });
});