import {Component} from '@angular/core';
import {Router} from '@angular/router';
import {AuthenticationService} from '../../shared/authentication.service';

@Component({
    selector: 'app-authentication',
    imports: [],
    templateUrl: './authentication.component.html',
    styleUrl: './authentication.component.css'
})
export class AuthenticationComponent {
    username: string = '';
    password: string = '';

    constructor(private router: Router, private authenticationService: AuthenticationService) {}

    onLogin() {
        if (!this.username || !this.password) {
            alert('Please enter both username and password.');
            return;
        }

        this.authenticationService.login(this.username, this.password).subscribe(
            (response: { token: string; }) => {
                // Step 3: Store the auth token in localStorage if login is successful
                if (response && response.token) {
                    localStorage.setItem('auth-token', response.token);
                    console.log('Login successful, token saved to localStorage.');

                    // You can also redirect the user after a successful login
                    this.router.navigate(['/dashboard']);
                } else {
                    alert('Invalid credentials.');
                }
            },
            (error: any) => {
                console.error('Login failed', error);
                alert('Login failed, please try again.');
            }
        )
    }
}
