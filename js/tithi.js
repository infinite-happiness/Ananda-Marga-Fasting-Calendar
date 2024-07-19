// https://github.com/cosinekitty/astronomy/tree/master/source/js#SearchMoonPhase
// https://moment.github.io/luxon/#/tour

let tithi = {};

// tithis in order of highest starting angle last
tithi.tithis = [];
tithi.tithis.push({ start: 120, end: 132, name: "Ekádashii", asciiName: "Ekadashii" });
tithi.tithis.push({ start: 168, end: 180, name: "Púrńimá", asciiName: "Purnima" });
tithi.tithis.push({ start: 300, end: 312, name: "Ekádashii", asciiName: "Ekadashii" });
tithi.tithis.push({ start: 348, end: 0, name: "Amávasyá", asciiName: "Amavasya" });

tithi.getNextTithi = function (currentTithi) {
    i = tithi.tithis.indexOf(currentTithi);
    if (i == tithi.tithis.length - 1) return tithi.tithis[0];
    else return tithi.tithis[i + 1];
}

tithi.getFastingDateString = function (selectedTimeZone, nextTithiStart, nextTithiEnd, sunrise_date) {
    // return fasting date string based on selected time zone
    let fastingDate = sunrise_date; // if sunrise is closer to tithi end, the solar day is the day before

    let fastingDTLocal = DateTime.fromJSDate(fastingDate);
    let fastingDTTZ = fastingDTLocal.setZone(selectedTimeZone);
    if (sunrise_date - nextTithiStart.date > nextTithiEnd.date - sunrise_date) fastingDTTZ = fastingDTTZ.minus({ days: 1 });;
    // console.log("tithi.getFastingDateString", selectedTimeZone, nextTithiStart, nextTithiEnd, sunrise_date, fastingDate, fastingDTLocal, fastingDTTZ, fastingDTTZ.toISODate());

    return fastingDTTZ.toISODate();
}

tithi.getTestDataIndex = function (fastingDateString, testData) {
    i = testData.dates.indexOf(fastingDateString);
    //console.log(fastingDateString, i);
    return i;
}

