import {Component} from '@angular/core';
import {RouterLink, RouterLinkActive, RouterOutlet} from '@angular/router';

@Component({
    selector: 'app-fuel',
    imports: [RouterLink, RouterLinkActive, RouterOutlet],
    templateUrl: './fuel.component.html',
    styleUrl: './fuel.component.css'
})
export class FuelComponent {}
