import {Component} from '@angular/core';
import {AuthenticationService} from '../../shared/authentication.service';
import {FormsModule} from '@angular/forms';
import {NgIf} from '@angular/common';

@Component({
    selector: 'app-authentication',
    imports: [FormsModule, NgIf],
    templateUrl: './authentication.component.html',
    styleUrl: './authentication.component.css'
})
export class AuthenticationComponent {
    username: string = '';
    password: string = '';
    status_message: string = '';

    constructor(private authenticationService: AuthenticationService) {
    }

    onLogin() {
        if (!this.username || !this.password) {
            alert('Please enter both username and password.');
            return;
        }

        let success = this.authenticationService.login(this.username, this.password)

        if (success) {
            this.status_message = 'Login successful.';
            this.username = ''
            this.password = ''
        }
    }
}
