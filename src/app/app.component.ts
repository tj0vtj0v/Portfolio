import {Component, ViewChild, inject} from '@angular/core';
import {Router, RouterOutlet} from '@angular/router';
import {takeUntilDestroyed} from '@angular/core/rxjs-interop';
import {AuthService} from './core/auth/auth.service';
import {safeReturnUrl} from './core/auth/return-url';
import {NavigationLoadingService} from './core/layout/navigation-loading.service';
import {UiSkeletonComponent} from './shared/ui/skeleton/ui-skeleton.component';

@Component({
    selector: 'app-root',
    imports: [RouterOutlet, UiSkeletonComponent],
    templateUrl: './app.component.html',
    styles: '.initial-loading { max-width: var(--layout-workspace-max); margin: auto; padding: var(--space-8); }'
})
export class AppComponent {
    protected readonly navigation = inject(NavigationLoadingService);
    @ViewChild(RouterOutlet) private outlet?: RouterOutlet;

    constructor() {
        const router = inject(Router);
        inject(AuthService).sessionEnded$.pipe(takeUntilDestroyed()).subscribe(() => {
            // Destroy the routed private view immediately, even while navigation is pending.
            if (safeReturnUrl(router.url) && this.outlet?.isActivated) {
                const view = this.outlet.component as {deactivatePrivateContent?: () => void};
                // Keep the shared shell mounted: the router reuses it for the login page.
                if (view.deactivatePrivateContent) view.deactivatePrivateContent();
                else this.outlet.deactivate();
            }
        });
    }
}
