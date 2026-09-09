import {FieldErrorDirective} from '../../shared/ui/field-error.directive';
import {SubmissionState} from '../../shared/forms/submission-state';
import {takeUntilDestroyed} from '@angular/core/rxjs-interop';
import {Component, DestroyRef, inject} from '@angular/core';
import {FormsModule} from '@angular/forms';
import {NgIf} from '@angular/common';
import {ActivatedRoute, Router, RouterLink} from '@angular/router';
import {safeReturnUrl} from '../../core/auth/return-url';
import {UserService} from '../../shared/api/user.service';
import {UiPageHeaderComponent} from '../../shared/ui/page-header/ui-page-header.component';
import {UiPanelComponent} from '../../shared/ui/panel/ui-panel.component';
import {FeedbackKind, UiFeedbackComponent} from '../../shared/ui/feedback/ui-feedback.component';

@Component({
    selector: 'app-authentication',
    imports: [FieldErrorDirective,
        FormsModule,
        NgIf,
        RouterLink,
        UiPageHeaderComponent,
        UiPanelComponent,
        UiFeedbackComponent
    ],
    templateUrl: './authentication.component.html',
    styleUrl: './authentication.component.css'
})
export class AuthenticationComponent {
    protected fieldErrors: Record<string, string> = {};
    readonly submission = new SubmissionState();
    private readonly destroyRef = inject(DestroyRef);
    protected username: string = '';
    protected password: string = '';
    protected statusMessage: string = '';
    protected returnUrl?: string;
    protected sessionCheckFailed = false;

    protected get feedbackKind(): FeedbackKind {
        if (this.statusMessage === 'Login successful') return 'success';
        return this.statusMessage.startsWith('Login failed') || this.statusMessage.startsWith('Please') ? 'error' : 'info';
    }

    constructor(protected userService: UserService, private route: ActivatedRoute, private router: Router) {
    }

    ngOnInit() {
        this.returnUrl = safeReturnUrl(this.route.snapshot.queryParamMap.get('returnUrl'));
        this.sessionCheckFailed = this.route.snapshot.queryParamMap.get('sessionCheck') === 'failed';
        if (this.sessionCheckFailed) {
            this.statusMessage = 'Unable to verify access right now. Your session has been kept; you can retry.';
        } else if (this.userService.isLoggedIn()) {
            this.statusMessage = 'You are already logged in';
        } else {
            this.statusMessage = '';
        }
    }

    trim(): void {
        this.username = this.username.trim();
    }

    onLogin() {
        if (this.submission.pending) return;
        this.fieldErrors = {};
        this.trim()

        if (!this.username || !this.password) {
            if (!this.username) this.fieldErrors['username'] = 'Enter a username.';
            if (!this.password) this.fieldErrors['password'] = 'Enter a password.';
            this.statusMessage = 'Please enter both, username and password.';
            return;
        }

        this.statusMessage = '';


        this.submission.run(() => this.userService.login(this.username, this.password)).pipe(takeUntilDestroyed(this.destroyRef)).subscribe(
            () => {
                this.statusMessage = 'Login successful';
                this.password = '';
                void this.router.navigateByUrl(this.returnUrl ?? '/accounting');
            },
            (error) => {
                if ([0, 502, 503, 504].includes(error?.status)) {
                    this.statusMessage = 'Login failed: unable to reach the backend. Please try again shortly.';
                } else if (error?.error?.detail) {
                    this.statusMessage = `Login failed: ${error.error.detail}`
                } else {
                    this.statusMessage = 'Login failed';
                }
            }
        )
    }

}
