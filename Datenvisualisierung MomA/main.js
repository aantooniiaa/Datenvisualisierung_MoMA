//zT fehlen Daten in allCountries? zB Länder die nur weibliche Künstler haben fehlen
//zT gibt es gender die groß und kleingeschrieben werden und es gibt non binory gender und welche ohne gender --> totalCount ist größer als female und male count zsm

let stageWidth, stageHeight;
let data;
let allCountries;
let womenCountries;
let menCountries;
let totalMapShow;
let femaleMapShow;
let maleMapShow;
let currentScene = "total";

$(function () {
  stageWidth = $('#stage').innerWidth();
  stageHeight = $('#stage').innerHeight();
  prepareData();
  createDots();
  setView("total");
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

  //console.log(allCountries);
}

function createDots() {
  const artistsMax = gmynd.dataMax(allCountries, "totalCount");
  const womenMax = gmynd.dataMax(allCountries, "femaleCount");
  const menMax = gmynd.dataMax(allCountries, "maleCount");
  allCountries.forEach(country => {
    const area = gmynd.map(country.totalCount, 0, artistsMax, 25, 1000);
    const r = gmynd.circleRadius(area);
    const x = gmynd.map(country.longitude, -180, 180, 0, stageWidth) - r;  //Längengrade
    const y = gmynd.map(country.latitude, -90, 90, stageHeight, 0) - r;  // Breitengrade

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

    totalDot.data(country);  //Daten in HTML Objekten speichern
    totalDot.data({
      femaleR: femaleR,
      maleR: maleR,
      totalR: r
    });

    totalDot.mouseover(() => {
      totalDot.addClass("hover");
      $('#hoverLabel').text(country.country + " | " + country.totalCount);
    });

    totalDot.mouseout(() => {
      totalDot.removeClass("hover");
      $('#hoverLabel').text("");
    });

    $('#stage').append(totalDot);
  });
}

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
}


