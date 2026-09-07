import {Component} from '@angular/core';
import {RouterLink, RouterLinkActive, RouterOutlet} from '@angular/router';

@Component({
    selector: 'app-accounting',
    imports: [RouterLink, RouterLinkActive, RouterOutlet],
    templateUrl: './accounting.component.html',
    styleUrl: './accounting.component.css'
})
export class AccountingComponent {}
