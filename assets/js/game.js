

    var socket = io.connect('http://localhost:1337');
    var count = 0;

//Selector is used to pick a card, store which player
//has it and it's index in their hand
    var Selector = function() {
      this.p = 0;
      this.index = 0;
      this.card = '';
    }

    var selector = new Selector;

    var clear_dom = function() {
      selector.p = 0;
      selector.index = 0;
      selector.card = '';
      socket.emit('clear');  
      
      $('.card').each(function() {
        $(this).html('');
      });    
    }
    /////////////////////////
    //On Click Method Calls//
    /////////////////////////

    $('#clear').on('click', function() {
      var clear = clear_dom();
      socket.emit('clear');
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

    //When someone clicks a card in their hand, it is selected.
    //Game captures the index of the card in their hand,
    //which card was selected and which player picked it
    $('.p1hand').on('click', function(){
      selector.player = 1;
      var temp_id = $(this).prop('id');
      temp_id = temp_id.replace(/[^\d]/g, '');   
      selector.index = temp_id;
      selector.card = this.innerhtml;    
      $('#selector').html($(this).html()); 
    });

    $('.p2hand').on('click', function(){
      selector.player = 2;
      var temp_id = $(this).prop('id');
      temp_id = temp_id.replace(/[^\d]/g, '');   
      selector.index = temp_id;
      selector.card = this.innerhtml;    
      $('#selector').html($(this).html()); 
    });

    //When an empty field space is clicked,
    //if a card is 
    $('.p1field').on('click', function(){
      if(selector.player == 1){
        if(selector.card != ''){
        socket.emit('p1_play', selector.index);
        }
      }
    });

    $('.p2field').on('click', function(){
      if (selector.player == 2) {
        if(selector.card != ''){
          socket.emit('p2_play', selector.index);
        }
      }
    });

    $('#picard1').on('click', function() {
        socket.emit('pick_card1');
    });

    $('#picard2').on('click', function() {
        socket.emit('pick_card2');
    });

    ////////////////
    //Socket Stuff//
    ////////////////

    socket.on('clear_dom', function() {
      $('.card').each(function() {
        $(this).html('');
      });
    });

    socket.on('gamesend', function (game) {
      var card = game.cards[count];
      count++;
      console.log('Card Number ' + count + " is: " + card);
    });

    socket.on('shuffled', function (game) {
      var arr = game.deck;
      console.log('Current Deck:\n' + arr);
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
        if(index < temp.p1.hand.length){
          var card = temp.p1.hand[index];
          $(this).html(card);
        } else {
          $(this).html('');
        }

      });
      //Renders Player 2's Hand
      $('.p2hand').each(function () {
        var index = $(this).prop('id');
        index = index.replace(/[^\d]/g, '');
        var card = temp.p2.hand[index];
        $(this).html(card);
      });

      //Renders Player 1's Field
      $('.p1field').each(function () {
        var index = $(this).prop('id');
        index = index.replace(/[^\d]/g, '');
        var card = temp.p1.field[index];
        $(this).html(card);
      });

      //Renders Player 2's Field
      $('.p2field').each(function () {
        var index = $(this).prop('id');
        index = index.replace(/[^\d]/g, '');
        var card = temp.p2.field[index];
        $(this).html(card);
      });
    });
