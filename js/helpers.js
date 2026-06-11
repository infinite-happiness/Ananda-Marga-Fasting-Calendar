// Generic helpers for exporting tithi/fasting rows to ICS, CSV, TSV, and clipboard.
// Depends on luxon (DateTime) being available globally.

let DateTime = luxon.DateTime;
let Interval = luxon.Interval;

const icsEscape = t => String(t).replace(/\\/g, '\\\\').replace(/;/g, '\\;').replace(/,/g, '\\,').replace(/\n/g, '\\n');
const csvEscape = f => /[",\n]/.test(f = String(f)) ? '"' + f.replace(/"/g, '""') + '"' : f;
const tsvEscape = f => String(f).replace(/\t/g, ' ').replace(/\n/g, ' ');

// Build description exactly like the Tithi Details in index.html
function buildDescription(row) {
    if (!row.tithi || !row.start || !row.end || !row.sunrise) {
        return "Ananda Marga Upavasa Fasting Day";
    }

    let desc = [];

    // Tithi starts
    desc.push(`${row.tithi.name} starts: ${row.start.toLocaleString(DateTime.DATETIME_HUGE)}`);

    // Time until sunrise
    if (row.start && row.sunrise) {
        const toSunrise = Interval.fromDateTimes(row.start, row.sunrise)
            .toDuration(['hours', 'minutes', 'seconds']).toFormat("h'h' m'm' s's'");
        desc.push(`Then: ${toSunrise} until...`);
    }

    // Sunrise
    desc.push(`Sunrise: ${row.sunrise.toLocaleString(DateTime.DATETIME_HUGE)}`);
    desc.push(`Sunrise type: ${row.sunriseType || 'Civil Dawn 6°'}`);

    // Time until tithi ends
    if (row.sunrise && row.end) {
        const afterSunrise = Interval.fromDateTimes(row.sunrise, row.end)
            .toDuration(['hours', 'minutes', 'seconds']).toFormat("h'h' m'm' s's'");
        desc.push(`Then: ${afterSunrise} until...`);
    }

    // Tithi ends
    desc.push(`${row.tithi.name} ends: ${row.end.toLocaleString(DateTime.DATETIME_HUGE)}`);

    // Add 1st Night info if applicable
    if (row.firstNightDTTZ) {
        desc.push(`\n1st Night of Amavasya: ${row.firstNightDTTZ.toLocaleString(DateTime.DATE_HUGE)}`);
    }

    return desc.join('\n');
}

// Flatten tithi rows into export rows
function buildExportRows(rows) {
    let exportRows = [];

    rows.forEach(row => {
        if (row.firstNightDTTZ) return; // skip placeholder

        const mainDesc = buildDescription(row);

        exportRows.push({
            name: row.tithi.name,
            dateTime: row.fastingDTTZ,
            description: mainDesc,
            excluded: false
        });

        // Add 1st Night for Amavasya
        if (row.tithi.asciiName === 'Amavasya' &&
            row.start?.endOf('day').plus({ days: 1 }).ts === row.end?.endOf('day').ts) {

            const firstNightDesc = buildDescription(row)
                .replace(`${row.tithi.name} starts:`, `1st Night of Amavasya`);

            exportRows.push({
                name: '1st Night',
                dateTime: row.fastingDTTZ.minus({ days: 1 }),
                description: firstNightDesc,
                excluded: false
            });
        }
    });

    return exportRows.sort((a, b) => a.dateTime.toMillis() - b.dateTime.toMillis());
}

// Generate ICS
function generateICS(exportRows, { selectedTimeZone, fastingDayAsAllDayEvent, fastingEventStartTime, fastingEventDuration }) {
    let ics = [
        'BEGIN:VCALENDAR',
        'VERSION:2.0',
        'PRODID:-//Ananda Marga Fasting Calendar//EN',
        'CALSCALE:GREGORIAN',
        'METHOD:PUBLISH',
        'X-WR-CALNAME:Ananda Marga Fasting Days',
        'X-WR-TIMEZONE:' + selectedTimeZone
    ];

    const seen = new Set();

    exportRows.forEach(row => {
        if (row.excluded || !row.dateTime) return;

        const dateKey = row.dateTime.toFormat('yyyy-MM-dd') + '|' + row.name;
        if (seen.has(dateKey)) return;
        seen.add(dateKey);

        const isFirstNight = row.name === '1st Night';
        const uid = `am-fasting-${row.dateTime.toFormat('yyyy-MM-dd')}${isFirstNight ? '-firstnight' : ''}-${Math.random().toString(36).substring(2, 8)}@infinite-happiness.github.io`;
        const dtstamp = DateTime.utc().toFormat("yyyyMMdd'T'HHmmss'Z'");

        const summary = icsEscape(row.name);
        const description = icsEscape(row.description || "Ananda Marga Upavasa Fasting Day");

        if (fastingDayAsAllDayEvent) {
            ics.push(
                'BEGIN:VEVENT', `UID:${uid}`, `DTSTAMP:${dtstamp}`,
                `DTSTART;VALUE=DATE:${row.dateTime.toFormat("yyyyMMdd")}`,
                `DTEND;VALUE=DATE:${row.dateTime.plus({ days: 1 }).toFormat("yyyyMMdd")}`,
                `SUMMARY:${summary}`,
                `DESCRIPTION:${description}`,
                'END:VEVENT'
            );
        } else {
            const start = DateTime.fromFormat(fastingEventStartTime, 'HH:mm')
                .setZone(selectedTimeZone)
                .set({ year: row.dateTime.year, month: row.dateTime.month, day: row.dateTime.day });

            const end = start.plus({ minutes: fastingEventDuration });

            ics.push(
                'BEGIN:VEVENT', `UID:${uid}`, `DTSTAMP:${dtstamp}`,
                `DTSTART;TZID=${selectedTimeZone}:${start.toFormat("yyyyMMdd'T'HHmmss")}`,
                `DTEND;TZID=${selectedTimeZone}:${end.toFormat("yyyyMMdd'T'HHmmss")}`,
                `SUMMARY:${summary}`,
                `DESCRIPTION:${description}`,
                'END:VEVENT'
            );
        }
    });

    ics.push('END:VCALENDAR');
    return ics.join('\r\n');
}

// Generate CSV/TSV with Description
function generateDelimited(exportRows, selectedLocale, delimiter, escapeFn) {
    let lines = [['Name', 'Date', 'Description'].map(escapeFn).join(delimiter)];

    exportRows.forEach(row => {
        if (row.excluded) return;

        const dt = row.dateTime.setLocale(selectedLocale);

        lines.push([
            row.name,
            dt.toFormat('yyyy-MM-dd'),
            row.description || ''
        ].map(escapeFn).join(delimiter));
    });

    return lines.join('\r\n');
}

const generateCSV = (rows, locale) => generateDelimited(rows, locale, ',', csvEscape);
const generateTSV = (rows, locale) => generateDelimited(rows, locale, '\t', tsvEscape);

function downloadTextFile(content, filename, mimeType) {
    const blob = new Blob([content], { type: mimeType + ';charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
}

async function copyToClipboard(text) {
    if (navigator.clipboard && window.isSecureContext) {
        return navigator.clipboard.writeText(text);
    }
    const textarea = document.createElement('textarea');
    textarea.value = text;
    textarea.style.cssText = 'position:fixed;opacity:0';
    document.body.appendChild(textarea);
    textarea.focus();
    textarea.select();
    try { document.execCommand('copy'); } finally { document.body.removeChild(textarea); }
}

const buildExportFilename = (start, end, ext) =>
    `Ananda_Marga_Fasting_${start.toFormat('yyyy-MM-dd')}_to_${end.toFormat('yyyy-MM-dd')}.${ext}`;

// Alpine exporter component (unchanged except using new buildDescription)
function exporter() {
    let localeList = ['en-US', 'en-UK', 'en-IN'];
    let userLanguage = navigator.userLanguage || (navigator.languages && navigator.languages[0]) || navigator.language || navigator.browserLanguage || navigator.systemLanguage;
    if (userLanguage && !localeList.includes(userLanguage)) localeList.push(userLanguage);

    let timeZoneList = Intl.supportedValuesOf ? Intl.supportedValuesOf('timeZone') : [Intl.DateTimeFormat().resolvedOptions().timeZone];
    timeZoneList.push('UTC');
    let varanasiTimeZone = timeZoneList.includes("Asia/Kolkata") ? "Asia/Kolkata" : "Asia/Calcutta";
    let varanasiCoords = { latitude: 25.318889, longitude: 83.012778, elevation: 80.71, aboveGround: 1 };
    let dayStartList = ["Sun at Center of Horizon 0°", "Top of the Sun Peeks above Horizon", "Civil Dawn 6°", "Nautical Dawn 12°", "Astronomical Dawn 18°"];

    let s;
    try { s = JSON.parse(localStorage.getItem('exporter')) || {}; } catch (e) { s = {}; }

    return {
        rows: [], exportRows: [], matches: 1, errors: 0, startingDate: 0, endingDate: 0,
        filters: {},

        get eventTypes() {
            let types = [];
            this.exportRows.forEach(r => { if (!types.includes(r.name)) types.push(r.name); });
            return types;
        },

        toggleFilter(type) {
            this.filters[type] = !this.filters[type];
            this.exportRows.forEach(r => { if (r.name === type) r.excluded = !!this.filters[type]; });
        },

        fastingEventDuration: s.fastingEventDuration ?? 60,
        fastingEventStartTime: s.fastingEventStartTime ?? '09:00',
        localeList, selectedLocale: s.selectedLocale || 'en-UK',
        timeZoneList, varanasiTimeZone,
        selectedTimeZone: (s.selectedTimeZone && timeZoneList.includes(s.selectedTimeZone)) ? s.selectedTimeZone : varanasiTimeZone,
        dayStartList,
        selectedDayStart: dayStartList.includes(s.selectedDayStart) ? s.selectedDayStart : dayStartList[2],
        saveSettingsInBrowser: s.saveSettingsInBrowser || false,
        fastingDayAsAllDayEvent: s.fastingDayAsAllDayEvent !== false,
        gettingLocation: false, myCurrentLocationAllowed: true, myCurrentLocationSelected: false,
        varanasiCoords,
        latitude: s.latitude ?? varanasiCoords.latitude,
        longitude: s.longitude ?? varanasiCoords.longitude,
        elevation: s.elevation ?? varanasiCoords.elevation,
        aboveGround: s.aboveGround ?? varanasiCoords.aboveGround,
        copyStatus: '',

        update(startDate, endDate) {
            let result = tithi.calculateTithis(this.selectedLocale, this.selectedTimeZone, this.selectedDayStart, this.dayStartList, startDate, endDate, parseFloat(this.latitude), parseFloat(this.longitude), parseFloat(this.elevation), parseFloat(this.aboveGround), { dates: [] });
            this.rows = result.rows;
            this.matches = result.matches;
            this.errors = result.errors;
            this.startingDate = DateTime.fromISO(startDate).setLocale(this.selectedLocale);
            this.endingDate = DateTime.fromISO(endDate).setLocale(this.selectedLocale);

            this.$refs.start_date.value = this.startingDate.toISODate();
            this.$refs.end_date.value = this.endingDate.toISODate();

            let prevExcluded = {};
            this.exportRows.forEach(r => prevExcluded[r.dateTime.toISO() + '|' + r.name] = r.excluded);

            this.exportRows = buildExportRows(this.rows).map(r => {
                let key = r.dateTime.toISO() + '|' + r.name;
                if (key in prevExcluded) r.excluded = prevExcluded[key];
                if (this.filters[r.name]) r.excluded = true;
                return r;
            });

            this.saveSettings();
        },

        saveSettings() {
            let s = {};
            if (this.saveSettingsInBrowser) {
                s = {
                    saveSettingsInBrowser: true,
                    fastingEventDuration: this.fastingEventDuration,
                    fastingEventStartTime: this.fastingEventStartTime,
                    fastingDayAsAllDayEvent: this.fastingDayAsAllDayEvent,
                    selectedLocale: this.selectedLocale,
                    selectedTimeZone: this.selectedTimeZone,
                    selectedDayStart: this.selectedDayStart,
                    latitude: this.latitude, longitude: this.longitude,
                    elevation: this.elevation, aboveGround: this.aboveGround,
                };
            }
            localStorage.setItem('exporter', JSON.stringify(s));
        },

        myCurrentTimezoneSelected() { return this.selectedTimeZone == Intl.DateTimeFormat().resolvedOptions().timeZone; },
        getMyTimeZone() { this.selectedTimeZone = Intl.DateTimeFormat().resolvedOptions().timeZone; },

        getMyLocation(getMyTimeZoneIfSucceed = false) {
            let ctx = this;
            this.gettingLocation = true;
            if (!navigator.geolocation) return;
            setTimeout(() => navigator.geolocation.getCurrentPosition(
                (position) => {
                    ctx.latitude = position.coords.latitude;
                    ctx.longitude = position.coords.longitude;
                    ctx.elevation = position.coords.altitude || 0;
                    ctx.myCurrentLocationSelected = true;
                    ctx.gettingLocation = false;
                    if (getMyTimeZoneIfSucceed) ctx.getMyTimeZone();
                    fireEvent(startDateInput);
                },
                () => {
                    ctx.gettingLocation = false;
                    ctx.myCurrentLocationAllowed = false;
                    fireEvent(startDateInput);
                }
            ), 0);
        },

        get includedExportRows() { return this.exportRows.filter(r => !r.excluded); },

        showCopyStatus(message) {
            this.copyStatus = message;
            setTimeout(() => { this.copyStatus = ''; }, 3000);
        },

        doExport(format) {
            const rows = this.includedExportRows;
            if (rows.length === 0) { alert("No dates selected for export."); return; }
            
            const filename = ext => buildExportFilename(this.startingDate, this.endingDate, ext);
            const settings = { 
                selectedTimeZone: this.selectedTimeZone, 
                fastingDayAsAllDayEvent: this.fastingDayAsAllDayEvent, 
                fastingEventStartTime: this.fastingEventStartTime, 
                fastingEventDuration: this.fastingEventDuration 
            };

            switch (format) {
                case 'ics':
                    downloadTextFile(generateICS(rows, settings), filename('ics'), 'text/calendar');
                    break;
                case 'csv':
                    downloadTextFile(generateCSV(rows, this.selectedLocale), filename('csv'), 'text/csv');
                    break;
                case 'tsv':
                    downloadTextFile(generateTSV(rows, this.selectedLocale), filename('tsv'), 'text/tab-separated-values');
                    break;
                case 'copy-csv':
                    copyToClipboard(generateCSV(rows, this.selectedLocale)).then(() => this.showCopyStatus('CSV copied!'));
                    break;
                case 'copy-tsv':
                    copyToClipboard(generateTSV(rows, this.selectedLocale)).then(() => this.showCopyStatus('TSV copied!'));
                    break;
                case 'copy-excel':
                    copyToClipboard(generateTSV(rows, this.selectedLocale)).then(() => this.showCopyStatus('Copied for Excel!'));
                    break;
            }
        }
    }
}