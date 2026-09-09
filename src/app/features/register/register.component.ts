import {FieldErrorDirective} from '../../shared/ui/field-error.directive';
import {SubmissionState} from '../../shared/forms/submission-state';
import {takeUntilDestroyed} from '@angular/core/rxjs-interop';
import {Component, DestroyRef, inject} from '@angular/core';
import {RegisterUser} from '../../shared/datatype/RegisterUser';
import {UserService} from '../../shared/api/user.service';
import {CommonModule} from '@angular/common';
import {FormsModule} from '@angular/forms';
import {RouterLink} from '@angular/router';
import {UiPageHeaderComponent} from '../../shared/ui/page-header/ui-page-header.component';
import {UiPanelComponent} from '../../shared/ui/panel/ui-panel.component';
import {FeedbackKind, UiFeedbackComponent} from '../../shared/ui/feedback/ui-feedback.component';

@Component({
    selector: 'app-register',
    imports: [FieldErrorDirective,
        CommonModule,
        FormsModule,
        RouterLink,
        UiPageHeaderComponent,
        UiPanelComponent,
        UiFeedbackComponent
    ],
    templateUrl: './register.component.html',
    styleUrl: './register.component.css'
})
export class RegisterComponent {
    protected fieldErrors: Record<string, string> = {};
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

    get feedbackKind(): FeedbackKind {
        return this.statusMessage.startsWith('Registered successfully') ? 'success' : 'error';
    }

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
        this.fieldErrors = {};
        this.trim()

        if (!this.user.first_name || !this.user.last_name || !this.user.email ||
            !this.user.username || !this.user.password) {
            if (!this.user.first_name) this.fieldErrors['first_name'] = 'This field is required.';
            if (!this.user.last_name) this.fieldErrors['last_name'] = 'This field is required.';
            if (!this.user.email) this.fieldErrors['email'] = 'This field is required.';
            if (!this.user.username) this.fieldErrors['username'] = 'This field is required.';
            if (!this.user.password) this.fieldErrors['password'] = 'This field is required.';
            this.statusMessage = 'Please fill in all fields.';
            return;
        }

        if (this.user.password !== this.repeatPassword) {
            this.fieldErrors['repeatPassword'] = 'The passwords have to match.';
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
