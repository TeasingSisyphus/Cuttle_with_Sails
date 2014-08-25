

    var socket = io.connect('http://localhost:1337');
    var count = 0;

    /////////////////////////
    //On Click Method Calls//
    /////////////////////////

    $('#picard').click(function() {  //when Pick a Card div is clicked
      socket.emit('card', count);
    });

    $('#shuflcard').click(function() {  //when shuffle div is clicked
      socket.emit('shuffle');
    });

    $('#dealcard').click(function() {  //when deal div is clicked
      socket.emit('deal');
    });

    $('#field1button').click(function() {
      var index = prompt('Which Card, sucka?!');
      socket.emit('p1_play', index);
    });

    $('#field2button').click(function() {
      var index = prompt('Which Card, sucka?!');
      socket.emit('p2_play', index);
    });

    $('#renderbutton').click(function() {
      socket.emit('render req');
    });

    ////////////////
    //Socket Stuff//
    ////////////////

    socket.on('gamesend', function (game) {
      var card = game.cards[count];
      count++;
      console.log('Card Number ' + count + " is: " + card);
    });

    socket.on('shuffled', function (game) {
      var arr = game.deck;
      console.log('Current Deck:\n' + arr);
    });

    socket.on('dealt', function (game) {
      var temp = game.p1.hand;
      var temp2 = game.p2.hand;
      console.log("Player 1's Hand: " + temp + "\nPlayer 2's Hand: " + temp2);
    });

  ////////////////////////
  //new styuff/////////////
  //dont knwo if you need the fucntion call to replace the elemnts in teh div///////
  ////////////////////////////


    socket.on('render', function (game){
      var temp = game;

      //Renders Player 1's Hand
      $('.p1hand').each(function () {
        var index = $(this).prop('id');
        index = index.replace(/[^\d]/g, '');
        var card = temp.p1.hand[index];
        console.log(index);
        console.log(card);
        $(this).html(card);

      });
      //Renders Player 2's Hand
      $('.p2hand').each(function () {
        var index = $(this).prop('id');
        index = index.replace(/[^\d]/g, '');
        var card = temp.p2.hand[index];
        console.log(index);
        console.log(card);
        $(this).html(card);
      });

      //Renders Player 1's Field
      $('.p1field').each(function () {
        var index = $(this).prop('id');
        index = index.replace(/[^\d]/g, '');
        var card = temp.p1.field[index];
        console.log(index);
        console.log(card);
        $(this).html(card);
      });

      //Renders Player 2's Field
      $('.p2field').each(function () {
        var index = $(this).prop('id');
        index = index.replace(/[^\d]/g, '');
        var card = temp.p2.field[index];
        console.log(index);
        console.log(card);
        $(this).html(card);
      });
    });
