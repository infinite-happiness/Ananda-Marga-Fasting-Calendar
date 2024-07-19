
document.addEventListener('DOMContentLoaded', function () {
    document.getElementById('calculator_advanced').innerHTML = layout.calculator_advanced();
}, false);

layout.calculator_advanced = function () {
    return `
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
                                            <td><span x-text="formatDate(row.fastingDateString)"></span></td>
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
                        <h4>Language for Displaying Date and Time</h4>
                        <details>
                            <summary><i>info</i></summary>
                            <p>
                                Switch on the setting "Show Tithi Details" to see the effects of this setting.
                                If you don't find your language in the dropdown you can type in a code from this list, into the lower "Language Code" field:
                                <a href="https://en.wikipedia.org/wiki/List_of_ISO_639_language_codes" target="_blank" rel="nofollow noopener">https://en.wikipedia.org/wiki/List_of_ISO_639_language_codes</a>
                            </p>
                        </details>
                        <div class="field label suffix border margin">
                            <select x-model="selectedLocale" @change='fireEvent(startDateInput);'>
                                <template x-for="loc in localeList">
                                    <option x-text="loc" :selected="loc == selectedLocale"></option>
                                </template>
                                <option :selected="!localeList.includes(selectedLocale)">Custom</option>
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
                                This setting will only change the time zone of the displayed dates and times.
                                The fasting dates will not be affected by this setting.
                                The default time zone is India Standard Time (Asia/Kolkata), because that's how the tithis are presented on Ananda Marga's official websites.
                            </p>
                        </details>
                        <button class="yellow10 tiny-margin" x-init="tz = Intl.DateTimeFormat().resolvedOptions().timeZone" @click=' selectedTimeZone = tz; fireEvent(startDateInput);' x-text="'Local Time Zone: ' + tz"></button><br>
                        <button class="yellow10 tiny-margin" @click='selectedTimeZone = "UTC"; fireEvent(startDateInput);'>UTC Time Zone</button><br>
                        <button class="yellow10 tiny-margin" @click='selectedTimeZone = varanasiTimeZone; fireEvent(startDateInput);' x-text="'Varanasi Time Zone: ' + varanasiTimeZone + ' (Default)'"></button>

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
                                This setting will calculate the fasting date based on the location you enter.
                                See the <a href="science.html">Science</a> page for more information on how the calculation is done.
                            </p>
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

                        <button class="yellow10 tiny-margin" @click='
                            if (navigator.geolocation) {
                                navigator.geolocation.getCurrentPosition(
                                    // show position
                                    (position)=>{
                                        console.log("Got my position:", position);
                                        latitude = position.coords.latitude;
                                        longitude = position.coords.longitude;
                                        elevation = position.coords.altitude || 0;
                                        fireEvent(startDateInput); // note that this fires async, ie after position has been acquired
                                    },
                                    // error
                                    ()=>{}
                                );
                            }
                            '>Get My Location</button><br>
                        <button class="yellow10 tiny-margin" @click='
                                        latitude = varanasiCoords.latitude;
                                        longitude = varanasiCoords.longitude;
                                        elevation = varanasiCoords.elevation;
                                        aboveGround = varanasiCoords.aboveGround;
                                        fireEvent(startDateInput);
                            '>Get Varanasi Location (Default)</button><br>


                        <div class="field label border margin">
                            <input type="text" class="active" x-model="latitude" @change='fireEvent(startDateInput);'>
                            <label class="active">Latitude</label>
                        </div>

                        <div class="field label border margin">
                            <input type="text" class="active" x-model="longitude" @change='fireEvent(startDateInput);'>
                            <label class="active">Longitude</label>
                        </div>

                        <div class="field label border margin">
                            <input type="text" class="active" x-model="elevation" @change='fireEvent(startDateInput);'>
                            <label class="active">Elevation (meters)</label>
                        </div>

                        <div class="field label border margin">
                            <input type="text" class="active" x-model="aboveGround" @change='fireEvent(startDateInput);'>
                            <label class="active">Above Ground (meters)</label>
                            <span class="helper">"Above Ground" is only used when "Top of the Sun Peeks above Horizon" is the start of day.</span>
                        </div>
                    </article>
                    
                    <article class="border margin yellow2">
                        <h4>Test Data</h4>
                        <p>Click the button below to compare this calculator's fasting dates with the official dates of 2024</p>
                        <button class="yellow10" @click='
                            startDateInput.value="2024-01-01";
                            endDateInput.value="2024-12-31";
                            showTithiDetails = true;
                            showTestDataAccuracy = true;
                            advancedDlgIsOpen = false;
                            fireEvent(startDateInput);'>Compare</button>
                    </article>

                </dialog>
`}