tithi.calculateTithis = function (selectedLocale, selectedTimeZone, selectedDayStart, dayStartList, startDateString, endDateString, latitude, longitude, elevation, aboveGround, testData) {
    //console.log("tithi.calculateTithis:", selectedLocale, selectedTimeZone, selectedDayStart, dayStartList, startDateString, endDateString, latitude, longitude, elevation, aboveGround, testData);
    //startDate = new Date(startDateString);
    //endDate = new Date(endDateString);
    // set dates to selected time zones, including full days of selected dates
    startDateTZ = DateTime.fromISO(startDateString, { zone: selectedTimeZone }); // .startOf('day') is already default
    endDateTZ = DateTime.fromISO(endDateString, { zone: selectedTimeZone }).endOf('day');

    // convert to native js datetimes, as that is what Astronomy uses
    startDate = startDateTZ.toJSDate();
    endDate = endDateTZ.toJSDate();
    console.log("Calculating... start, end:", startDateTZ, endDateTZ, 'local time start, end:', startDate, endDate);

    initMoonPhase = Astronomy.MoonPhase(startDate);
    //let observer = new Astronomy.Observer(25.321684, 82.987289, 80.71);// default to varanasi - https://www.latlong.net/place/varanasi-uttar-pradesh-india-2395.html - https://en.wikipedia.org/wiki/Varanasi
    let observer = new Astronomy.Observer(latitude, longitude, elevation);
    rows = [];

    let i = 0;
    let nextTithi = tithi.tithis[i];
    //console.log(nextTithi, initMoonPhase > nextTithi.start, initMoonPhase)
    for (i = 0; initMoonPhase > nextTithi.start && i < tithi.tithis.length - 1; i++) nextTithi = tithi.tithis[i]
    if (initMoonPhase > tithi.tithis[i].start) nextTithi = tithi.tithis[0]; // if initMoonPhase is larger than last starting angle: search for the first phase
    //console.log(nextTithi)

    limitDays = 13; // days forwards to search - hopefully it stops after first match - since ekadashi is 11 days after a tithi, 13 days should suffice
    searchDate = startDate;
    nextTestDataIndex = -1;
    errors = 0;
    matches = 0;

    while (searchDate <= endDate) {
        nextTithiStart = Astronomy.SearchMoonPhase(nextTithi.start, searchDate, limitDays); // creates error if returns null, such as in 348, Wed Dec 31 2008 19:30:00 GMT+0100 (centraleuropeisk normaltid), 13
        searchDate = nextTithiStart.date;
        nextTithiEnd = Astronomy.SearchMoonPhase(nextTithi.end, searchDate, limitDays);
        searchDate = nextTithiEnd.date;
        let sunriseType = selectedDayStart;
        matchesTestData = false;
        testDataValue = "?";
        //console.log("Tithis:", nextTithiStart, nextTithiEnd);

        if (selectedDayStart == dayStartList[0]) sunrise = Astronomy.SearchAltitude('Sun', observer, +1, nextTithiStart.date, 1, 0); // sun at center of horizon
        else if (selectedDayStart == dayStartList[1]) sunrise = Astronomy.SearchRiseSet('Sun', observer, +1, nextTithiStart.date, 1, aboveGround); // Rise time is when the body first starts to be visible above the horizon. For example, sunrise is the moment that the top of the Sun first appears to peek above the horizon.
        else if (selectedDayStart == dayStartList[2]) sunrise = Astronomy.SearchAltitude('Sun', observer, +1, nextTithiStart.date, 1, -6); // civil dawn
        else if (selectedDayStart == dayStartList[3]) sunrise = Astronomy.SearchAltitude('Sun', observer, +1, nextTithiStart.date, 1, -12); // nautical dawn
        else sunrise = Astronomy.SearchAltitude('Sun', observer, +1, nextTithiStart.date, 1, -18); // astro dawn
        console.log("nextTithiStart.date:", nextTithiStart.date, "Sunrise:", sunrise);

        // there might not be a sunrise during midnight sun or polar night
        if (sunrise === null) {
            console.log("No sunrise found of:", selectedDayStart, nextTithiStart.date)
            // when the days are closing into midnight sun or polar night, the day/night becomes longer and longer and sunrise gets nearer and nearer midnight
            // though midnight would be near the lowest point on average in the time zone (though not during daylight saving, or if daylight saving gets set to perpetual summer time)
            // you can find the lowest point in the sky here https://github.com/cosinekitty/astronomy/tree/master/source/js#SearchHourAngle
            // "To find when a body reaches its lowest point in the sky, pass 12 for hourAngle."
            //sunrise_date = startDateTZ.endOf('day').toJSDate(); // midnight, not the lowest point
            let hourAngleEvent = Astronomy.SearchHourAngle('Sun', observer, 12, nextTithiStart.date, +1);
            sunrise_date = hourAngleEvent.time.date;
            sunriseType = "Lowest Point of the Sun This Day";
            // in Swedish summer time astronomical dawn is not always reached, so trying to get the actual lowest point (the time is calculated in hourAngleEvent, but the angle isn't returned)
            //let angle = Astronomy.AngleFromSun('Sun', sunrise_date); // for exampl
            let sunPos = Astronomy.SunPosition(sunrise_date);
            console.log("New sunrise calculated:", hourAngleEvent, "sunPos:", sunPos);

        }
        else sunrise_date = sunrise.date;

        fastingDateString = tithi.getFastingDateString(selectedTimeZone, nextTithiStart, nextTithiEnd, sunrise_date);

        if (nextTestDataIndex < testData.dates.length && fastingDateString.includes('2024')) {
            if (nextTestDataIndex == -1) nextTestDataIndex = tithi.getTestDataIndex(fastingDateString, testData);
            if (nextTestDataIndex > -1) {
                testDataValue = testData.dates[nextTestDataIndex];
                matchesTestData = fastingDateString === testData.dates[nextTestDataIndex];
                //console.log("testData", fastingDateString, testData.dates[nextTestDataIndex], fastingDateString === testData.dates[nextTestDataIndex]);
                nextTestDataIndex++;
            }

        }


        //console.log(initMoonPhase, nextTithiStart, nextTithi);
        // nextTithiStart may be after the user selected endDate, so use the value if asked for
        if (nextTithiStart.date <= endDate) {
            if (fastingDateString.includes('2024')) {
                if (matchesTestData) matches++;
                else errors++;
            }

            let startTZ = DateTime.fromJSDate(nextTithiStart.date).setZone(selectedTimeZone).setLocale(selectedLocale);
            let endTZ = DateTime.fromJSDate(nextTithiEnd.date).setZone(selectedTimeZone).setLocale(selectedLocale);
            let sunriseTZ = DateTime.fromJSDate(sunrise_date).setZone(selectedTimeZone).setLocale(selectedLocale);

            //rows.push({ start: nextTithiStart, end: nextTithiEnd, tithi: nextTithi, sunrise: sunrise, fastingDateString: fastingDateString, matchesTestData: matchesTestData, testDataValue: testDataValue }); // js datetimes (local time)
            rows.push({ start: startTZ, end: endTZ, tithi: nextTithi, sunrise: sunriseTZ, sunriseType: sunriseType, fastingDateString: fastingDateString, matchesTestData: matchesTestData, testDataValue: testDataValue }); // js datetimes (local time)
            nextTithi = tithi.getNextTithi(nextTithi);
        }
    }

    //console.log("Returning calculated rows:", rows.length, rows)
    return { rows: rows, matches: matches, errors: errors };
}