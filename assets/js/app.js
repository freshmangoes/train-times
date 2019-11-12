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

// jQuery caching to make my life easier :)
var trainName = $('#name-input');
var destination = $('#destination-input');
var firstTime = $('#firsttime-input');
var frequency = $('#frequency-input');
var trainTable = $('#train-table');

// calculates next train arrival time
var calculateNextArrival = (first, interval) => {
  // get the current time
  var currentTime = moment();

  // variable to be mutated into next arrival time
  var tempTime = first;

  // while tempTime is before currentTime = moment()
  while(tempTime.isBefore(currentTime)) {
    // add the interval of the train 
    tempTime.add(interval, "minutes");
    // debug
    console.log(`Next time iteration: ${tempTime}`);
  }
  // return the tempTime to get next train arrival
  return tempTime.format("HH:mm");
};

$('#add-train').click((event)=> {
  event.preventDefault();
  var trainInput, destinationInput, firstTimeInput, frequencyInput;

  trainInput = trainName.val().trim();
  destinationInput = destination.val().trim();
  frequencyInput = frequency.val().trim();
  firstTimeInput = firstTime.val().trim();
  
  // user time input validation
  if(moment(firstTimeInput, "HH:mm").isValid()) {
    // debug
    console.log("valid time input");

    var next = moment(firstTimeInput, "HH:mm");
    var nextArrival = calculateNextArrival(next, frequencyInput);
    
    // debug
    console.log('nextArrival', nextArrival);

    // pushes valid input to database
    db.ref().push({
      trainInput,
      destinationInput,
      nextArrival,
      frequencyInput
    });

    // user input invalid
  } else if(!moment(firstTimeInput, "HH:mm").isValid()){
    
    // debug
    console.error("not a valid time input");
    
    // lame attempt to show modal, not working lol
    // $('#not-valid-modal').modal('show');
  }
});

// on child added to db
db.ref().on("child_added", (childSnap) => {
  var snapVal = childSnap.val();
  console.log(`Child snapVal ${snapVal}`);
  
  // populate the table with information from the child added
  populateTable(childSnap);
});

// populates table
var populateTable = (data) => {
  
  // jQuery cache variables 
  var tr = $('<tr>');

  // adds class train to the row
  tr.addClass('train');

  // inputs train, destination, frequency, and first time - will have to chance first time to relative time/next arrival
  var thTrain = $('<th>').text(data.val().trainInput);
  thTrain.attr('scope', 'row');
  var tdDestination = $('<td>').text(data.val().destinationInput);
  var tdFrequency = $('<td>').text(data.val().frequencyInput);
  var tdNext = $('<td>').text(data.val().nextArrival);

  // appends all of the inputs to the table row
  tr.append(thTrain, tdDestination, tdNext, tdFrequency);

  // prepends table row to the table
  $('#train-table').prepend(tr);
};

