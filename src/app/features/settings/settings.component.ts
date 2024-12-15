import {Component} from '@angular/core';
import {Router, RouterLink} from '@angular/router';
import {ReadUser} from '../../shared/datatype/ReadUser';
import {AuthenticationService} from '../../shared/authentication.service';
import {UserService} from '../../shared/api/user.service';

@Component({
    selector: 'app-settings',
    imports: [
        RouterLink
    ],
    templateUrl: './settings.component.html',
    styleUrl: './settings.component.css'
})
export class SettingsComponent {
    user: ReadUser = {
        first_name: '',
        last_name: '',
        email: '',
        username: '',
        role: {
            id: 1,
            priority: 1,
            name: "User"
        }
    };

    constructor(
        private authenticationService: AuthenticationService,
        private userService: UserService,
        private router: Router,
    ) {
    }

    ngOnInit() {
        this.userService.get().subscribe(
            (response) => {
                this.user = response;
            }
        )
    }

    logout(): void {
        this.authenticationService.logout();
        this.router.navigate(['/home']).then();
    }

    delete(): void {
        if (confirm('Please confirm deleting your account')) {
            this.userService.delete().subscribe();
            this.authenticationService.logout();
            this.router.navigate(['/home']).then();
        }
    }
}
