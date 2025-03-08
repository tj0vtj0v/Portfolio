import {Component} from '@angular/core';
import {RouterLink} from '@angular/router';
import {NgIf} from '@angular/common';
import {UserService} from '../../shared/api/user.service';

@Component({
    selector: 'app-header',
    imports: [
        RouterLink,
        NgIf
    ],
    templateUrl: './header.component.html',
    styleUrl: './header.component.css'
})
export class HeaderComponent {
    constructor(
        protected userService: UserService
    ) {
    }

    protected readonly document = document;
}
