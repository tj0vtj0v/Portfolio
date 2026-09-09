import {UiSkeletonComponent} from '../../shared/ui/skeleton/ui-skeleton.component';
import {Component, DestroyRef, inject} from '@angular/core';
import {NgIf} from '@angular/common';
import {Router, RouterLink} from '@angular/router';
import {takeUntilDestroyed} from '@angular/core/rxjs-interop';
import {ReadUser} from '../../shared/datatype/ReadUser';
import {UserService} from '../../shared/api/user.service';
import {UiPageHeaderComponent} from '../../shared/ui/page-header/ui-page-header.component';
import {UiPanelComponent} from '../../shared/ui/panel/ui-panel.component';
import {UiFeedbackComponent} from '../../shared/ui/feedback/ui-feedback.component';

@Component({
    selector: 'app-settings',
    imports: [UiSkeletonComponent,
        RouterLink, NgIf, UiPageHeaderComponent, UiPanelComponent, UiFeedbackComponent
    ],
    templateUrl: './settings.component.html',
    styleUrl: './settings.component.css'
})
export class SettingsComponent {
    private readonly destroyRef = inject(DestroyRef);
    user?: ReadUser;
    deleting = false;
    loading = false;
    loadError = '';
    statusMessage = '';

    constructor(
        private userService: UserService,
        private router: Router
    ) {
    }

    ngOnInit() {
        this.loading = true;
        this.loadError = '';
        this.userService.get().pipe(takeUntilDestroyed(this.destroyRef)).subscribe({
            next: (response) => {
                this.user = response;
                this.loading = false;
            },
            error: () => {
                this.loading = false;
                this.loadError = 'Account details could not be loaded. Please try again.';
            }
        });
    }

    logout(): void {
        this.userService.logout();
        this.router.navigate(['/home']).then();
    }

    delete(): void {
        if (!this.deleting && confirm('Please confirm deleting your account')) {
            this.deleting = true;
            this.statusMessage = '';
            this.userService.delete().pipe(takeUntilDestroyed(this.destroyRef)).subscribe({
                next: () => {
                    this.userService.logout();
                    void this.router.navigate(['/home']);
                },
                error: () => {
                    this.deleting = false;
                    this.statusMessage = 'Account deletion failed. Your account is still signed in; please try again.';
                }
            });
        }
    }
}
