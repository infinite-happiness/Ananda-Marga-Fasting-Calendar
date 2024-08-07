
document.addEventListener('DOMContentLoaded', function () {
    document.getElementById('calculator_advanced').innerHTML = layout.calculator_advanced();
}, false);

layout.calculator_advanced = function () {
    return `
                <button class="circle large yellow10" style="position:fixed; right:10px; bottom:10px; z-index:9;" @click="advancedDlgIsOpen = !advancedDlgIsOpen;">
                    <i>settings</i>
                </button>

                <article x-show="showTestDataAccuracy">
                    <div class="row right-align">
                        <button class="transparent circle large" @click="showTestDataAccuracy = false">
									<i>close</i>
						</button>
                    </div>

                    <h4>Comparison with Official Fasting Days 2024</h4>
                    <p>Matches: <span x-text=" matches"></span></p>
                    <p>Errors: <span x-text="errors"></span></p>
                    <p>Accuracy: <span x-text="(100*matches/(errors+matches)).toFixed(2) + '%'"></span></p>

                    Errors:
                    <table class="stripes red2">
                        <tr>
                            <th>Tithi</th>
                            <th>Calculated Fasting Day</th>
                            <th>Official Fasting Day</th>
                            <th>Difference Between How Much the Tithi Spans Over the Two Possible Fasting Date Candidates (A Small Value Makes the Error Understandable)</th>
                        </tr>
    					<template x-for="row in rows">
                                <template x-if="!row.matchesTestData">
                                    <tr>
                                            <td x-text="row.tithi.name"></td>
                                            <td><span x-text="row.fastingDTTZ.toISODate()"></span></td>
											<td x-text="row.testDataValue"></td>
											<!--<td x-text="row.start"></td>
											<td x-text="row.sunrise"></td>
											<td x-text="Interval.fromDateTimes(row.start, row.sunrise)"></td>-->
                                            <td x-text="Interval.fromDateTimes(row.start, row.sunrise).toDuration(['hours', 'minutes', 'seconds']).minus(Interval.fromDateTimes(row.sunrise, row.end).toDuration(['hours', 'minutes', 'seconds'])).toFormat('h\\'h\\'m\\'m\\'s\\'s\\'')"></td>
                                    </tr>
                                </template>
                        </template>
                    </table>
                </article>

				<dialog class="left yellow1" x-bind:class="advancedDlgIsOpen?'active':''" click.outside="if (advancedDlgIsOpenedAt != 0 && Date.now() > advancedDlgIsOpenedAt + 500) advancedDlgIsOpen = false">
                    <div class="row right-align">
                        <button class="transparent circle large" @click="advancedDlgIsOpen = !advancedDlgIsOpen;">
									<i>close</i>
						</button>
                    </div>

                    <article class="border margin yellow2">
                        <h4>Options</h4>
                        <nav class="tiny-margin">
                            <div class="max">
                                <div>Save Settings Automatically in Browser</div>
                            </div>
                            <label class="switch icon">
                                <input type="checkbox" x-model="saveSettingsInBrowser" @change='fireEvent(startDateInput);'>
                                <span><i>Save</i></span>
                            </label>
                        </nav>

                        <div class="divider"></div>
                        <nav class="tiny-margin">
                            <div class="max">
                                <div>Show Tithi Details</div>
                            </div>
                            <label class="switch icon">
                                <input type="checkbox" x-model="showTithiDetails" @change='fireEvent(startDateInput);'>
                                <span><i>dark_mode</i></span>
                            </label>
                        </nav>
                    </article>

                    <div class="field label suffix border margin">
                        <select x-model="selectedDayStart" @change='fireEvent(startDateInput);'>
                            <template x-for="d in dayStartList">
                                <option x-text="d" :selected="d == selectedDayStart"></option>
                            </template>
                        </select>
                        <label>Day Start - Affects Fasting Date</label>
                        <i>arrow_drop_down</i>
                    </div>

                    <article class="border margin yellow2">
                        <h4>Calendars</h4>
                        <details>
                            <summary><i>info</i></summary>
                            <p>
                                Activate a calendar below so that you can add fasting dates to that calendar.
                                Adding to the different calendars may or may unfortunately not work depending on your device.
                                Please try different devices and browsers to find out which is best suitable for adding the fasting dates to your calendar.
                            </p>
                            <p>
                                If you want your calendar to notify you about the fasting at a specific time, turn off "Fasting Day as All Day Event".
                                You can then set the start time and duration of the event.
                                For example, in Google Calendar, you can set up default notification times one day, and two days, before the event.
                                In that case you will be notified the time you set as the start of the event, one day, and two days, before the fasting day.
                                The notification is set to your device's time zone, not the selected time zone for the displayed fasting dates.
                                For Microsoft calendars make sure to set your desired time zone in calendar settings
                                (<a class="yellow10-text" rel="nofollow noopener" href="https://outlook.live.com/calendar/0/options/calendar/view">outlook calendar settings</a>)
                            </p>
                        </details>

                        <nav class="tiny-margin">
                            <div class="max">
                                <div>Fasting Day as All Day Event</div>
                            </div>
                            <label class="switch icon">
                                <input type="checkbox" x-model="fastingDayAsAllDayEvent" @change='fireEvent(startDateInput);'>
                                <span><i>sunny</i></i></span>
                            </label>
                        </nav>

                        <template x-if="!fastingDayAsAllDayEvent">
                            <article class="border margin yellow2">
                                <div class="field label prefix border">
                                    <i>schedule</i>
                                    <input class="active" type="time" step="300" x-model="fastingEventStartTime" @change='fireEvent(startDateInput);'>
                                    <label class="active">Event Start Time</label>
                                </div>
                                <!--
                                <div class="field label border">
                                    <input class="active" type="number" x-model="fastingEventDuration" @change='fireEvent(startDateInput);'>
                                    <label class="active">Event Duration in Minutes</label>
                                </div>
                                -->
                                <div class="field middle-align">
                                <label class="slider">
                                <input type="range" x-model="fastingEventDuration" min="1" max="1440" @change='fireEvent(startDateInput);'>
                                <span></span>
                                </label>
                                <span class="helper" x-text="'Event Duration: ' + fastingEventDuration + ' minutes'"></span>
                                </div>
                            </article>
                        </template>

                        <div class="divider"></div>
                        <nav class="tiny-margin">
                            <div class="max">
                                <div>Google Calendar</div>
                            </div>
                            <label class="switch icon">
                                <input type="checkbox" x-model="showGoogleCalendar" @change='fireEvent(startDateInput);'>
                                <span><i><img src="media/external/google-calendar-icon.webp"></i></i></span>
                            </label>
                        </nav>

                        <div class="divider"></div>
                        <nav class="tiny-margin">
                            <div class="max">
                                <div>Outlook Calendar</div>
                            </div>
                            <label class="switch icon">
                                <input type="checkbox" x-model="showOutlookCalendar" @change='fireEvent(startDateInput);'>
                                <span><i><img src="media/external/ms-outlook-icon.webp"></i></span>
                            </label>
                        </nav>

                        <div class="divider"></div>
                        <nav class="tiny-margin">
                            <div class="max">
                                <div>Office 365 Calendar</div>
                            </div>
                            <label class="switch icon">
                                <input type="checkbox" x-model="showOffice365Calendar" @change='fireEvent(startDateInput);'>
                                <span><i><img src="media/external/ms-office-365-icon.webp"></i></span>
                            </label>
                        </nav>

                        <div class="divider"></div>
                        <nav class="tiny-margin">
                            <div class="max">
                                <div>Android Calendar</div>
                            </div>
                            <label class="switch icon">
                                <input type="checkbox" x-model="showAndroidCalendar" @change='fireEvent(startDateInput);'>
                                <span><i><img src="media/external/Android_robot.svg.png"></i></span>
                            </label>
                        </nav>

                        <div class="divider"></div>
                        <nav class="tiny-margin">
                            <div class="max">
                                <div>iOS Calendar</div>
                            </div>
                            <label class="switch icon">
                                <input type="checkbox" x-model="showiOSCalendar" @change='fireEvent(startDateInput);'>
                                <span><i><img src="media/external/iOS-Logo-2017-500x333.jpg"></i></span>
                            </label>
                        </nav>
                    </article>

                    <article class="border margin yellow2">
                        <h4>Language for Displaying Date and Time</h4>
                        <details>
                            <summary><i>info</i></summary>
                            <p>
                                Select a language for displaying date and time.
                                If you don't find your language in the dropdown you can type in a language code from
                                <a class="yellow10-text" href="https://en.wikipedia.org/wiki/List_of_ISO_639_language_codes" target="_blank" rel="nofollow noopener">here</a>,
                                into the "Language Code" field.
                            </p>
                        </details>
                        <div class="field label suffix border margin">
                            <select x-model="selectedLocale" @change='fireEvent(startDateInput);'>
                                <template x-for="loc in localeList">
                                    <option x-text="loc" :selected="loc == selectedLocale"></option>
                                </template>
                                <option :selected="!localeList.includes(selectedLocale)" disabled>Custom</option>
                            </select>
                            <label>Selected Language Code</label>
                            <i>arrow_drop_down</i>
                        </div>
                        <div class="field label border margin">
                            <input type="text" class="active" x-model="selectedLocale" @change='fireEvent(startDateInput);'>
                            <label class="active">Language Code</label>
                        </div>
                    </article>


                    <article class="border margin yellow2">
                        <h4>Time Zone</h4>
                        <details>
                            <summary><i>info</i></summary>
                            <p>
                                Select the time zone for fasting day calculations below.
                                For correct calculations, make sure to select a time zone that matches the location below.
                                The default time zone is India Standard Time (Asia/Kolkata), because that's how the tithis are presented on Ananda Marga's official websites.
                                See the <a class="yellow10-text" href="science.html">Science</a> page for more information on how the calculation is done.
                            </p>
                            <p>Click a button below to select a time zone, or choose one from the list below.</p>
                        </details>
                        <button class="yellow10 tiny-margin responsive" x-init="tz = Intl.DateTimeFormat().resolvedOptions().timeZone" @click=' selectedTimeZone = tz; fireEvent(startDateInput);' x-text="'Local Time Zone: ' + tz"></button><br>
                        <button class="yellow10 tiny-margin responsive" @click='selectedTimeZone = "UTC"; fireEvent(startDateInput);'>UTC Time Zone</button><br>
                        <button class="yellow10 tiny-margin responsive" @click='selectedTimeZone = varanasiTimeZone; fireEvent(startDateInput);' x-text="'Varanasi Time Zone: ' + varanasiTimeZone + ' (Default)'"></button>

                        <div class="field label suffix border margin">
                            <select x-model="selectedTimeZone" @change='fireEvent(startDateInput);'>
                                <template x-for="tz in timeZoneList">
                                    <option x-text="tz" :selected="tz == selectedTimeZone"></option>
                                </template>
                            </select>
                            <label>Selected Time Zone</label>
                            <i>arrow_drop_down</i>
                        </div>
                    </article>

                    <article class="border margin yellow2">
                        <h4>Location</h4>
                        <details>
                            <summary><i>info</i></summary>
                            <p>
                                Select the location for fasting day calculations below.
                                For correct calculations, make sure to use a time zone above that matches the selected location.
                                The default location is Varanasi, because that's how the tithis are presented on Ananda Marga's official websites.
                                See the <a class="yellow10-text" href="science.html">Science</a> page for more information on how the calculation is done.
                            </p>
                            <p>Click a button below to select a location, or enter the values manually.</p>
                        </details>

                        <!--
                        <div class="field label suffix border margin">
                            <select>
                                <template x-for="city in worldCities">
                                    <option x-text="city.City" :selected="false"></option>
                                </template>
                            </select>
                            <label>City</label>
                            <i>arrow_drop_down</i>
                        </div>
                        -->

                        <button class="yellow10 tiny-margin responsive" @click='getMyLocation();'>Get My Location</button><br>
                        <button class="yellow10 tiny-margin responsive" @click='
                                        latitude = varanasiCoords.latitude;
                                        longitude = varanasiCoords.longitude;
                                        elevation = varanasiCoords.elevation;
                                        aboveGround = varanasiCoords.aboveGround;
                                        myCurrentLocationSelected = false;
                                        fireEvent(startDateInput);
                            '>Get Varanasi Location (Default)</button><br>


                        <div class="field label border margin">
                            <input type="text" class="active" x-model="latitude" @change='myCurrentLocationSelected = false; fireEvent(startDateInput);'>
                            <label class="active">Latitude</label>
                        </div>

                        <div class="field label border margin">
                            <input type="text" class="active" x-model="longitude" @change='myCurrentLocationSelected = false; fireEvent(startDateInput);'>
                            <label class="active">Longitude</label>
                        </div>

                        <div class="field label border margin">
                            <input type="text" class="active" x-model="elevation" @change='fireEvent(startDateInput);'>
                            <label class="active">Elevation (meters)</label>
                        </div>

                        <template x-if="selectedDayStart == dayStartList[1]">
                            <div class="field label border margin">
                                <input type="text" class="active" x-model="aboveGround" @change='fireEvent(startDateInput);'>
                                <label class="active">Above Ground (meters)</label>
                            </div>
                        </template>
                    </article>
                    
                    <article class="border margin yellow2">
                        <h4>Test Data</h4>
                        <p>Click the button below to compare this calculator's fasting dates with the official dates of 2024</p>
                        <button class="yellow10 responsive" @click='
                            startDateInput.value="2024-01-01";
                            endDateInput.value="2024-12-31";
                            showTithiDetails = true;
                            showTestDataAccuracy = true;
                            advancedDlgIsOpen = false;
                            fireEvent(startDateInput);'>Compare</button>
                    </article>
                </dialog>
`}

