import {Component} from '@angular/core';
import {Router, RouterLink} from '@angular/router';
import {ReadUser} from '../../shared/datatype/ReadUser';
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
    user?: ReadUser;

    constructor(
        private userService: UserService,
        private router: Router
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
        this.userService.logout();
        this.router.navigate(['/home']).then();
    }

    delete(): void {
        if (confirm('Please confirm deleting your account')) {
            this.userService.delete().subscribe();
            this.userService.logout();
            this.router.navigate(['/home']).then();
        }
    }
}
