//zT fehlen Daten in allCountries? zB Länder die nur weibliche Künstler haben fehlen
//zT gibt es gender die groß und kleingeschrieben werden und es gibt non binory gender und welche ohne gender --> totalCount ist größer als female und male count zsm
//Landgrößen stimmen nicht mit Maxima überein, da dot nur mit r definiert wird und nicht mit rF unf rM

//Kategorien sortieren
//Legende?
//relatives Balkendiagramm


let stageWidth, stageHeight;
let data;
let allCountries;
let womenCountries;
let menCountries;
let decadeData;
let groupedCategories = {};
let currentScene = "total";
let viewCount = 0;
let backCount = 0;


$(function () {
  stageWidth = $('#stage').innerWidth();
  stageHeight = $('#stage').innerHeight();
  prepareData();
  createDots();
  setView("total");
  drawBarChart1();
  $('.bar').hide();
  $('#yearView').hide();
  $('#title2').hide();
  $('#title3').hide();
  $('#menuLabel3').hide();
  $('#backButton').hide();
  $('#ageView').hide();
  //$('#overlay').hide();
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

  //console.log(groupedCategories);

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

//console.log(artworkData);


  for (let decadeNumber in decadeData) {
    let decadeArray = decadeData[decadeNumber];
    let cumulatedDecade = gmynd.cumulateData(decadeArray, ['category', 'simpleGender']);
    //console.log(decadeArray);
    //console.log(cumulatedDecade);
    groupedCategories[decadeNumber.toString()] = gmynd.groupData(cumulatedDecade, "category");
    //groupedCategories = gmynd.deleteIncompleteData(groupedCategories, "category");
    //console.log(groupedCategories) 
  };

  // //Alter wird ausgerechnet
  for (let art in artworkData) {
    let artist = artworkData[art];
    const birth = artist.birthYear;
    const creation = artist.creationDate;
    let age = gmynd.duration(birth, creation);
    age = age / 31536000000;
    age = Math.floor(age)
    //console.log(age);
   artist.age = age;
  };

  console.log(artworkData)

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

  //Balkendiagramme
  //für jedes Jahr ein Balken
  //aus jedem Jahr: ein Rechteck aus groupedCategories pro Kategorie

  //  for (let decadeNumber in decadeData) {
  //    let decadeArray = decadeData[decadeNumber];
  //    let cumulatedDecade = gmynd.cumulateData(decadeArray, ['category', 'simpleGender']);
  //    //console.log(decadeNumber);
  //    //console.log(cumulatedDecade);
  //    let groupedCategories = gmynd.groupData(cumulatedDecade, "category");
  //    //console.log(groupedCategories)
  //    for (let i = 0; i< decadeNumber.length; i++){
  //     let bar = $ ('<div> </div>');
  //     const relative_h = 1000;
  //     const x = i * 100;
  //     const y = $('#stage').height() - realtive_h;
  //    }
  //    bar.data({
  //     relativeHeight: realtive_h,
  //     relativeWidth: 10,
  //     relativeLeft: x,
  //     relativeTop: y,
  //     // absoluteHeight: r * 2,
  //     // absoluteWidth: r * 2,
  //     // absoluteLeft: xPos,
  //     // absoluteTop: yPos,
  //   });
  //   $('#stage').append(bar);
  //  };

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
  viewCount = viewCount + 1 ;
  //console.log (viewCount);
  if (viewCount === 1) {
    const countries = $('.country');
    countries.hide();
    $('#title1').hide();
    $('#menuLabel').hide();
    $('.bar').fadeIn();
    $('#title2').show();
    $('#yearView').show();
    $('#backButton').show();
   };
 if (viewCount === 2) {
    $('.bar').fadeOut();
    $('#title2').hide();
    $('#title3').show();
    $('#menuLabel2').hide();
    $('#menuLabel3').show();
    $('#yearView').show();
    //$('#overlay').show();
    //$('#nextButton').hide();
    $('#ageView').fadeIn();
    $('.age').show();
    $('.ageDots').show();
   };
};


function backView() {
  backCount = backCount+1;
  //console.log(backCount);
  if (viewCount === 1 && backCount === 1) {
    const countries = $('.country');
    countries.show();
    $('#title1').show();
    $('#menuLabel').show();
    $('.bar').fadeOut();
    $('#title2').hide();
    $('#menuLabel2').hide();
    $('#yearView').hide();
    $('#backButton').hide();
   };

 if (viewCount === 2 && backCount === 1) {
    // $('#title1').hide();
    // $('#menuLabel').hide();
    $('.bar').fadeIn();
    $('#title2').show();
    $('#menuLabel2').show();
    $('#yearView').show();
    $('#ageView').fadeOut();
   };

  if (viewCount === 2 && backCount === 2) {
    $('.country').show();
    $('#title1').show();
    $('#menuLabel').show();
    $('.bar').fadeOut();
    $('#title2').hide();
    $('#menuLabel2').hide();
    $('#yearView').hide();
    $('#ageView').fadeOut();
    $('#backButton').hide();
    

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
    //let decMax = gmynd.dataSum(category, "count");
    //let decMax = gmynd.dataMax(decMax, "count");
    //console.log("decMax: "+ decMax);
    let barX = barNo * 100;
    let blockY = stageHeight;
    for (let cat in decade) {
      let category = decade[cat];
      category = gmynd.addPropPercentage(category, "count");
      let total = gmynd.dataSum(category, "count");
      //console.log(total);
      let Max = gmynd.dataMax(category, "countPercentage");
      //console.log(Max);
      let h = gmynd.map(total, 0, Max, 0, 80, true);
      blockY -= h;

      let currentBoxX = 0;
      gmynd.sortData(category, 'simpleGender');
      //console.log(category)
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

console.log(groupedCategories);

//Streudiagramm!
//künstler nach alter in jahrzehnten gruppieren -> eine gruppe ist ein kreis
//je größer die gruppe, desto größer der Kreis,
//Kreise (mit ausgerechnetem Alter) auf Skala links mappen


function drawScatter() {
let maxAge = gmynd.dataMax(artworkData, "age");
let maxDecade = gmynd.dataMax(artworkData, "decade");
cumulatedAge = gmynd.cumulateData(artworkData, ["decade", "age"])
console.log(cumulatedAge)

cumulatedAge.forEach(position => {
 console.log(position);

//  dotMax = gmynd.dataMax(position, "count");
//  console.log(dotMax)
 let xPos = gmynd.map(position.decade, 0, maxDecade, 0, stageWidth);
 let yPos = gmynd.map(position.age, 0, maxAge, 0, stageHeight);
//  const areaAge = gmynd.map(cumulatedAge.age, 0, dotMax, 10, 100);
//  const r = gmynd.circleRadius(areaAge); 
 let ageDot = $('<div></div>');
 ageDot.addClass("ageDots");
 ageDot.css({
     'height': "10px",
     'width': "10px",
     'left': xPos,
     'top': yPos,
    });
    $('#stage').append(ageDot);

//  for (let group in position) {
//   dotMax = gmynd.dataMax(group, "count");
//   console.log(dotMax); 

//   let xPos = gmynd.map(position.group, 0, maxAge, 0, stageWidth);
//   let yPos = gmynd.map(position.group, 0, maxDecade, 0, stageHeight);
//   const areaAge = gmynd.map(cumulatedAge.age, 0, dotMax, 10, 100);
//   const r = gmynd.circleRadius(areaAge); 
//   };

 //dotMax = gmynd.dataMax(position, "count");
 //console.log(dotMax);
});

};



