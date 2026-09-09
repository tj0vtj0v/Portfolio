import {Component, Input, inject} from '@angular/core';
import {Router, RouterLink} from '@angular/router';
import {AuthService} from '../auth/auth.service';
import {ThemeService} from '../theme/theme.service';
import {AppShell} from '../layout/layout-route-data';
import {isWorkspaceDestination} from '../layout/layout-route-data';

@Component({
    selector: 'app-header',
    imports: [
        RouterLink
    ],
    templateUrl: './header.component.html',
    styleUrl: './header.component.css'
})
export class HeaderComponent {
    protected readonly auth = inject(AuthService);
    protected readonly theme = inject(ThemeService);
    private readonly router = inject(Router);

    @Input({required: true}) shell: AppShell = 'portfolio';
    @Input() workspaceTarget = '/accounting';

    protected get workspaceLink() {
        return this.router.parseUrl(isWorkspaceDestination(this.workspaceTarget) ? this.workspaceTarget : '/accounting');
    }

    protected logout(): void {
        this.auth.logout();
        void this.router.navigateByUrl('/login');
    }
}
