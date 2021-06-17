// let stageWidth, stageHeight; 
// let data;
// let womenCountries;
// let menCountries;


// $ (function() {
//     stageWidth = $('#stage').innerWidth();
//     stageHeight = $('#stage').innerHeight();
//     prepareData(); 
//     //createDots();
//     drawAll();
//     drawWomen();
//     drawMen();
// });

// function prepareData() {

//  data = gmynd.mergeData(artistData, countryNationalityData, "nationality"); // in Künstler Datensatz werden Herkunftsländer hinzugefügt
 
//  allCountries = gmynd.mergeData(positionData, countryNationalityData, "country", "countryName"); //in Länderdatensatz wird Nationalität eingebunden

//  let cumulatedArtists = gmynd.cumulateData(data, ["nationality"]); //Künstler werden nach Nationalität gefiltert und gezählt
//  allCountries = gmynd.mergeData(allCountries, cumulatedArtists, "nationality"); //"count" (Anzahl Künstler pro Land) wird zu restlichen Landinfos hinzugefügt

//  let cumulatedGender = gmynd.cumulateData(data, ["nationality", "gender"]); //Künstlerinnen werden nach Nationalität und Gender gefiltert und gezählt
//  cumulatedGender = gmynd.groupData(cumulatedGender, "gender"); //KünstlerInnen werden nach Gender sortiert
//  womenCountries = cumulatedGender.Female; //Datensatz mit Künstlerinnen sortiert nach Nationalität
//  womenCountries = gmynd.mergeData(womenCountries, allCountries, "nationality"); //Koordinaten werden zu sortierten weiblichen Ländern hinzugefügt
//  menCountries = cumulatedGender.Male; //Datensatz mit Künstler sortiert nach Nationalität
//  menCountries = gmynd.mergeData(menCountries, allCountries, "nationality"); //Koordinaten werden zu sortierten männlichen Ländern hinzugefügt



//  console.log(womenCountries);
// };


// // function drawMap() { 

// //   const artistsMax = gmynd.dataMax(allCountries, "count");
// //   //console.log(artistsMax);

// //   allCountries.forEach(country => {
// //      const area = gmynd.map(country.count, 0, artistsMax, 25, 1000);
// //      const r =  gmynd.circleRadius(area);
// //       //const area = 20;
// //       //const r =  gmynd.circleRadius(area);
// //       const x = gmynd.map(country.longitude, -180, 180, 0, stageWidth) -r;  //Längengrade
// //       const y = gmynd.map(country.latitude, -90, 90, stageHeight, 0) - r;  // Breitengrade
      
// //       let dot = $ ('<div></div>');
// //       dot.addClass("country");
// //         dot.css({
// //             'height': r * 2,
// //             'width': r * 2,
// //             'left': x,
// //             'top': y,
// //         });

// //         dot.data(country);  //Daten in HTML Objekten speichern

       

// //         dot.mouseover(() => {
// //             dot.addClass("hover");
// //             $('#hoverLabel').text(country.countryName);
// //         });

// //         dot.mouseout(() => {
// //             dot.removeClass("hover");
// //             $('#hoverLabel').text("");
// //         });

// //         $('#stage').append(dot);


// //     })
// // };

// // function createDots() { 

// //     let dot = $ ('<div></div>');
// //         dot.addClass("country");
// //           dot.css({
// //               'height': r * 2,
// //               'width': r * 2,
// //               'left': x,
// //               'top': y,
// //           });
  
// //           dot.data(country);  //Daten in HTML Objekten speichern
  
// //           dot.mouseover(() => {
// //               dot.addClass("hover");
// //               $('#hoverLabel').text(country.country + " | " + country.count);
// //           });
  
// //           dot.mouseout(() => {
// //               dot.removeClass("hover");
// //               $('#hoverLabel').text("");
// //           });
  
// //           $('#stage').append(dot);

// // };


// function drawAll() {

//  const artistsMax = gmynd.dataMax(allCountries, "count");

//  allCountries.forEach(country => {
//        showingAll = true;
//        const area = gmynd.map(country.count, 0, artistsMax, 20, 1500);
//        const r =  gmynd.circleRadius(area);
//         //const area = 20;
//         //const r =  gmynd.circleRadius(area);
//         const x = gmynd.map(country.longitude, -180, 180, 0, stageWidth) -r;  //Längengrade
//         const y = gmynd.map(country.latitude, -90, 90, stageHeight, 0) - r;  // Breitengrade

