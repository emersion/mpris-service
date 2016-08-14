const dbus = require('dbus-native');

const Player = require('../index');

const playername = () => {
  return 'test' + (Math.random() * 1000 | 0).toString();
};

const servicename = (player) => {
  return 'org.mpris.MediaPlayer2.' + player;
};

const objectpath = '/org/mpris/MediaPlayer2';
const namespace = 'org.mpris.MediaPlayer2.Player';

const eventmap = {
  next: {
    method: 'Next',
    args: []
  },
  previous: {
    method: 'Previous',
    args: []
  },
  play: {
    method: 'Play',
    args: []
  },
  pause: {
    method: 'Pause',
    args: []
  },
  playpause: {
    method: 'PlayPause',
    args: []
  },
  stop: {
    method: 'Stop',
    agrs: []
  },
  open: {
    method: 'OpenUri',
    args: ['/home/foo']
  },
  seek: {
    method: 'Seek',
    args: [3.14 * 10e6]
  },
  // TODO: figure out how to pass first arg
  // position: {
  //   method: 'SetPosition',
  //   args: ['playlist/0', 3.14 * 10e6]
  // }
};

const waitForEvent = (player, event) => {
  return new Promise((resolve) => {
    player.on(event, resolve);
  });
};

describe('player interface', () => {
  it('should emit events that correspond to method calls', (done) => {
    const name = playername();
    const player = new Player({ name });

    const events =  Object.keys(eventmap);

    const promises = events.map((event) => {
      return waitForEvent(player, event);
    });

    Promise.all(promises).then(done).catch(fail);

    const service = dbus.sessionBus().getService(servicename(name));
    service.getInterface(objectpath, namespace, (err, player) => {
      if (err) {
        fail(err);
      }

      events.forEach((event) => {
        const method = eventmap[event];
        player[method.method].apply(player, method.args);
      });
    });
  });
});
