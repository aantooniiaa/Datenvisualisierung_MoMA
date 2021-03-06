let stageWidth, stageHeight;
let data;
let allCountries;
let womenCountries;
let menCountries;
let decadeData;
let groupedCategories = {};
let currentScene = "total";
let viewCount = 0;


$(function () {
  stageWidth = $('#stage').innerWidth();
  stageHeight = $('#stage').innerHeight();
  prepareData();
  createDots();
  setView("total");
  drawBarChart1();
  $('.bar').hide();
  $('#yearView').hide();
  $('#yearView2').hide();
  $('#title2').hide();
  $('#title3').hide();
  $('#menuLabel3').hide();
  $('#backButton').hide();
  $('#ageView').hide();
  // $('#overlay').hide();
  drawScatter();
  $('.ageDots').hide();

});

function prepareData() {

  data = gmynd.mergeData(artistData, countryNationalityData, "nationality"); // in Künstler Datensatz werden Herkunftsländer hinzugefügt

  let countryData = gmynd.mergeData(positionData, countryNationalityData, "country", "countryName"); //in Länderdatensatz wird Nationalität eingebunden
  countryData = gmynd.deleteProps(countryData, ["alpha2Code", "numericCode"]); //löscht die angegebenen Parameter raus


  let cumulatedArtists = gmynd.cumulateData(data, ["nationality"]); //Künstler werden nach Nationalität gefiltert und gezählt
  allCountries = gmynd.mergeData(countryData, cumulatedArtists, "nationality"); //"count" (Anzahl Künstler pro Land) wird zu restlichen Landinfos hinzugefügt

  let cumulatedGender = gmynd.cumulateData(data, ["nationality", "gender"]); //Künstlerinnen werden nach Nationalität und Gender gefiltert und gezählt
  cumulatedGender = gmynd.groupData(cumulatedGender, "gender"); //KünstlerInnen werden nach Gender sortiert

  womenCountries = cumulatedGender.Female; //Datensatz mit Künstlerinnen sortiert nach Nationalität
  womenCountries = gmynd.mergeData(womenCountries, countryData, "nationality"); //Koordinaten werden zu sortierten weiblichen Ländern hinzugefügt

  menCountries = cumulatedGender.Male; //Datensatz mit Künstler sortiert nach Nationalität
  menCountries = gmynd.mergeData(menCountries, countryData, "nationality"); //Koordinaten werden zu sortierten männlichen Ländern hinzugefügt

  womenCountries = gmynd.renameProps(womenCountries, ["count"], ["femaleCount"]);
  menCountries = gmynd.renameProps(menCountries, ["count"], ["maleCount"]);
  allCountries = gmynd.renameProps(allCountries, ["count"], ["totalCount"]);
  allCountries = gmynd.mergeData(allCountries, womenCountries, "alpha3Code");
  allCountries = gmynd.mergeData(allCountries, menCountries, "alpha3Code");
  allCountries = gmynd.deleteProps(allCountries, "gender");


  artworkData.forEach(artwork => {
    artwork.decade = Math.floor((parseInt(artwork.dateAcquired) - 1920) / 10) * 10 + 1920;

    // calculate simplified gender
    let genders = artwork.gender.split(" ");
    if (genders.length == 1) {
      if (genders[0] == "(Male)") {
        artwork.simpleGender = 2;
      } else if (genders[0] == "(Female)") {
        artwork.simpleGender = 0;
      } else {
        artwork.simpleGender = 3;
      }
    } else {
      artwork.simpleGender = 1;
    }
  });

  let decadeData = gmynd.groupData(artworkData, ["decade"]);


  //creationDate in Jahrzehnte sortiert
  artworkData.forEach(artwork => {
    artwork.creationDecade = Math.floor((parseInt(artwork.creationDate) - 1760) / 10) * 10 + 1760;
  });
  //let decadeCreationData = gmynd.groupData(artworkData, ["creationDate"]);
  console.log(artworkData)


  //sort categories
  let category = artworkData.category
  if (category == "(Architecture & Design)") {
    artworkData.sortedCategory = 0;
  };
 if (category == "(Painting & Sculpture)") {
    artworkData.sortedCategory = 1;
  };
if (category == "(Drawings & Prints)") {
    artworkData.sortedCategory = 2;
  };
if (category == "(Photography)") {
    artworkData.sortedCategory = 3;
  };
if (category == "(Media and Performance)") {
    artworkData.sortedCategory = 4;
  };
if (category == "(Film)") {
    artworkData.sortedCategory = 5;
  };
if (category == "(  )") {
    artworkData.sortedCategory = 6;
  };


  for (let decadeNumber in decadeData) {
    let decadeArray = decadeData[decadeNumber];
    let cumulatedDecade = gmynd.cumulateData(decadeArray, ['category', 'simpleGender']);
    groupedCategories[decadeNumber.toString()] = gmynd.groupData(cumulatedDecade, "category");
  };

  // //Alter wird ausgerechnet
  for (let art in artworkData) {
    let artist = artworkData[art];
    const birth = artist.birthYear;
    const creation = artist.creationDate;
    let age = gmynd.duration(birth, creation);
    age = age / 31536000000;
    age = Math.floor(age)
   artist.age = age;
  };

 };

