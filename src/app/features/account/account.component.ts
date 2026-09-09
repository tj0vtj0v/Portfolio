import {UiSkeletonComponent} from '../../shared/ui/skeleton/ui-skeleton.component';
import {FieldErrorDirective} from '../../shared/ui/field-error.directive';
import {SubmissionState} from '../../shared/forms/submission-state';
import {takeUntilDestroyed} from '@angular/core/rxjs-interop';
import {Component, DestroyRef, inject} from '@angular/core';
import {UserService} from '../../shared/api/user.service';
import {ModifyUser} from '../../shared/datatype/ModifyUser';
import {ReadUser} from '../../shared/datatype/ReadUser';
import {CommonModule} from '@angular/common';
import {FormsModule} from '@angular/forms';
import {RouterLink} from '@angular/router';
import {UiPageHeaderComponent} from '../../shared/ui/page-header/ui-page-header.component';
import {UiPanelComponent} from '../../shared/ui/panel/ui-panel.component';
import {FeedbackKind, UiFeedbackComponent} from '../../shared/ui/feedback/ui-feedback.component';

@Component({
    selector: 'app-account',
    imports: [UiSkeletonComponent, FieldErrorDirective,
        CommonModule,
        FormsModule,
        RouterLink,
        UiPageHeaderComponent,
        UiPanelComponent,
        UiFeedbackComponent
    ],
    templateUrl: './account.component.html',
    styleUrl: './account.component.css'
})
export class AccountComponent {
    protected fieldErrors: Record<string, string> = {};
    readonly submission = new SubmissionState();
    private readonly destroyRef = inject(DestroyRef);
    user: ModifyUser = {
        first_name: '',
        last_name: '',
        email: ''
    };
    changePassword: boolean = false;
    repeatPassword?: string = undefined;
    statusMessage: string = '';
    success: boolean = false;
    loading = false;
    loadError = '';

    get feedbackKind(): FeedbackKind {
        return this.success ? 'success' : 'error';
    }

    constructor(
        private userService: UserService
    ) {
    }

    ngOnInit() {
        this.loading = true;
        this.loadError = '';
        this.userService.get().pipe(takeUntilDestroyed(this.destroyRef)).subscribe({
            next: (response: ReadUser) => {
                this.user.first_name = response.first_name;
                this.user.last_name = response.last_name;
                this.user.email = response.email;
                this.loading = false;
            },
            error: () => {
                this.loading = false;
                this.loadError = 'Profile details could not be loaded. Please try again.';
            }
        });
    }

    trim(): void {
        this.user.first_name = this.user.first_name.trim();
        this.user.last_name = this.user.last_name.trim();
        this.user.email = this.user.email.trim().toLowerCase();
    }


    onUpdate(): void {
        if (this.submission.pending) return;
        this.success = false;
        this.fieldErrors = {};
        this.trim()

        if (!this.user.first_name || !this.user.last_name || !this.user.email) {
            if (!this.user.first_name) this.fieldErrors['first_name'] = 'This field is required.';
            if (!this.user.last_name) this.fieldErrors['last_name'] = 'This field is required.';
            if (!this.user.email) this.fieldErrors['email'] = 'This field is required.';
            this.statusMessage = 'Please do not remove values.';
            return;
        }

        if (this.user.password !== this.repeatPassword) {
            this.fieldErrors['repeatPassword'] = 'The passwords have to match.';
            this.statusMessage = 'The passwords have to match.';
            return;
        }

        this.statusMessage = '';


        this.submission.run(() => this.userService.update(this.user)).pipe(takeUntilDestroyed(this.destroyRef)).subscribe(
            () => {
                this.statusMessage = 'Edited successfully';
                this.success = true;
                this.resetForm()
            },
            (error) => {
                if (error?.error?.detail) {
                    this.statusMessage = `Edit failed: ${error.error.detail}`;
                } else {
                    this.statusMessage = 'Edit failed';
                }
            }
        );
    }

    resetForm() {
        this.user.password = undefined
        this.repeatPassword = undefined;

        this.ngOnInit()
    }

    cancelPasswordChange(): void {
        this.changePassword = false;
        this.user.password = undefined;
        this.repeatPassword = undefined;
    }
}
