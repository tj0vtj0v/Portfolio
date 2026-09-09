import {Component, DestroyRef, ViewChild, inject, signal} from '@angular/core';
import {takeUntilDestroyed} from '@angular/core/rxjs-interop';
import {ActivatedRoute, NavigationEnd, Router, RouterOutlet} from '@angular/router';
import {filter, startWith} from 'rxjs';
import {FooterComponent} from '../../footer/footer.component';
import {HeaderComponent} from '../../header/header.component';
import {PointerGridDirective} from '../../../shared/effects/pointer-grid.directive';
import {AppShell, isWorkspaceDestination, layoutContext, WorkspaceProject} from '../layout-route-data';
import {ProjectSwitcherComponent} from '../project-switcher/project-switcher.component';
import {NavigationLoadingService} from '../navigation-loading.service';
import {UiSkeletonComponent} from '../../../shared/ui/skeleton/ui-skeleton.component';

@Component({
    selector: 'app-layout',
    imports: [FooterComponent, HeaderComponent, PointerGridDirective, ProjectSwitcherComponent, RouterOutlet, UiSkeletonComponent],
    templateUrl: './app-layout.component.html',
    styleUrl: './app-layout.component.css'
})
export class AppLayoutComponent {
    @ViewChild(RouterOutlet) private outlet?: RouterOutlet;

    deactivatePrivateContent(): void { this.outlet?.deactivate(); }

    protected readonly navigation = inject(NavigationLoadingService);
    private readonly router = inject(Router);
    private readonly route = inject(ActivatedRoute);
    protected readonly shell = signal<AppShell>('portfolio');
    protected readonly project = signal<WorkspaceProject | undefined>(undefined);
    protected readonly workspaceTarget = signal('/accounting');

    constructor() {
        this.router.events.pipe(
            filter((event): event is NavigationEnd => event instanceof NavigationEnd),
            startWith(null),
            takeUntilDestroyed(inject(DestroyRef))
        ).subscribe(() => this.syncRoute());
    }

    private syncRoute(): void {
        const context = layoutContext(this.route.snapshot);
        const url = this.router.url;
        this.shell.set(context.shell);
        this.project.set(context.project);
        if (isWorkspaceDestination(url)) this.workspaceTarget.set(url);
    }
}
