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


$(function () {
    stageWidth = $('#stage').innerWidth();
    stageHeight = $('#stage').innerHeight();
    prepareData();
    createDots();
    drawTotalMap();
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
};


function menuAllView() {

    if (femaleMapShow || maleMapShow) {
        $('.country').show();
        $('.womenCountry').hide();
        $('.menCountry').hide();
        drawTotalMap();
    };
};

function menuFemaleView() {
    if (totalMapShow || maleMapShow) {
        $('.country').hide();
        $('.womenCountry').show();
        $('.menCountry').hide();
        drawFemaleMap();
    };
};

function menuMaleView() {
    if (totalMapShow || femaleMapShow) {
        $('.country').hide();
        $('.womenCountry').hide();
        $('.menCountry').show();
        drawMaleMap();
    };
};


function createDots() {

    const artistsMax = gmynd.dataMax(allCountries, "totalCount");
    allCountries.forEach(country => {
        const area = gmynd.map(country.totalCount, 0, artistsMax, 25, 1000);
        const r = gmynd.circleRadius(area);
        const x = gmynd.map(country.longitude, -180, 180, 0, stageWidth) - r;  //Längengrade
        const y = gmynd.map(country.latitude, -90, 90, stageHeight, 0) - r;  // Breitengrade

        let totalDot = $('<div></div>');
        totalDot.addClass("country");
        totalDot.css({
            'height': r * 2,
            'width': r * 2,
            'left': x,
            'top': y,
        });

        totalDot.data(country);  //Daten in HTML Objekten speichern

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

    
    const womenMax = gmynd.dataMax(allCountries, "femaleCount");
    allCountries.forEach(country => {
        const area = gmynd.map(country.femaleCount, 0, womenMax, 25, 1000);
        const r = gmynd.circleRadius(area);
        const x = gmynd.map(country.longitude, -180, 180, 0, stageWidth) - r;  //Längengrade
        const y = gmynd.map(country.latitude, -90, 90, stageHeight, 0) - r;  // Breitengrade

        let femaleDot = $('<div></div>');
        femaleDot.addClass("womenCountry");
        femaleDot.css({
            'height': r * 2,
            'width': r * 2,
            'left': x,
            'top': y,
        });

        femaleDot.data(country);  //Daten in HTML Objekten speichern

        femaleDot.mouseover(() => {
            femaleDot.addClass("hoverWomen");
            $('#hoverLabel').text(country.country + " | " + country.femaleCount);
        });

        femaleDot.mouseout(() => {
            femaleDot.removeClass("hoverWomen");
            $('#hoverLabel').text("");
        });

        $('#stage').append(femaleDot);
    });


    const menMax = gmynd.dataMax(allCountries, "maleCount");
    allCountries.forEach(country => {
        const area = gmynd.map(country.maleCount, 0, menMax, 25, 1000);
        const r = gmynd.circleRadius(area);
        const x = gmynd.map(country.longitude, -180, 180, 0, stageWidth) - r;  //Längengrade
        const y = gmynd.map(country.latitude, -90, 90, stageHeight, 0) - r;  // Breitengrade

        let maleDot = $('<div></div>');
        maleDot.addClass("menCountry");
        maleDot.css({
            'height': r * 2,
            'width': r * 2,
            'left': x,
            'top': y,
        });

        maleDot.data(country);  //Daten in HTML Objekten speichern

        maleDot.mouseover(() => {
            maleDot.addClass("hoverMen");
            $('#hoverLabel').text(country.country + " | " + country.maleCount);
        });

        maleDot.mouseout(() => {
            maleDot.removeClass("hoverMen");
            $('#hoverLabel').text("");
        });

        $('#stage').append(maleDot);
    });

};


function drawTotalMap() { 
    totalMapShow = true;
  
    $('.country').each(function() {
      const totalDotData = $(this).data();
      $(this).css({
          'background-color': totalDotData.color,
      });
  });
  
};

function drawFemaleMap() { 
    femaleMapShow = true;
  
    $('.womenCountry').each(function() {
      const femaleDotData = $(this).data();
      $(this).css({
          'background-color': femaleDotData.color,
      });
  });
  
};

function drawMaleMap() { 
    maleMapShow = true;
  
    $('.menCountry').each(function() {
      const maleDotData = $(this).data();
      $(this).css({
          'background-color': maleDotData.color,
      });
  });
  
};