//         let dot = $ ('<div></div>');
//         dot.addClass("country");
//           dot.css({
//               'height': r * 2,
//               'width': r * 2,
//               'left': x,
//               'top': y,
//           });
  
//           dot.data(country);  //Daten in HTML Objekten speichern
  
//           dot.mouseover(() => {
//               dot.addClass("hover");
//               $('#hoverLabel').text(country.country + " | " + country.count);
//           });
  
//           dot.mouseout(() => {
//               dot.removeClass("hover");
//               $('#hoverLabel').text("");
//           });
  
//           $('#stage').append(dot);

//       });

// };

// function drawWomen() {

//  const womenMax = gmynd.dataMax(womenCountries, "count");

//     womenCountries.forEach(country => {
//         showingWomen = true;
//         const area = gmynd.map(country.count, 0, womenMax, 20, 1500);
//         const r =  gmynd.circleRadius(area);
//         const x = gmynd.map(country.longitude, -180, 180, 0, stageWidth) -r;  //Längengrade
//         const y = gmynd.map(country.latitude, -90, 90, stageHeight, 0) - r;  // Breitengrade

//         let dot = $ ('<div></div>');
//         dot.addClass("country");
//           dot.css({
//               'height': r * 2,
//               'width': r * 2,
//               'left': x,
//               'top': y,
//           });
  
//           dot.data(country);  //Daten in HTML Objekten speichern
  
//           dot.mouseover(() => {
//               dot.addClass("hover");
//               $('#hoverLabel').text(country.country + " | " + country.count);
//           });
  
//           dot.mouseout(() => {
//               dot.removeClass("hover");
//               $('#hoverLabel').text("");
//           });
  
//           $('#stage').append(dot);

//     });
    
// };

// function drawMen() {
//  const menMax = gmynd.dataMax(menCountries, "count");

//     menCountries.forEach(country => {
//         showingMen = true;
//         const area = gmynd.map(country.count, 0, menMax, 20, 1500);
//         const r =  gmynd.circleRadius(area);
//         const x = gmynd.map(country.longitude, -180, 180, 0, stageWidth) -r;  //Längengrade
//         const y = gmynd.map(country.latitude, -90, 90, stageHeight, 0) - r;  // Breitengrade

//         let dot = $ ('<div></div>');
//         dot.addClass("country");
//           dot.css({
//               'height': r * 2,
//               'width': r * 2,
//               'left': x,
//               'top': y,
//           });
  
//           dot.data(country);  //Daten in HTML Objekten speichern
  
//           dot.mouseover(() => {
//               dot.addClass("hover");
//               $('#hoverLabel').text(country.country + " | " + country.count);
//           });
  
//           dot.mouseout(() => {
//               dot.removeClass("hover");
//               $('#hoverLabel').text("");
//           });
  
//           $('#stage').append(dot);

//        });

// };
  


// function toggleView() {
//     console.log("gedrückt");
//      if (showingAll) {
//        drawAll();
//        };
//      if (showingWomen) {
//         drawWomen();
//        };
//      if (showingMen) {
//           drawMen();
//          };
// };
  
// function clickHandler(event) {
//     const dot = $(event.target);
//     let contintent = dot.data().continent;
     
//     $('country[data-continent= "' + continent + '"]').css({
//         'background-color': 'yellow',
//     })

//     $(".clicked").removeClass("clicked");
//     dot.addClass("clicked");
//     //$('#clickLabel').text(country.countryName);
//     $('#clickLabel').text(dot.data().countryName);  //Zugriff auf alle Paramenter von country Objekt (nicht nur countryName)
// };

// function drawMap() { 
//     showingChart = false
  
//     $('.country').each(function() {
//       const dotData = $(this).data();
//       $(this).css({
//           'background-color': dotData.color,
//       });
//       $(this).animate({
//           height: dotData.mapHeight,
//           width: dotData.mapWidth,
//           'border-radius': 100,
//           left: dotData.mapLeft,
//           top: dotData.mapTop,
//       }, 500);
//   });

// };