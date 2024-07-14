
document.addEventListener('DOMContentLoaded', function () {
    document.getElementById('calculator_advanced').innerHTML = layout.calculator_advanced();
}, false);

layout.calculator_advanced = function () {
    return `
                <article x-show="showTestDataErrors">
                    <div class="row right-align">
                        <button class="transparent circle large" @click="showTestDataErrors = false">
									<i>close</i>
						</button>
                    </div>

                    <h6>Comparison with Official Fasting Days 2024</h6>
                    <p>Matches: <span x-text=" matches"></span></p>
                    <p>Errors: <span x-text="errors"></span></p>
                    <p>Accuracy: <span x-text="(100*matches/(errors+matches)).toFixed(2) + '%'"></span></p>
                </article>

				<dialog class="left yellow1" x-bind:class="advancedDlgIsOpen?'active':''" @click.outside="if (advancedDlgIsOpenedAt != 0 && Date.now() > advancedDlgIsOpenedAt + 500) advancedDlgIsOpen = false">
                    <div class="row right-align">
                        <button class="transparent circle large" @click="advancedDlgIsOpen = !advancedDlgIsOpen;">
									<i>close</i>
						</button>
                    </div>

                    <button class="yellow10 margin" x-init="tz = Intl.DateTimeFormat().resolvedOptions().timeZone" @click='
                        selectedTimeZone = tz;
                            fireEvent(startDateInput);' x-text="'Select local time zone: ' + tz"></button><br>

                    <button class="yellow10 margin ee" @click='
                        selectedTimeZone = "UTC";
                            fireEvent(startDateInput);'>Select UTC as time zone</button><br>

                    <button class="yellow10 margin ee" @click='
                        selectedTimeZone = varanasiTimeZone;
                            fireEvent(startDateInput);' x-text="'Select Varanasi time zone: ' + varanasiTimeZone"></button>


                    <div class="field label suffix border margin">
                        <select x-model="selectedTimeZone">
                            <template x-for="tz in timeZoneList">
                                <option x-text="tz" :selected="tz == selectedTimeZone"></option>
                            </template>
                        </select>
                        <label>Selected Time Zone</label>
                        <i>arrow_drop_down</i>
                    </div>

                    <div class="field label suffix border margin">
                        <select x-model="selectedDayStart">
                            <template x-for="d in dayStartList">
                                <option x-text="d" :selected="d == selectedDayStart"></option>
                            </template>
                        </select>
                        <label>Day Start</label>
                        <i>arrow_drop_down</i>
                    </div>

                    <div class="field middle-align">
                        <nav>
                            <div class="max">
                            <div>Show Tithi Details</div>
                            </div>
                            <label class="switch icon">
                            <input type="checkbox" x-model="showTithiDetails">
                            <span><i>dark_mode</i></span>
                            </label>
                        </nav>
                    </div>

                    <article class="border margin">
                        <h5>Location</h5>

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

                        <button class="yellow10 margin" @click='
                            if (navigator.geolocation) {
                                navigator.geolocation.getCurrentPosition(
                                    // show position
                                    (position)=>{
                                        console.log("Got my position:", position);
                                        latitude = position.coords.latitude;
                                        longitude = position.coords.longitude;
                                        elevation = position.coords.altitude || 0;
                                    },
                                    // error
                                    ()=>{}
                                );
                            }
                                fireEvent(startDateInput);'>Get My Location</button>

                        <div class="field label border margin">
                            <input type="text" class="active" x-model="latitude">
                            <label class="active">Latitude</label>
                        </div>

                        <div class="field label border margin">
                            <input type="text" class="active" x-model="longitude">
                            <label class="active">Longitude</label>
                        </div>

                        <div class="field label border margin">
                            <input type="text" class="active" x-model="elevation">
                            <label class="active">Elevation (meters)</label>
                        </div>

                        <div class="field label border margin">
                            <input type="text" class="active" x-model="aboveGround">
                            <label class="active">Above Ground (meters)</label>
                            <span class="helper">Do not use 0 meters above ground!</span>
                        </div>
                    </article>
                    
                    <article class="border margin">
                        <h5>Test Data</h5>
                        <p>Click the button below to compare this calculator's fasting dates with the official dates of 2024</p>
                        <button class="yellow10" @click='
                            startDateInput.value="2024-01-01";
                            endDateInput.value="2024-12-31";
                            showTithiDetails = true;
                            showTestDataErrors = true;
                            advancedDlgIsOpen = false;
                            fireEvent(startDateInput);'>Compare</button>
                    </article>

                </dialog>
`}

