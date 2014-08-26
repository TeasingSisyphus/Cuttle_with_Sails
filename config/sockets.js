/**
 * WebSocket Server Settings
 * (sails.config.sockets)
 *
 * These settings provide transparent access to the options for Sails'
 * encapsulated WebSocket server, as well as some additional Sails-specific
 * configuration layered on top.
 *
 * For more information on sockets configuration, including advanced config options, see:
 * http://sailsjs.org/#/documentation/reference/sails.config/sails.config.sockets.html
 */

module.exports.sockets = {

  /***************************************************************************
  *                                                                          *
  * This custom onConnect function will be run each time AFTER a new socket  *
  * connects (To control whether a socket is allowed to connect, check out   *
  * `authorization` config.) Keep in mind that Sails' RESTful simulation for *
  * sockets mixes in socket.io events for your routes and blueprints         *
  * automatically.                                                           *
  *                                                                          *
  ***************************************************************************/
  onConnect: function(session, socket) {

    //////////////////////
//Object Definitions//
//////////////////////

//Player Object has two array attributes: hand and field
var Player = function() {
  this.hand = [];
  this.field = [];
}

//Game Object has two Player attributes: p1, p2,
//an array with all cards: cards
//an array with all cards in the current deck (ie not in a hand or field): deck

var Game = function() {
  this.cards =
  ["c1", "c2", "c3", "c4", "c5", "c6", "c7", "c8", "c9", "c10", "c11", "c12", "c13",
  "d1", "d2", "d3", "d4", "d5", "d6", "d7", "d8", "d9", "d10", "d11", "d12", "d13",
  "h1", "h2", "h3", "h4", "h5", "h6", "h7", "h8", "h9", "h10", "h11", "h12", "h13",
  "s1", "s2", "s3", "s4", "s5", "s6", "s7", "s8", "s9", "s10", "s11", "s12", "s13"
  ];
  this.deck = this.cards;
  this.p1 = new Player();
  this.p2 = new Player();
  this.scrap = [];

}
//////////////////////
//Method Definitions//
//////////////////////

//Clears dom and sets game to intial state
Game.prototype.clear = function() {
  //clears attributes of game object
  this.deck = this.cards;
  this.p1.hand = [];
  this.p2.hand = [];
  this.p1.field = [];
  this.p2.field =[];

};

//shuffle method shuffles all cards in deck
Game.prototype.shuffle = function() {
  //len_index keeps track of where we are in shuffling loop
  var len_index = this.deck.length;
  //random_index is randomly selected and used to shuffle
  var random_index = 0;
  var temp = '';
  //Loops until we have switched each place at least once
  while (0 != len_index) {
    random_index = Math.floor(Math.random() * len_index);
    len_index -= 1;
  //Switches deck[len_index] with deck[random_index]
    temp = this.deck[len_index];
    this.deck[len_index] = this.deck[random_index];
    this.deck[random_index] = temp;
  }
};

//Deals Hands to p1 and p2 from the deck
//p1 gets 6 cards, p2 gets 5 and p2 plays first
Game.prototype.deal = function() {
  this.clear();
  this.p1.hand[0] = this.deck.shift();
  for (var i = 0; i < 5; i++) {
    this.p2.hand[i] = this.deck.shift();
    this.p1.hand[i+1] = this.deck.shift();
  };
}

//Moves Card from player.hand to player.field
Player.prototype.to_field = function (index) {
  temp = this.hand[index];
  this.hand[index] = this.hand[0];
  this.hand[0] = temp;
  this.field[this.field.length] = this.hand.shift();
}

Player.prototype.pick_card = function (game) {
  this.hand[this.hand.length] = game.deck.shift();
}

////////////////////
//Object Instances//
////////////////////
var count = 0;
var game = new Game();


    //Clears game when clear event is fired
    socket.on('clear', function() {
      game.clear();
    });
    //Deals card to player 1 when player 1's pick button is pressed
    socket.on('pick_card1', function (){
      if(game.p1.hand.length < 9) {
        game.p1.pick_card(game);
        socket.emit('render', game);
      }
    });

    //Deals card to player 2 when player 2's pick button is pressed
    socket.on('pick_card2', function (num){
      if(game.p2.hand.length < 9) {
        game.p2.pick_card(game);
        socket.emit('render', game);
      }
    });
    //function executes when user clicks 'shuffle'
    //shuffles deck and emits 'shuffled' event, passing game object through socket
    socket.on('shuffle', function () {
      console.log('shuffle requested');
      game.shuffle();
      game.shuffle();
      game.shuffle();
      console.log('shuffles made');
      socket.emit('shuffled', game);
      console.log('shuffle emitted');
    });

    //function executes when user clicks 'DEAL'
    //Calls deal method on game
    socket.on('deal', function () {
      game.deal();
      console.log('hands dealt');
      socket.emit('render', game);
    });

    socket.on('p1_play', function(index) {
      game.p1.to_field(index);
      console.log('p1 hand: ' + game.p1.hand + '\np1 field: ' + game.p1.field);
      socket.emit('render', game);
    });
  
    socket.on('p2_play', function(index) {
      game.p2.to_field(index);
      console.log('p2 hand: ' + game.p2.hand + '\np2 field: ' + game.p2.field);
      socket.emit('render', game);
    });
  
    socket.on('render req', function() {
      socket.emit('render', game);
    });
  },
  
  
  /***************************************************************************
    *                                                                          *
    * This custom onDisconnect function will be run each time a socket         *
    * disconnects                                                              *
    *                                                                          *
    ***************************************************************************/
    onDisconnect: function(session, socket) {
  
    // By default: do nothing.
  },


  /***************************************************************************
  *                                                                          *
  * `transports`                                                             *
  *                                                                          *
  * A array of allowed transport methods which the clients will try to use.  *
  * The flashsocket transport is disabled by default You can enable          *
  * flashsockets by adding 'flashsocket' to this list:                       *
  *                                                                          *
  ***************************************************************************/
  // transports: [
  //   'websocket',
  //   'htmlfile',
  //   'xhr-polling',
  //   'jsonp-polling'
  // ],

  /***************************************************************************
  *                                                                          *
  * Use this option to set the datastore socket.io will use to manage        *
  * rooms/sockets/subscriptions: default: memory                             *
  *                                                                          *
  ***************************************************************************/

  // adapter: 'memory',

  /***************************************************************************
  *                                                                          *
  * Node.js (and consequently Sails.js) apps scale horizontally. It's a      *
  * powerful, efficient approach, but it involves a tiny bit of planning. At *
  * scale, you'll want to be able to copy your app onto multiple Sails.js    *
  * servers and throw them behind a load balancer.                           *
  *                                                                          *
  * One of the big challenges of scaling an application is that these sorts  *
  * of clustered deployments cannot share memory, since they are on          *
  * physically different machines. On top of that, there is no guarantee     *
  * that a user will "stick" with the same server between requests (whether  *
  * HTTP or sockets), since the load balancer will route each request to the *
  * Sails server with the most available resources. However that means that  *
  * all room/pubsub/socket processing and shared memory has to be offloaded  *
  * to a shared, remote messaging queue (usually Redis)                      *
  *                                                                          *
  * Luckily, Socket.io (and consequently Sails.js) apps support Redis for    *
  * sockets by default. To enable a remote redis pubsub server, uncomment    *
  * the config below.                                                        *
  *                                                                          *
  * Worth mentioning is that, if `adapter` config is `redis`, but host/port  *
  * is left unset, Sails will try to connect to redis running on localhost   *
  * via port 6379                                                            *
  *                                                                          *
  ***************************************************************************/

  // adapter: 'redis',
  // host: '127.0.0.1',
  // port: 6379,
  // db: 'sails',
  // pass: '<redis auth password>'


  /***************************************************************************
  *                                                                          *
  * `authorization`                                                          *
  *                                                                          *
  * Global authorization for Socket.IO access, this is called when the       *
  * initial handshake is performed with the server.                          *
  *                                                                          *
  * By default (`authorization: false`), when a socket tries to connect,     *
  * Sails allows it, every time. If no valid cookie was sent, a temporary    *
  * session will be created for the connecting socket.                       *
  *                                                                          *
  * If `authorization: true`, before allowing a connection, Sails verifies   *
  * that a valid cookie was sent with the upgrade request. If the cookie     *
  * doesn't match any known user session, a new user session is created for  *
  * it. (In most cases, the user would already have a cookie since they      *
  * loaded the socket.io client and the initial HTML page.)                  *
  *                                                                          *
  * However, in the case of cross-domain requests, it is possible to receive *
  * a connection upgrade request WITHOUT A COOKIE (for certain transports)   *
  * In this case, there is no way to keep track of the requesting user       *
  * between requests, since there is no identifying information to link      *
  * him/her with a session. The sails.io.js client solves this by connecting *
  * to a CORS endpoint first to get a 3rd party cookie (fortunately this     *
  * works, even in Safari), then opening the connection.                     *
  *                                                                          *
  * You can also pass along a ?cookie query parameter to the upgrade url,    *
  * which Sails will use in the absense of a proper cookie e.g. (when        *
  * connection from the client):                                             *
  * io.connect('http://localhost:1337?cookie=smokeybear')                    *
  *                                                                          *
  * (Un)fortunately, the user's cookie is (should!) not accessible in        *
  * client-side js. Using HTTP-only cookies is crucial for your app's        *
  * security. Primarily because of this situation, as well as a handful of   *
  * other advanced use cases, Sails allows you to override the authorization *
  * behavior with your own custom logic by specifying a function, e.g:       *
  *                                                                          *
  *    authorization: function authSocketConnectionAttempt(reqObj, cb) {     *
  *                                                                          *
  *        // Any data saved in `handshake` is available in subsequent       *
  *        requests from this as `req.socket.handshake.*`                    *
  *                                                                          *
  *        // to allow the connection, call `cb(null, true)`                 *
  *        // to prevent the connection, call `cb(null, false)`              *
  *        // to report an error, call `cb(err)`                             *
  *     }                                                                    *
  *                                                                          *
  ***************************************************************************/

  // authorization: false,

  /***************************************************************************
  *                                                                          *
  * Whether to run code which supports legacy usage for connected sockets    *
  * running the v0.9 version of the socket client SDK (i.e. sails.io.js).    *
  * Disabled in newly generated projects, but enabled as an implicit default *
  * (i.e. legacy usage/v0.9 clients be supported if this property is set to  *
  * true, but also if it is removed from this configuration file or set to   *
  * `undefined`)                                                             *
  *                                                                          *
  ***************************************************************************/

  // 'backwardsCompatibilityFor0.9SocketClients': false,

  /***************************************************************************
  *                                                                          *
  * Whether to expose a 'get /__getcookie' route with CORS support that sets *
  * a cookie (this is used by the sails.io.js socket client to get access to *
  * a 3rd party cookie and to enable sessions).                              *
  *                                                                          *
  * Warning: Currently in this scenario, CORS settings apply to interpreted  *
  * requests sent via a socket.io connection that used this cookie to        *
  * connect, even for non-browser clients! (e.g. iOS apps, toasters, node.js *
  * unit tests)                                                              *
  *                                                                          *
  ***************************************************************************/

  // grant3rdPartyCookie: true,

  /***************************************************************************
  *                                                                          *
  * Match string representing the origins that are allowed to connect to the *
  * Socket.IO server                                                         *
  *                                                                          *
  ***************************************************************************/

  // origins: '*:*',

};
