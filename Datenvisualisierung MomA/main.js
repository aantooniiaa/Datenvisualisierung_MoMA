//zT fehlen Daten in allCountries? zB Länder die nur weibliche Künstler haben fehlen
//zT gibt es gender die groß und kleingeschrieben werden und es gibt non binory gender und welche ohne gender --> totalCount ist größer als female und male count zsm
//Landgrößen stimmen nicht mit Maxima überein, da dot nur mit r definiert wird und nicht mit rF unf rM

//Jahrzehnte unter Balken, Titel und Menu Balken
//Kategorien sortieren
//Legende?
//relatives Balkendiagramm

//Streudiagramm!

let stageWidth, stageHeight;
let data;
let allCountries;
let womenCountries;
let menCountries;
let decadeData;
let groupedCategories = {};
// let totalMapShow;
// let femaleMapShow;
// let maleMapShow;
let currentScene = "total";

$(function () {
  stageWidth = $('#stage').innerWidth();
  stageHeight = $('#stage').innerHeight();
  prepareData();
  createDots();
  setView("total");
  drawBarChart1();
  $('.bar').hide();
  let title2 = document.getElementById("title2");
  title2.parentNode.removeChild(title2);
  let menu2 = document.getElementById("menuLabel2");
  menu2.parentNode.removeChild(menu2);
  let yearView = document.getElementById("yearView");
  yearView.parentNode.removeChild(yearView);
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

  console.log(groupedCategories);


  for (let decadeNumber in decadeData) {
    let decadeArray = decadeData[decadeNumber];
    let cumulatedDecade = gmynd.cumulateData(decadeArray, ['category', 'simpleGender']);
    //console.log(decadeArray);
    //console.log(cumulatedDecade);
    groupedCategories[decadeNumber.toString()] = gmynd.groupData(cumulatedDecade, "category");
    // console.log(groupedCategories)
    //  console.log(decadeNumber) 
  }
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

function nextView1() {
  const countries = $('.country');
  countries.removeClass();
  let title1 = document.getElementById("title1");
  title1.parentNode.removeChild(title1);
  let menu = document.getElementById("menuLabel");
  menu.parentNode.removeChild(menu);
  $('.bar').fadeIn();
  let title2 = document.getElementById("title2");
  title2.parentNode.addChild(title2);
  let menu2 = document.getElementById("menuLabel2");
  menu2.parentNode.addChild(menu2);
  let yearView = document.getElementById("yearView");
  yearView.parentNode.addChild(yearView);
};





const boxColors = {
  "Architecture & Design": "#81BCE4",
  "Painting & Sculpture": "#7DE8AA",
  "Drawings & Prints": "#81E4D1",
  "Photography": "#F08175",
  "Media & Performance": "#F7AE6E",
  "Film": "#FFE166",
};

function drawBarChart1() {
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
      // let decMax = gmynd.dataMax(category, "count");
      // console.log(decMax);
      let h = gmynd.map(total, 0, 500, 0, 100, true);
      blockY -= h;

      let currentBoxX = 0;
      gmynd.sortData(category, 'simpleGender');
      console.log(category)
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
}
/* artworkData.forEach(artwork=> {
    artwork.decade = Math.floor((parseInt(artwork.dateAcquired)-1920)/10)*10 + 1920;
    
    // calculate simplified gender
    let genders = artwork.gender.split(" ");
    if (genders.length == 1) {
      if (genders[0] == "(Male)") {
        artwork.simpleGender = 'male';
      } else if (genders[0] == "(Female)") {
        artwork.simpleGender = 'female';
      } else {
        artwork.simpleGender = 'unknown';
      }
    } else {
      artwork.simpleGender = 'group';
    }
  });
  let decadeData = gmynd.groupData(artworkData,  ["decade"]);
  //console.log(decadeData);

decadeData.forEach((year) => {
          console.log(year);
          let h = 100 
          let w =  50 
          let x = 80;
          let y = stageHeight;
    
          
          let twenties = $('<div></div>');
          twenties.addClass("year20s");
          twenties.css({
              "background-color": "#2D5376",
              "position": "absolute",
              height: h,
              width: w,
              left: x,
              top: y,
              "border-radius": 0,
          });
          $('#stage').append(twenties);
          });
      };
 */