function createDots() {

  //Weltkarten
  const artistsMax = gmynd.dataMax(allCountries, "totalCount");
  const womenMax = gmynd.dataMax(allCountries, "femaleCount");
  const menMax = gmynd.dataMax(allCountries, "maleCount");
  allCountries.forEach(country => {
    const area = gmynd.map(country.totalCount, 0, artistsMax, 25, 1000);
    const r = gmynd.circleRadius(area);
    const x = gmynd.map(country.longitude, -180, 180, 0, stageWidth) - r; //Längengrade
    const y = gmynd.map(country.latitude, -90, 90, stageHeight, 0) - r; // Breitengrade

    const femaleArea = gmynd.map(country.femaleCount, 0, womenMax, 25, 1000);
    const femaleR = gmynd.circleRadius(femaleArea);
    const maleArea = gmynd.map(country.maleCount, 0, menMax, 25, 1000);
    const maleR = gmynd.circleRadius(maleArea);

    let totalDot = $('<div></div>');
    totalDot.addClass("country");

    totalDot.css({
      'height': r * 2,
      'width': r * 2,
      'left': x,
      'top': y,
    });

    totalDot.data(country); //Daten in HTML Objekten speichern
    totalDot.data({
      femaleR: femaleR,
      maleR: maleR,
      totalR: r
    });

    totalDot.mouseover(() => {
      totalDot.addClass("hover");
      let val = country.totalCount;
      if (currentScene === "men") val = country.maleCount;
      else if (currentScene === "women") val = country.femaleCount;
      $('#hoverLabel').text(country.country + " | " + val);
    });

    totalDot.mouseout(() => {
      totalDot.removeClass("hover");
      $('#hoverLabel').text("");
    });

    $('#stage').append(totalDot);
  });

};

function setView(viewTitle) {
  const countries = $('.country');
  if (currentScene !== viewTitle) {
    if (viewTitle === "total") {
      countries.removeClass("menCountry");
      countries.removeClass("womenCountry");
    } else if (viewTitle === "women") {
      countries.removeClass("menCountry");
      countries.addClass("womenCountry");
    } else if (viewTitle === "men") {
      countries.removeClass("womenCountry");
      countries.addClass("menCountry");
    }
  }
  currentScene = viewTitle;

};

function nextView() {
  if (viewCount === 0) {
    //Von Screen 0 auf Screen 1 wechseln
    const countries = $('.country');
    countries.hide();
    $('#title1').hide();
    $('#menuLabel').hide();
    $('.bar').fadeIn();
    $('#title2').show();
    $('#yearView').show();
    $('#backButton').show();
    $('#hoverLabel').hide();
    viewCount = 1;
   } else if (viewCount === 1) {
    //Von Screen 1 auf Screen 2 wechseln
    $('.bar').fadeOut();
    $('#title2').hide();
    $('#title3').show();
    $('#menuLabel2').hide();
    $('#menuLabel3').show();
    $('#yearView').hide();
    $('#yearView2').show();
    $('#nextButton').hide();
    $('#ageView').fadeIn();
    $('.age').show();
    $('.ageDots').show();
    viewCount = 2;
   };
};


