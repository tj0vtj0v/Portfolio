import {SubmissionState} from '../../shared/forms/submission-state';
import {takeUntilDestroyed} from '@angular/core/rxjs-interop';
import {Component, DestroyRef, inject} from '@angular/core';
import {RegisterUser} from '../../shared/datatype/RegisterUser';
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
    readonly submission = new SubmissionState();
    private readonly destroyRef = inject(DestroyRef);
    user: RegisterUser = {
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

    trim(): void {
        this.user.first_name = this.user.first_name.trim();
        this.user.last_name = this.user.last_name.trim();
        this.user.email = this.user.email.trim().toLowerCase();
        this.user.username = this.user.username.trim();
    }

    onRegister(): void {
        if (this.submission.pending) return;
        this.trim()

        if (!this.user.first_name || !this.user.last_name || !this.user.email ||
            !this.user.username || !this.user.password) {
            this.statusMessage = 'Please fill in all fields.';
            return;
        }

        if (this.user.password !== this.repeatPassword) {
            this.statusMessage = 'The passwords have to match.';
            return;
        }

        this.statusMessage = '';


        this.submission.run(() => this.userService.register(this.user)).pipe(takeUntilDestroyed(this.destroyRef)).subscribe(
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
