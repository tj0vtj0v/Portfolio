import {Component} from '@angular/core';
import {NgIf} from '@angular/common';
import {Router, RouterLink} from '@angular/router';
import {ReadUser} from '../../shared/datatype/ReadUser';
import {UserService} from '../../shared/api/user.service';

@Component({
    selector: 'app-settings',
    imports: [
        RouterLink, NgIf
    ],
    templateUrl: './settings.component.html',
    styleUrl: './settings.component.css'
})
export class SettingsComponent {
    user?: ReadUser;
    deleting = false;
    statusMessage = '';

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
        if (!this.deleting && confirm('Please confirm deleting your account')) {
            this.deleting = true;
            this.statusMessage = '';
            this.userService.delete().subscribe({
                next: () => {
                    this.userService.logout();
                    void this.router.navigate(['/home']);
                },
                error: () => {
                    this.deleting = false;
                    this.statusMessage = 'Account deletion failed. Your account is still signed in; please try again.';
                }
            });
        }
    }
}