function backView() {
  if (viewCount === 1) {
    //Von Screen 1 in Screen 0 wechseln
    const countries = $('.country');
    countries.show();
    $('#title1').show();
    $('#menuLabel').show();
    $('.bar').fadeOut();
    $('#title2').hide();
    $('#menuLabel2').hide();
    $('#yearView').hide();
    $('#yearView2').hide();
    $('#backButton').hide();
    $('#menuLabel3').hide();
    $('#title3').hide();
    $('.ageDots').hide();
    viewCount = 0;
   } else if (viewCount === 2) {
    // Von Screen 2 in Screen 1 wechseln
    $('.bar').fadeIn();
    $('#title2').show();
    $('#menuLabel2').show();
    $('#yearView').show();
    $('#ageView').fadeOut();
    $('#yearView2').hide();
    $('#nextButton').show();
    $('.ageDots').hide();
    $('#menuLabel3').hide();
    $('#title3').hide();
    viewCount = 1;
   };
};


const boxColors = {
  "Architecture & Design": "#81BCE4",
  "Painting & Sculpture": "#7DE8AA",
  "Drawings & Prints": "#81E4D1",
  "Photography": "#F08175",
  "Media and Performance": "F7AE6E",
  "Film": "#FFE166",
  "  ": "#E2E0E5"
};

function drawBarChart1() {
  let decadeData = gmynd.groupData(artworkData, ["decade"]);
  const barWidth = 50;
  let barNo = 0;
  for (let dec in groupedCategories) {
    let decade = groupedCategories[dec];
    let barX = barNo * 100;
    let blockY = stageHeight;
    for (let cat in decade) {
      let category = decade[cat];
      category = gmynd.addPropPercentage(category, "count");
      let total = gmynd.dataSum(category, "count");
      let Max = gmynd.dataMax(category, "countPercentage");
      let h = gmynd.map(total, 0, Max, 0, 80, true);
      blockY -= h;

      let currentBoxX = 0;
      gmynd.sortData(category, 'simpleGender');
      category.forEach((gender, i) => {

        let color = "black";
        if (boxColors[cat]) color = chroma(boxColors[cat]).darken(gender.simpleGender);
        let w = gmynd.map(gender.countPercentage, 0, 1, 0, barWidth);
        let dot = $('<div></div>');
        dot.addClass("bar")
          .css({
            position: "absolute",
            left: barX + currentBoxX,
            top: blockY,
            width: w,
            height: h,
            "background-color": color
          });
        $('#stage').append(dot);
        currentBoxX += w;
      });
   
    }
    barNo++;
  }
};

//Streudiagramm!
//künstler nach alter in jahrzehnten gruppieren -> eine gruppe ist ein kreis
//je größer die gruppe, desto größer der Kreis,
//Kreise (mit ausgerechnetem Alter) auf Skala mappen


function drawScatter() {
let maxAge = gmynd.dataMax(artworkData, "age");
let minAge = gmynd.dataMin(artworkData, "age");
let maxDecade = gmynd.dataMax(artworkData, "creationDecade");
let minDecade = gmynd.dataMin(artworkData, "creationDecade");
cumulatedAge = gmynd.cumulateData(artworkData, ["creationDecade", "age"]);
let stageBegin = $('#stage').position.left;
let stageEnd = stageBegin + $('#stage').position.width;
console.log(stageBegin + " " + stageEnd)

cumulatedAge.forEach(position => {
if (position.creationDecade < 1800 || isNaN(position.age)) {
  console.log("skip " + position.creationDecade + " " + position.age)
  return;

};
 let xPos = gmynd.map(position.creationDecade, 1800, maxDecade, 0, 1280);
 let yPos = gmynd.map(position.age, minAge, maxAge, stageHeight, 100);
 let r = position.count / 10;
 let ageDot = $('<div></div>');
 ageDot.addClass("ageDots");
 ageDot.css({
     'height': r,
     'width': r,
     'left': xPos-(r / 2),
     'top': yPos,
    });
    $('#stage').append(ageDot);
});

};



