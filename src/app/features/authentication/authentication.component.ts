import {Component} from '@angular/core';
import {AuthenticationService} from '../../shared/authentication.service';
import {FormsModule} from '@angular/forms';
import {NgIf} from '@angular/common';

@Component({
    selector: 'app-authentication',
    imports: [
        FormsModule,
        NgIf
    ],
    templateUrl: './authentication.component.html',
    styleUrl: './authentication.component.css'
})
export class AuthenticationComponent {
    protected username: string = '';
    protected password: string = '';
    protected statusMessage: string = '';
    protected passwordFilled = false

    constructor(protected authenticationService: AuthenticationService) {
    }

    ngOnInit() {
        if (this.authenticationService.isLoggedIn()) {
            this.statusMessage = 'You are already logged in';
        } else {
            this.statusMessage = '';
        }
    }

    onLogin() {
        if (!this.username || !this.password) {
            alert('Please enter both username and password.');
            return;
        }

        this.authenticationService.login(this.username, this.password).subscribe(
            (result) => {
                this.statusMessage = result
                this.passwordFilled = true;
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
