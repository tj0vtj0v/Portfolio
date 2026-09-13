import {Component} from '@angular/core';

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
    const recentMonths = end - 2022 * 12;
    // Keep the older school period compressed while the endpoint rolls forward.
    const distance = elapsed <= recentMonths ? elapsed * 16 : recentMonths * 16 + (elapsed - recentMonths) * 2;
    return distance / (recentMonths * 16 + 88 * 2) * 1164;
}

@Component({selector: 'app-career-timeline', templateUrl: './career-timeline.component.html', styleUrl: './career-timeline.component.css'})
export class CareerTimelineComponent {
    private readonly end = displayEnd();
    protected readonly years = Array.from({length: Math.floor(this.end / 12) - 2014}, (_, index) => Math.floor(this.end / 12) - index)
        .map(year => ({label: String(year), top: timelinePosition(`${year}-01`, this.end)}));
    protected readonly history = [
        {side: 'work', start: '2025-05', end: '2026-09', dates: 'May 2025 – completed', title: 'Student research assistant', place: 'Deggendorf Institute of Technology', detail: 'Multispectral aerial mapping pipeline.', top: 0, lane: 1, color: 'var(--color-chart-2)'},
        {side: 'education', start: '2023-10', end: '', dates: 'Oct 2023 – ongoing', title: 'B.Sc. Artificial Intelligence', place: 'Deggendorf Institute of Technology', detail: 'Degree combined with vocational training.', top: 165, lane: 1, color: 'var(--color-chart-1)'},
        {side: 'work', start: '2024-04', end: '', dates: 'Apr 2024 – ongoing', title: 'Driverless development', place: 'Fast Forest · Formula Student', detail: 'Camera perception, Graph SLAM, and technical guidance for LiDAR perception.', top: 340, lane: 2, color: 'var(--color-chart-3)'},
        {side: 'education', start: '2022-09', end: '2026-02', dates: 'Sep 2022 – Feb 2026', title: 'Vocational training · IT specialist', place: 'Lower Bavaria Chamber of Industry and Commerce', detail: 'Specialisation in software development; completed alongside the degree programme.', top: 520, lane: 2, color: 'var(--color-chart-4)'},
        {side: 'work', start: '2022-09', end: '', dates: 'Sep 2022 – ongoing', title: 'Dual study programme', place: 'BMW Group · Dingolfing', detail: 'Digital apprenticeship demand planning and a retrieval-augmented system for lessons learned.', top: 720, lane: 3, color: 'var(--color-chart-6)'},
        {side: 'education', start: '2014-09', end: '2022-07', dates: 'Sep 2014 – Jul 2022', title: 'University entrance qualification', place: 'Fürstenberg Gymnasium · Donaueschingen', detail: 'General secondary education.', top: 950, lane: 3, color: 'var(--color-chart-5)'}
    ].map(item => ({...item, from: item.end ? timelinePosition(item.end, this.end) : 0, duration: timelinePosition(item.start, this.end) - (item.end ? timelinePosition(item.end, this.end) : 0)}));
}
