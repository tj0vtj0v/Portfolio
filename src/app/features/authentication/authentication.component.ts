import {Component} from '@angular/core';
import {AuthenticationService} from '../../shared/authentication.service';
import {FormsModule} from '@angular/forms';
import {HttpResponse} from '@angular/common/http';

@Component({
    selector: 'app-authentication',
    imports: [FormsModule],
    templateUrl: './authentication.component.html',
    standalone: true,
    styleUrl: './authentication.component.css'
})
export class AuthenticationComponent {
    username: string = '';
    password: string = '';

    constructor(private authenticationService: AuthenticationService) {
    }

    onLogin() {
        if (!this.username || !this.password) {
            alert('Please enter both username and password.');
            return;
        }

        this.authenticationService.login(this.username, this.password).subscribe(
            (response: HttpResponse<any>) => {
                console.log(response);
                localStorage.setItem('auth-token', response.body);
            }
        )
    }
}
