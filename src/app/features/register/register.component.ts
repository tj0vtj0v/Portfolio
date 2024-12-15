import {Component} from '@angular/core';
import {ModifyRestrictedUser} from '../../shared/datatype/ModifyRestrictedUser';
import {UserService} from '../../shared/api/user.service';
import {CommonModule} from '@angular/common';
import {FormsModule} from '@angular/forms';
import {RouterLink} from '@angular/router';

@Component({
    selector: 'app-register',
    imports: [
        CommonModule,
        FormsModule,
        RouterLink
    ],
    templateUrl: './register.component.html',
    styleUrl: './register.component.css'
})
export class RegisterComponent {
    user: ModifyRestrictedUser = {
        first_name: '',
        last_name: '',
        email: '',
        username: '',
        password: ''
    };
    repeatPassword: string = '';
    statusMessage: string = '';
    success = false;

    constructor(
        private userService: UserService
    ) {
    }

    onRegister(): void {
        if (!this.user.first_name || !this.user.last_name || !this.user.email ||
            !this.user.username || !this.user.password) {
            this.statusMessage = 'Please fill in all fields.';
            return;
        }

        if (this.user.password !== this.repeatPassword) {
            this.statusMessage = 'The passwords have to match.';
            return;
        }

        this.userService.register(this.user).subscribe(
            () => {
                this.statusMessage = 'Registered successfully, please log in';
                this.success = true;
                this.resetForm()
            },
            (error) => {
                if (error?.error?.detail) {
                    this.statusMessage = `Registration failed: ${error.error.detail}`;
                } else {
                    this.statusMessage = 'Registration failed';
                }
            }
        )
    }

    resetForm() {
        this.user = {
            first_name: '',
            last_name: '',
            email: '',
            username: '',
            password: ''
        };
        this.repeatPassword = '';
    }
}
