import {Component} from '@angular/core';
import {RouterLink, RouterLinkActive, RouterOutlet} from '@angular/router';

@Component({
    selector: 'app-banking',
    imports: [RouterLink, RouterLinkActive, RouterOutlet],
    templateUrl: './banking.component.html',
    styleUrl: './banking.component.css'
})
export class BankingComponent {}
