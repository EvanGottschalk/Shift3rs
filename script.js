`use strict`;

var mobile = false;
if( /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) ) {
  console.log("Mobile device detected");
  mobile = true;
};

//getDisplaySize();
function getDisplaySize () {
  console.log("screen.width: ", screen.width);
  console.log("screen.height: ", screen.height);
  console.log("window.screen.width: ", window.screen.width);
  console.log("window.screen.height: ", window.screen.height);
  console.log("window.innerWidth: ", window.innerWidth);
  console.log("window.innerHeight: ", window.innerHeight);
  console.log("document.documentElement.clientWidth: ", document.documentElement.clientWidth);
};

const dayArray = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

var timesOfTheYear = {'Month': 0,
                      'Week': 0,
                      'Day': 0,
                      'Hour': 0,
                      'Minute': 0,
                      'Second': 0};

var shiftDict = {"Image Overlay": {"Shift Frequency": 0,
                                  "Time Unit": "", 
                                  "Max Value": 0, // = number of images
                                  "Current Value": 0,
                                  "Integer": true,
                                  "File Type": ".png"},
                 "Video Overlay": {"Shift Frequency": 0,
                                  "Time Unit": "", 
                                  "Max Value": 0,
                                  "Current Value": 0,
                                  "Integer": true,
                                  "File Type": ".mp4"},
                 "Color Overlay": {"Shift Frequency": 0,
                                  "Time Unit": "", 
                                  "Max Value": 0,
                                  "Current Value": 0,
                                  "Integer": false},
                 "Base Image": {"Shift Frequency": 3,
                                  "Time Unit": "Second", 
                                  "Max Value": 4, // = number of images
                                  "Current Value": 0,
                                  "Integer": true,
                                  "File Type": ".png"},
                 "Hue Rotation": {"Shift Frequency": 4,
                                  "Max Shift Frequency": 4,
                                  "Time Unit": "Second", 
                                  "Max Value": 30,
                                  "Max Max": 360,
                                  "Current Value": 0,
                                  "Integer": false}}

var dayOfTheWeek_number;
var dayOfTheWeek_string;
//var currentTime = {}
var hour;
var minute;
var second;
var month;
var year;
//var currentTime_Strings = {}
var dateTimeString;
var dateTimeArray;
var dateString;
var timeString;
var dayDateString;

var currentOverlayColor;
var currentVideoOverlay;
var currentHueRotation;
var currentHueRotation_percent;
const oneDay_seconds = 60 * 60 * 24;
const oneDay_milliseconds = 1000 * oneDay_seconds;

var maxHueRotation = 30;
var imageNumber;

var colorValues = {"yellow": 1677690, //ffff00
                   "orange": 16744448, //ff8000
                   "red": 16711680, //ff0000
                   "violet": 16711935, //ff00ff
                   "indigo": 255} //0000ff

var colorIncrements = {"yellow -> orange": -256,
                       "orange -> red": -256,
                       "red -> violet": 2,
                       "violet -> indigo": -131072,
                       "indigo -> violet": 131072,
                       "violet -> red": -2,
                       "red -> orange": 256,
                       "orange -> yellow": 256}


var firstRun = true;
//updateOverlay();
update();


async function update() {
  refreshTime();
  //updateBaseImage();
  //updateHueRotation();
  for (const [key, value] of Object.entries(shiftDict)) {
    //console.log(key, value);
    if (shiftDict[key]['Shift Frequency']) {
      if (shiftDict[key]['Max Shift Frequency']) {
        updateMaxShift(key);
        console.log(shiftDict[key]);
      }
      if (shiftDict[key]['Integer']) {
        updateIntegerShift(key);
      } else {
        updateValueShift(key);
      }
    }
  }
}
  setInterval(update, 1000);


async function pause(time) {
  return new Promise(resolve => setTimeout(resolve, time));
}

