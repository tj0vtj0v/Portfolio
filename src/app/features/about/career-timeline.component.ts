import {Component} from '@angular/core';

type TimelineSide = 'work' | 'education';

type TimelineEntry = {
    side: TimelineSide;
    start: string;
    end: string;
    dates: string;
    title: string;
    place: string;
    detail: string;
    order: number;
    lane: number;
    color: string;
};

type PositionedTimelineEntry = TimelineEntry & {
    top: number;
    from: number;
    duration: number;
};

const RECENT_START = 2022;
const RECENT_MONTH_HEIGHT = 16;
const OLDER_MONTH_HEIGHT = 2;
const ENTRY_SLOT_HEIGHT = 200;
const TIMELINE_BOTTOM_PADDING = 64;

function monthPosition(date: Date): number {
    return date.getFullYear() * 12 + date.getMonth() + (date.getDate() - 1) / new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();
}

function displayEnd(): number {
    const today = new Date();
    const end = new Date(today.getFullYear(), today.getMonth() + 6, 1);
    end.setDate(Math.min(today.getDate(), new Date(end.getFullYear(), end.getMonth() + 1, 0).getDate()));
    return monthPosition(end);
}

export function timelinePosition(date: string, end = displayEnd()): number {
    const [year, month] = date.split('-').map(Number);
    const elapsed = end - (year * 12 + month - 1);
    const recentMonths = end - RECENT_START * 12;
    // Keep older school years compressed while the endpoint rolls forward.
    const distance = elapsed <= recentMonths
        ? elapsed * RECENT_MONTH_HEIGHT
        : recentMonths * RECENT_MONTH_HEIGHT + (elapsed - recentMonths) * OLDER_MONTH_HEIGHT;
    return Math.max(0, distance);
}

function yearOf(date: string): number {
    return Number(date.slice(0, 4));
}

function positionEntries(entries: TimelineEntry[], end: number): PositionedTimelineEntry[] {
    // Reference geometry for the approved arrangement on 28 September 2026.
    // Only the offsets are fixed; the live axis still ends at today + six months.
    const referenceEnd = monthPosition(new Date(2027, 2, 28));
    const positions: Record<TimelineSide, number[]> = {
        work: [0, 240, 720],
        education: [165, 520, 950]
    };

    return entries.map(item => {
        const from = item.end ? timelinePosition(item.end, end) : 0;
        const referenceFrom = item.end ? timelinePosition(item.end, referenceEnd) : 0;
        const offsetFromBar = positions[item.side][item.order] - referenceFrom;
        return {
            ...item,
            top: Math.max(0, from + offsetFromBar),
            from,
            duration: timelinePosition(item.start, end) - from
        };
    });
}

function buildYears(entries: TimelineEntry[], end: number): {label: string; top: number}[] {
    const firstYear = Math.min(...entries.map(item => yearOf(item.start)));
    const lastYear = Math.floor(end / 12);
    return Array.from({length: lastYear - firstYear + 1}, (_, index) => lastYear - index)
        .map(year => ({label: String(year), top: timelinePosition(`${year}-01`, end)}));
}

function calculateTimelineHeight(entries: PositionedTimelineEntry[], end: number): number {
    const firstYear = Math.min(...entries.map(item => yearOf(item.start)));
    const oldestMarker = timelinePosition(`${firstYear}-01`, end);
    const lowestCard = Math.max(...entries.map(item => item.top + ENTRY_SLOT_HEIGHT));
    return Math.ceil(Math.max(oldestMarker, lowestCard) + TIMELINE_BOTTOM_PADDING);
}

@Component({selector: 'app-career-timeline', templateUrl: './career-timeline.component.html', styleUrl: './career-timeline.component.css'})
export class CareerTimelineComponent {
    private readonly end = displayEnd();
    private readonly entries: TimelineEntry[] = [
        {side: 'work', start: '2024-04', end: '', dates: 'Apr 2024 – now', title: 'Driverless development', place: 'Fast Forest - Formula Student', detail: 'Camera perception, sensor fusion, and Graph SLAM.', order: 0, lane: 2, color: 'var(--color-chart-3)'},
        {side: 'work', start: '2025-05', end: '2026-07', dates: 'May 2025 – Jul 2026', title: 'Student assistant', place: 'Deggendorf Institute of Technology', detail: 'Multispectral aerial mapping pipeline.', order: 1, lane: 1, color: 'var(--color-chart-2)'},
        {side: 'work', start: '2022-09', end: '2027-03', dates: 'Sep 2022 – Mar 2027', title: 'Dual study programme', place: 'BMW Group Dingolfing', detail: 'Digitalization in quality management for parts.', order: 2, lane: 3, color: 'var(--color-chart-6)'},
        {side: 'education', start: '2023-10', end: '2027-03', dates: 'Oct 2023 – Mar 2027', title: 'B.Sc. Artificial Intelligence', place: 'Deggendorf Institute of Technology', detail: 'Degree combined with vocational training.', order: 0, lane: 1, color: 'var(--color-chart-1)'},
        {side: 'education', start: '2022-09', end: '2026-02', dates: 'Sep 2022 – Feb 2026', title: 'Vocational training IT specialist', place: 'Lower Bavaria Chamber of Industry and Commerce', detail: 'Specialisation in software development. Completed alongside the degree programme.', order: 1, lane: 2, color: 'var(--color-chart-4)'},
        {side: 'education', start: '2014-09', end: '2022-07', dates: 'Sep 2014 – Jul 2022', title: 'High school diploma', place: 'Fürstenberg Gymnasium Donaueschingen', detail: 'General secondary education.', order: 2, lane: 3, color: 'var(--color-chart-5)'}
    ];
    protected readonly history = positionEntries(this.entries, this.end);
    protected readonly years = buildYears(this.entries, this.end);
    protected readonly timelineHeight = calculateTimelineHeight(this.history, this.end);
    protected readonly axisHeight = this.timelineHeight;
}
