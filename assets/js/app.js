  // Your web app's Firebase configuration
  var firebaseConfig = {
    apiKey: "AIzaSyA6pbfhVhcIKBFH2eJ1OasjN0Lx-fAg5Qo",
    authDomain: "train-times-bbc3c.firebaseapp.com",
    databaseURL: "https://train-times-bbc3c.firebaseio.com",
    projectId: "train-times-bbc3c",
    storageBucket: "train-times-bbc3c.appspot.com",
    messagingSenderId: "37779890828",
    appId: "1:37779890828:web:fe3877045fd7aa1de011a9",
    measurementId: "G-RMFCZVJ29F"
  };

  firebase.initializeApp(firebaseConfig);
  firebase.analytics();

  var db = firebase.database();

  var trainName = $('#name-input');
  var destination = $('#destination-input');
  var firstTime = $('#firsttime-input');
  var frequency = $('#frequency-input');
  var trainTable = $('#train-table');

  $('#add-train').click((event)=> {
    event.preventDefault();
    var trainInput, destinationInput, firstTimeInput, frequencyInput;
  
    trainInput = trainName.val().trim();
    destinationInput = destination.val().trim();
    firstTimeInput = firstTime.val().trim();
    frequencyInput = frequency.val().trim();
  
    db.ref().push({
      trainInput,
      destinationInput,
      firstTimeInput,
      frequencyInput
    });
  });
  
  db.ref().on("child_added", (childSnap) => {
    var snapVal = childSnap.val();
    console.log(`Child snapVal ${snapVal}`);
    populateTable(childSnap);
  });

  var populateTable = (data) => {
    var tr = $('<tr>');
    tr.addClass('train');

    var thTrain = $('<th>').text(data.val().trainInput);
    thTrain.attr('scope', 'row');
    var tdDestination = $('<td>').text(data.val().destinationInput);
    var tdFrequency = $('<td>').text(data.val().frequencyInput);
    var tdFirstTime = $('<td>').text(data.val().firstTimeInput);

    tr.append(thTrain, tdDestination, tdFirstTime, tdFrequency);
    $('#train-table').append(tr);
  }