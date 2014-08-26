

    var socket = io.connect('http://localhost:1337');
    var count = 0;

//Selector is used to pick a card, store which player
//has it and it's index in their hand
    var Selector = function() {
      this.p = 0;
      this.index = 0;
      this.card = '';
      this.place = '';
    }

    Selector.prototype.clear = function() {
      this.p = 0;
      this.index = 0;
      this.card = '';
      this.place = '';

      $('#selector').html('');
    }

    var selector = new Selector;

    var clear_dom = function() {
      selector.p = 0;
      selector.index = 0;
      selector.card = '';
      $('#selector').html('');
      socket.emit('clear');  
      
      $('.card').each(function() {
        $(this).html('');
      });

      $('#scrap').html('Scrap: 0');    
    }
    /////////////////////////
    //On Click Method Calls//
    /////////////////////////

    $('#clear').on('click', function() {
      var clear = clear_dom();
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
      selector.p = 1;
      var temp_id = $(this).prop('id');
      temp_id = temp_id.replace(/[^\d]/g, '');   
      selector.index = temp_id;
      selector.card = this.innerhtml;
      selector.place = 'hand';    
      console.log(selector.place);
      $('#selector').html($(this).html()); 
    });

    $('.p2hand').on('click', function(){
      selector.p = 2;
      var temp_id = $(this).prop('id');
      temp_id = temp_id.replace(/[^\d]/g, '');   
      selector.index = temp_id;
      selector.card = this.innerhtml;    
      selector.place = 'hand';
      $('#selector').html($(this).html()); 
    });

    //When p1's field field space is clicked,
    //if a card is selected, and the field has space for it
    //it will be moved to the field. Otherwise the clicked card is selected
    $('.p1field').on('click', function(){
      //Checks that card is selected
      if(selector.card != ''){
        //Checks that selcted card is p1's
        if(selector.p == 1){
          //Checks that p1 has space on field
          if($('#p_one_f5').html() == '') {
            if(selector.place = 'hand'){
              socket.emit('p1_play', selector.index);
              selector.clear();
            }
          }
        }
      } else{
        //If no card is selected and the clicked space
        //has a card, that card is selcted
        if($(this).html() != '') {
          selector.p = 1;
          selector.place = 'field';
          var temp_id = $(this).prop('id');
          temp_id = temp_id.replace(/[^\d]/g, '');   
          selector.index = temp_id;
          selector.card = this.innerhtml;
          $('#selector').html($(this).html());
        }
      }
    });

    $('.p2field').on('click', function(){
      //Checks that card is selected
      if(selector.card != ''){
        //Checks that selcted card is p2's
        if(selector.p == 2){
          //Checks that p2 has space on field
          if($('#p_two_f5').html() == '') {
            //If p2 has space, his card is moved to his field
            if(selector.place = 'hand'){
              socket.emit('p2_play', selector.index);
              //After card is moved, selector is cleard
              selector.clear();
            }
          }
        }
      } else{
        //If no card is selected and the clicked space
        //has a card, that card is selcted
        if($(this).html() != '') {
          selector.p = 2;
          selector.place = 'field';
          var temp_id = $(this).prop('id');
          temp_id = temp_id.replace(/[^\d]/g, '');   
          selector.index = temp_id;
          selector.card = this.innerhtml;
          $('#selector').html($(this).html());
        }
      }
    });

    $('#picard1').on('click', function() {
        socket.emit('pick_card1');
    });

    $('#picard2').on('click', function() {
        socket.emit('pick_card2');
    });

    //When scrap is clicked, selected card is place
    //at the END of game.scrap array on server
    //and board is rendered
    $('#scrap').on('click', function() {
      //Only move card to scrap if something is selected
      if(selector.card != '') {
        //Check to see if card is p1's
        if(selector.p == 1) {
          //Move card from hand if selected card is in p1's hand
          if(selector.place == 'hand') {
            socket.emit('p1_scrap_hand', selector.index);
            //Clear selector after moving card
            selector.clear();
          } else if(selector.place == 'field') {
              //Move card from field if selected card is in p1's field
              socket.emit('p1_scrap_field', selector.index);
              //Clear selector after moving card
              selector.clear();
          }
        }
        //Check to see if selected card is p2's
        else if(selector.p ==2) {
          //Check to see if selected card is in p2's hand
          if(selector.place == 'hand'){
            socket.emit('p2_scrap_hand', selector.index);
            selector.clear();
          } else if(selector.place == 'field') {
            //Move card from field if selected card is in p2's field
            socket.emit('p2_scrap_field', selector.index);
            //Clear selector after moving card
            selector.clear();
          }
        }
      }
    });
    ////////////////
    //Socket Stuff//
    ////////////////

    socket.on('clear_dom', function() {
      var clear = clear_dom();
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


    //Renders Board by iterating through each slot for cards and updating based
    //on game object passed through socket
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
        if(index < temp.p2.hand.length){
          var card = temp.p2.hand[index];
          $(this).html(card);
        } else {
          $(this).html('');
        }
      });

      //Renders Player 1's Field
      $('.p1field').each(function () {
        var index = $(this).prop('id');
        index = index.replace(/[^\d]/g, '');
        if (index < temp.p1.field.length) {
          var card = temp.p1.field[index];
          $(this).html(card);
        } else {
          $(this).html('');
        }
      });

      //Renders Player 2's Field
      $('.p2field').each(function () {
        var index = $(this).prop('id');
        index = index.replace(/[^\d]/g, '');
        if (index < temp.p2.field.length) {
          var card = temp.p2.field[index];
          $(this).html(card);
        } else {
          $(this).html('');
        }
      });

      //Renders Scrap Pile (displays number of cards)
      $('#scrap').html('Scrap: ' + temp.scrap.length);
    });
