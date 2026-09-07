import {Component, ViewChild, inject} from '@angular/core';
import {Router, RouterOutlet} from '@angular/router';
import {takeUntilDestroyed} from '@angular/core/rxjs-interop';
import {AuthService} from './core/auth/auth.service';
import {safeReturnUrl} from './core/auth/return-url';
import {HeaderComponent} from './core/header/header.component';
import {FooterComponent} from './core/footer/footer.component';

@Component({
    selector: 'app-root',
    imports: [
        RouterOutlet,
        HeaderComponent,
        FooterComponent
    ],
    templateUrl: './app.component.html',
    styleUrl: './app.component.css'
})
export class AppComponent {
    @ViewChild(RouterOutlet) private outlet?: RouterOutlet;

    constructor() {
        const router = inject(Router);
        inject(AuthService).sessionEnded$.pipe(takeUntilDestroyed()).subscribe(() => {
            // Destroy the routed private view immediately, even while navigation is pending.
            if (safeReturnUrl(router.url)) this.outlet?.deactivate();
        });
    }
}