function getLengthOfMonth(month, year) {
  return new Date(year, month, 0).getDate();
}

function seededRNG(seed, min, max) {
  var random_number = seed;
  //+50% modularly if first digit is even
  const first_digit = Number(seed.toString()[1]);
  if (first_digit % 2 === 0) {
    random_number += Math.floor(((max - min) / 2));
  }
  if (random_number >= max) {
    random_number = (random_number % (max - min)) + min;
  }
  //+25% or -25% on even/odd second digit
  const second_digit = Number(seed.toString()[0]);
  if (second_digit % 2 === 0) {
    random_number += Math.floor((max - min) * .25);
  } else {
    random_number -= Math.floor((max - min) * .25);
  }
  //+3% or -3% on even/odd sum of digits digit
  if ((first_digit + second_digit) % 2 === 0) {
    random_number += Math.floor((max - min) * .03);
  } else {
    random_number -= Math.floor((max - min) * .03);
  }
  return(random_number);
}


`use strict`;
function refreshTime() {
  //const dateDisplay = document.getElementById("dateText");
  //const timeDisplay = document.getElementById("timeText");
  const dateObject = new Date();
  hour = dateObject.getHours();
  minute = dateObject.getMinutes();
  second = dateObject.getSeconds();
  month = dateObject.getMonth();
  year = dateObject.getFullYear();
  dayOfTheWeek_number = dateObject.getDay();
  dayOfTheWeek_string = dayArray[dayOfTheWeek_number];
  calculateTimesOfTheYear(dateObject);
  console.log(timesOfTheYear);
  dateTimeString = dateObject.toLocaleString();
  dateTimeArray = dateTimeString.split(", ");
  dateString = dateTimeArray[0];
  timeString = dateTimeArray[1];
  dayDateString = dayOfTheWeek_string + ' '.repeat(13 - dayOfTheWeek_string.length) + dateString;
  //dateDisplay.textContent = dayDateString;
  //timeDisplay.textContent = timeString;
  return { hour, minute, second };
}

function calculateTimesOfTheYear(dateObject) {
  const year_start = new Date(dateObject.getFullYear(), 0, 0);
  const time_difference = dateObject - year_start;
  timesOfTheYear['Day'] = Math.floor(time_difference / oneDay_milliseconds);
  timesOfTheYear['Week'] = Math.floor(timesOfTheYear['Day'] / 7);
  timesOfTheYear['Month'] = month;
  timesOfTheYear['Second'] = (timesOfTheYear['Day'] * oneDay_seconds) + (hour * 60 * 60) + (minute * 60) + second;
  timesOfTheYear['Minute'] = Math.floor(timesOfTheYear['Second'] / 60);
  timesOfTheYear['Hour'] = Math.floor(timesOfTheYear['Minute'] / 60);
  return(timesOfTheYear);
}


function calculateValueShift(shift_frequency, shift_unit, shift_max) {
  var shift_percent, shift_value;
  //calculates percent time progress towards reaching end of shift_frequency duration
  if (shift_unit === "Month") {
    shift_percent = (timesOfTheYear['Second'] % (shift_frequency * oneDay_seconds * getLengthOfMonth(month, year))) / (shift_frequency * oneDay_seconds * getLengthOfMonth(month, year));
  } else if (shift_unit === "Week") {
    shift_percent = (timesOfTheYear['Second'] % (shift_frequency * oneDay_seconds * 7)) / (shift_frequency * oneDay_seconds * 7);
  } else if (shift_unit === "Day") {
    shift_percent = (timesOfTheYear['Second'] % (shift_frequency * oneDay_seconds)) / (shift_frequency * oneDay_seconds);
  } else if (shift_unit === "Hour") {
    shift_percent = (timesOfTheYear['Second'] % (shift_frequency * 60 * 60)) / (shift_frequency * 60 * 60);
  } else if (shift_unit === "Minute") {
    shift_percent = (timesOfTheYear['Second'] % (shift_frequency * 60)) / (shift_frequency * 60);
  } else if (shift_unit === "Second") {
    shift_percent = (timesOfTheYear['Second'] % shift_frequency) / shift_frequency;
  }
  console.log("Shift Percent: ", shift_percent);
  //calculates shift value from 0 up to shift_max (< .5) or shift_max down to 0 (else)
  if (shift_percent < .5) {
    shift_value = (shift_percent * 2) * shift_max;
  } else {
    shift_value = shift_max - (((shift_percent * 2) * shift_max) - shift_max);
  }
  return(shift_value);
}

