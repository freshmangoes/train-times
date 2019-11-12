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

// variable for firebase database
var db = firebase.database();

// jQuery caching to make my life easier :)
var trainName = $('#name-input');
var destination = $('#destination-input');
var firstTime = $('#firsttime-input');
var frequency = $('#frequency-input');
var trainTable = $('#train-table');

var trainCounter = 0;

$(document).ready(()=> {
  updateTimes();
});

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

    // makes a moment object out of firstTimeInput
    var first = moment(firstTimeInput, "HH:mm");
    // calculates next train arrival in military time
    var nextArrival = calculateNextArrival(first, frequencyInput);
    // formats nextArrival into 12hour time from military time
    var nextTrainArrival = nextArrival.format("hh:mm A" );

    var now = moment();
    // converts nextArrival into usable 24hr format
    var then = moment(nextArrival, "HH:mm");
    var minsAway = minutesAway(now, then);

    // debug
    console.log('nextArrival', nextArrival);

    // pushes valid input to database
    db.ref().push({
      trainInput,
      destinationInput,
      nextTrainArrival,
      frequencyInput,
      minsAway
    });


    // user input invalid
  } else if(!moment(firstTimeInput, "HH:mm").isValid()){
    console.error("not a valid time input");
  }
});

// on child added to db
db.ref().on("child_added", (childSnap) => {
  // var snapVal = childSnap.val();
  // console.log('childSnap val:', snapVal);
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
  var tdNext = $('<td>').text(data.val().nextTrainArrival);
  var tdMinsAway = $('<td>').text(data.val().minsAway);
  // appends all of the inputs to the table row
  tr.append(thTrain, tdDestination, tdNext, tdFrequency, tdMinsAway);
  // prepends table row to the table
  $('#train-table').prepend(tr);
};

// calculates next train arrival time
var calculateNextArrival = (first, interval) => {
  // get the current time
  var now = moment();
  // variable to be mutated into next arrival time
  var momentObj = first;
  // while momentObj is before now = moment()
  while(momentObj.isBefore(now)) {
    // add the interval of the train 
    momentObj.add(interval, "minutes");
  }

  // returns momentObj as a moment object 
  console.log(momentObj);
  return momentObj;
};

var minutesAway = (now, then) => {
  return then.diff(now, "minutes");
};

var updateTimes = () => {
  db.ref().once('value', (snap) => {
    snap.forEach((childSnap) => {
      var upDest = childSnap.val().destinationInput;
      var upName = childSnap.val().trainInput;
      var upFreq = childSnap.val().frequencyInput;

      // updating nextTrainArrival
      var tempFirst = moment(moment(childSnap.val().nextTrainArrival, "hh:mm A").format("HH:mm"), "HH:mm");
      var tempInterval = childSnap.val().frequencyInput;
      var upNextTrainArrival = calculateNextArrival(tempFirst, tempInterval);
            
      // gets new minutesAway
      var now = moment();
      // uses new train arrival time to calculate minutes away
      var upMinsAway = minutesAway(now, upNextTrainArrival);
        
      // format upNextTrainArrival into something usable
      upNextTrainArrival = upNextTrainArrival.format("hh:mm A");
      
      // gets the key for the child
      var key = childSnap.key;
      var updateData = {
        destinationInput: upDest,
        trainInput: upName,
        frequencyInput: upFreq,
        nextTrainArrival: upNextTrainArrival,
        minsAway: upMinsAway
      };
      // empty object for updates
      var updates = {};
      // turns key into the child directory/node nand adds update object
      updates['/' + key] = updateData;
      // pushes updates to database
      db.ref().update(updates);
    });
  });
}
