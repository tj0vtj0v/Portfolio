import {Component, signal} from '@angular/core';
import {RouterLink} from '@angular/router';

@Component({selector: 'app-about', imports: [RouterLink], templateUrl: './about.component.html', styleUrls: ['../portfolio/portfolio.css', './about.component.css']})
export class AboutComponent {
    protected readonly paused = signal(false);
    protected readonly skills = ['C++', 'Python', 'TypeScript', 'Angular', 'FastAPI', 'PostgreSQL', 'Docker', 'Git', 'Computer vision', 'Graph SLAM', 'EKF', 'Photogrammetry'];
    protected readonly history = [
        {date: 'May 2025 – present', side: 'work', title: 'Student research assistant', place: 'Deggendorf Institute of Technology', detail: 'Developing a pipeline for multispectral aerial mapping.', year: '2025'},
        {date: 'April 2024 – present', side: 'work', title: 'Driverless development', place: 'Fast Forest · Formula Student', detail: 'Development, validation, and deployment of camera perception; Graph SLAM development and technical guidance for LiDAR perception.', year: '2024'},
        {date: 'October 2023 – present', side: 'education', title: 'B.Sc. Artificial Intelligence', place: 'Deggendorf Institute of Technology', detail: 'Combined degree and vocational training programme (Verbundstudium).', year: '2023'},
        {date: 'September 2022 – February 2026', side: 'education', title: 'Application development', place: 'IHK Niederbayern', detail: 'Fachinformatiker für Anwendungsentwicklung, completed as part of the combined study programme.', year: '2022'},
        {date: 'September 2022 – present', side: 'work', title: 'Dual study programme', place: 'BMW Group · Dingolfing', detail: 'Digitalising demand planning for apprenticeships and designing a retrieval-augmented generation system to derive lessons learned from 8D reports.', year: '2022'},
        {date: 'September 2014 – July 2022', side: 'education', title: 'Secondary education · Abitur', place: 'Fürstenberg Gymnasium · Donaueschingen', detail: 'General university entrance qualification.', year: '2014'}
    ];
}