function calculateIntegerShift(shift_frequency, shift_unit, shift_max) {
  const integer = Math.floor(timesOfTheYear[shift_unit] / shift_frequency) % shift_max;
  return(integer);
}

function updateMaxShift(key) {
  var new_max = calculateIntegerShift(shiftDict[key]['Max Shift Frequency'],
                                      shiftDict[key]['Time Unit'],
                                      shiftDict[key]['Max Max']);
  new_max = seededRNG(new_max, 0, shiftDict[key]['Max Max']);
  shiftDict[key]['Max Value'] = new_max;
}

function updateIntegerShift(key) {
  const starting_integer = shiftDict[key]["Current Value"];
  var integer = starting_integer;
  if (key === "Base Image") {
    const file_type = shiftDict[key]['File Type'];
    const baseImage = document.getElementById("baseImage");
    console.log("Current Base Image: ", baseImage.src)
    integer = calculateIntegerShift(shiftDict[key]['Shift Frequency'], shiftDict[key]['Time Unit'], shiftDict[key]['Max Value']);
    console.log("New Base Image: ", integer.toString() + file_type);
    if (baseImage.src !== integer.toString() + file_type) {
      baseImage.src = integer.toString() + file_type;
    }
  }
  if (starting_integer !== integer) {
    shiftDict[key]["Current Value"] = integer;
  }
}

function updateValueShift(key) {
  const starting_value = shiftDict[key]["Current Value"];
  var value = starting_value;
  if (key === "Hue Rotation") {
    const baseImage = document.getElementById("baseImage");
    console.log("Current Hue Rotation: ", baseImage.style.filter.toString());
    value = calculateValueShift(shiftDict[key]['Shift Frequency'], shiftDict[key]['Time Unit'], shiftDict[key]['Max Value'])
    console.log("New Hue Rotation: ", value);
    const hue_rotation_style = "hue-rotate(" + value.toString() + "deg)";
    if (baseImage.style.filter.toString() !== hue_rotation_style.toString()) {
      baseImage.style.filter = hue_rotation_style;
    }
  }
  if (starting_value !== value) {
    shiftDict[key]["Current Value"] = value;
  }
}



function colorShift(startColor, endColor, shiftPercent) {
  const startColorValue = colorValues[startColor];
  console.log("Start Color Value: ", startColorValue);
  const colorTransitionString = startColor + " -> " + endColor;
  console.log("Color Transition String: ", colorTransitionString);
  const colorIncrement = colorIncrements[colorTransitionString];
  console.log("Color Increment: ", colorIncrement);
  const colorTransitionValue = Math.floor(shiftPercent * 100) * colorIncrement;
  console.log("Color Transition Value: ", colorTransitionValue);
  const newColorValue = startColorValue + colorTransitionValue;
  console.log("New Color Value: ", newColorValue);
  const newColorHexString = "#" + newColorValue.toString(16);
  console.log("New Color Hex String: ", newColorHexString);
  return newColorHexString;
}

