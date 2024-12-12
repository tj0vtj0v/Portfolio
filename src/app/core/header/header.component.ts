import {Component} from '@angular/core';
import {Router, RouterLink} from '@angular/router';
import {AuthenticationService} from '../../shared/authentication.service';
import {NgIf} from '@angular/common';

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
        protected authenticationService: AuthenticationService,
        private router: Router,
    ) {
    }

    logoutCheck(): void {
        if (confirm("Are you sure you want to logout?")) {
            this.authenticationService.logout();
            this.router.navigate(['/home']).then();
        }
    }
}
