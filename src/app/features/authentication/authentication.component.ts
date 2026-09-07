import {SubmissionState} from '../../shared/forms/submission-state';
import {takeUntilDestroyed} from '@angular/core/rxjs-interop';
import {Component, DestroyRef, inject} from '@angular/core';
import {FormsModule} from '@angular/forms';
import {NgIf} from '@angular/common';
import {ActivatedRoute, Router, RouterLink} from '@angular/router';
import {safeReturnUrl} from '../../core/auth/return-url';
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
    readonly submission = new SubmissionState();
    private readonly destroyRef = inject(DestroyRef);
    protected username: string = '';
    protected password: string = '';
    protected statusMessage: string = '';
    protected returnUrl?: string;
    protected sessionCheckFailed = false;

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
        this.trim()

        if (!this.username || !this.password) {
            this.statusMessage = 'Please enter both, username and password.';
            return;
        }

        this.statusMessage = '';


        this.submission.run(() => this.userService.login(this.username, this.password)).pipe(takeUntilDestroyed(this.destroyRef)).subscribe(
            () => {
                this.statusMessage = 'Login successful';
                this.password = '';
                if (this.returnUrl) void this.router.navigateByUrl(this.returnUrl);
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