function updateColorOverlay(hour, minute) {
  //early morning
  var startColor;
  var endColor;
  var shiftPercent;
  if ( hour >= 5 && hour < 7 ) {
    startColor = "violet";
    endColor = "red";
    shiftPercent = (((hour - 5) * 60) + minute) / 120;

  //morning
  } else if ( hour >= 7 && hour < 10 ) {
    startColor = "red";
    endColor = "orange";
    shiftPercent = (((hour - 7) * 60) + minute) / 180;

  //day
  } else if ( hour >= 10 && hour < 15 ) {
    startColor = "orange";
    endColor = "yellow";
    shiftPercent = (((hour - 10) * 60) + minute) / 300;

  //sun setting
  } else if ( hour >= 15 && hour < 18 ) {
    startColor = "yellow";
    endColor = "orange";
    shiftPercent = (((hour - 15) * 60) + minute) / 180;

  //sun set
  } else if ( hour >= 18 && hour < 20 ) {
    startColor = "orange";
    endColor = "red";
    shiftPercent = (((hour - 18) * 60) + minute) / 120;

  //early night
  } else if ( hour >= 20 && hour < 23 ) {
    startColor = "red";
    endColor = "violet";
    shiftPercent = (((hour - 20) * 60) + minute) / 180;

  //night
  } else if ( hour === 23 || hour < 2 ) {
    startColor = "violet";
    endColor = "blue";
    if ( hour === 23 ) {
      shiftPercent = minute / 180;
    } else {
      shiftPercent = (((hour + 1) * 60) + minute) / 180;
    }

  //end of night
  } else if ( hour >= 2 && hour < 5 ) {
    startColor = "blue";
    endColor = "violet";
    shiftPercent = (((hour - 2) * 60) + minute) / 180;
  }

  const newColor = colorShift(startColor, endColor, shiftPercent);
  if ( newColor != currentOverlayColor) {
    const colorOverlay = document.getElementById("colorOverlay");
    colorOverlay.style.backgroundImage = 'radial-gradient(circle at 50% 50%, #ffffff00 0%, #ffffff00 55%, ' + newColor + '70 100%)';
  }
}

async function updateVideos(videoOverlay, baseVideo) {
  var opacity = .295;
  var fadingOut = true;
  var randomColorNumber = .1 + Math.floor(Math.random() * 5) / 10;
  console.log("Random Color Number: ", randomColorNumber);
  while ( opacity < .30 ) {
    await pause(10);
    currentHueRotation+=randomColorNumber;
    const hueRotationString = currentHueRotation.toString();
    baseVideo.style.filter = "hue-rotate(" + hueRotationString + "deg)";
    if (fadingOut) {
      videoOverlay.style.opacity = opacity;
      opacity-=.005;
    } else {
      opacity+=.005;
      videoOverlay.style.opacity = opacity;
    }
    if (opacity <= 0) {
      fadingOut = false;
      var randomVideoString = (Math.floor(Math.random() * 9)).toString();
      while (randomVideoString === currentVideoOverlay) {
        var randomVideoString = (Math.floor(Math.random() * 9)).toString();
      }
      currentVideoOverlay = randomVideoString;
      console.log("Random Video String: ", currentVideoOverlay);
      videoOverlay.src = currentVideoOverlay + ".mp4";
    }
  }
}

async function updateBaseVideo () {
  const baseVideo = document.getElementById("emrgncVideo");
  const randomColorNumber = Math.floor(Math.random() * 360);
  console.log("Random Color Number: ", randomColorNumber);
  const randomColorString = randomColorNumber.toString();
  baseVideo.style.filter = "hue-rotate(" + randomColorString + "deg)";
}

async function updateOverlay() {
  const { hour, minute, second } = refreshTime();
  console.log(hour, minute, second);
  updateColorOverlay(hour, minute);
  const videoOverlay = document.getElementById("videoOverlay");
  const baseVideo = document.getElementById("emrgncVideo");
  if ( firstRun ) {
    videoOverlay.src = "0.mp4";
    videoOverlay.style.opacity = .30;
    firstRun = false;
  } else {
    updateVideos(videoOverlay, baseVideo);
  }
}
  //setInterval(updateOverlay, 10000);