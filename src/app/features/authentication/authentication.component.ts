import {Component} from '@angular/core';
import {FormsModule} from '@angular/forms';
import {NgIf} from '@angular/common';
import {RouterLink} from '@angular/router';
import {UserService} from '../../shared/api/user.service';

@Component({
    selector: 'app-authentication',
    imports: [
        FormsModule,
        NgIf,
        RouterLink
    ],
    templateUrl: './authentication.component.html',
    styleUrl: './authentication.component.css'
})
export class AuthenticationComponent {
    protected username: string = '';
    protected password: string = '';
    protected statusMessage: string = '';
    protected passwordFilled = false

    constructor(protected userService: UserService) {
    }

    ngOnInit() {
        if (this.userService.isLoggedIn()) {
            this.statusMessage = 'You are already logged in';
        } else {
            this.statusMessage = '';
        }
    }

    onLogin() {
        if (!this.username || !this.password) {
            this.statusMessage = 'Please enter both, username and password.';
            return;
        }

        this.userService.login(this.username, this.password).subscribe(
            () => {
                this.statusMessage = 'Login successful';
                this.passwordFilled = true;
            },
            (error) => {
                if (error?.error?.detail) {
                    `Login failed: ${error.error.detail}`
                } else {
                    'Login failed';
                }
            }
        )
    }

    onPasswordClickOn() {
        if (this.passwordFilled) {
            this.password = ''
            this.passwordFilled = false;
        }
    }
}
