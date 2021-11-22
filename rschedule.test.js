require("@rschedule/luxon-date-adapter/setup");
const { VEvent } = require("@rschedule/ical-tools");
const { Settings, DateTime, Interval } = require("luxon");

const vEvent =
  "BEGIN:VEVENT\n" +
  "DTSTART;TZID=Europe/London:20210628T014500\n" +
  "DTEND;TZID=Europe/London:20210628T020000\n" +
  "RRULE:FREQ=DAILY\n" +
  "END:VEVENT";

const interval = Interval.fromISO(
  "2021-10-31T00:00:00.000+01:00/2021-10-31T23:59:59.999+00:00"
);

describe("rSchedule", () => {
  it("generates an RFC-compliant occurrence of an event in the BST->GMT boundary when generating it at a local time before the change", () => {
    Settings.now = () => new Date("2021-10-31").valueOf(); // before the GMT->DST change
    const parsed = VEvent.fromICal(vEvent)[0];

    const occurrences = parsed.occurrences(interval).toArray();
    expect(occurrences[0].date.toISO()).toEqual(
      "2021-10-31T01:45:00.000+01:00" // spec-compliant
    );
  });

  it("generates an RFC-incompliant occurrence of an event in the BST->GMT boundary when generating it at a local time after the change", () => {
    Settings.now = () => new Date("2021-11-01").valueOf(); // after the DST->GMT change
    const parsed = VEvent.fromICal(vEvent)[0];

    const occurrences = parsed.occurrences(interval).toArray();
    expect(occurrences[0].date.toISO()).toEqual(
      "2021-10-31T01:45:00.000+00:00" // incompliant: should be +01:00 offset
    );
  });
});
