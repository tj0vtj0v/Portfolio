import {AfterViewChecked, Component, DestroyRef, ElementRef, Input, OnChanges, inject} from '@angular/core';
import {takeUntilDestroyed} from '@angular/core/rxjs-interop';
import {takeUntil} from 'rxjs';
import {AccountingService} from '../../../shared/api/accounting.service';
import {AccountingSetupState} from '../../../shared/api/accounting-setup-state.service';
import {FuelService} from '../../../shared/api/fuel.service';
import {FuelSetupState} from '../../../shared/api/fuel-setup-state.service';
import {AuthService} from '../../auth/auth.service';
import {Router, RouterLink, RouterLinkActive} from '@angular/router';
import {WorkspaceProject, PROJECTS, ProjectNavigation} from '../layout-route-data';

@Component({
    selector: 'app-project-switcher',
    imports: [RouterLink, RouterLinkActive],
    templateUrl: './project-switcher.component.html',
    styleUrl: './project-switcher.component.css'
})
export class ProjectSwitcherComponent implements AfterViewChecked, OnChanges {
    protected readonly setup = inject(AccountingSetupState);
    private readonly fuelSetup = inject(FuelSetupState);
    private readonly fuel = inject(FuelService);
    private readonly accounting = inject(AccountingService);
    private readonly auth = inject(AuthService);
    private readonly destroyRef = inject(DestroyRef);
    private readonly router = inject(Router);
    private readonly host = inject<ElementRef<HTMLElement>>(ElementRef).nativeElement;
    protected readonly projects = PROJECTS;
    @Input() project?: WorkspaceProject;

    constructor() {
        const reset = () => { this.setup.reset(); this.fuelSetup.reset(); };
        this.auth.sessionEnded$.pipe(takeUntilDestroyed(this.destroyRef)).subscribe(reset);
        this.destroyRef.onDestroy(reset);
    }

    ngOnChanges(): void {
        if (!this.auth.isLoggedIn()) return;
        const reads = [];
        if (this.project === 'accounting') {
            if (this.setup.accountsEmpty() === null) reads.push(this.accounting.get_accounts());
            if (this.setup.categoriesEmpty() === null) reads.push(this.accounting.get_categories());
        }
        if (this.project === 'fuel' && this.fuelSetup.carsEmpty() === null) reads.push(this.fuel.get_cars());
        for (const read of reads) {
            read.pipe(takeUntil(this.auth.sessionEnded$), takeUntilDestroyed(this.destroyRef)).subscribe({error: () => {}});
        }
    }

    protected needsSetup(path: string): boolean {
        return (path === '/accounting/accounts' && this.setup.accountsEmpty() === true)
            || (path === '/accounting/categories' && this.setup.categoriesEmpty() === true)
            || (path === '/fuel/cars' && this.fuelSetup.carsEmpty() === true);
    }

    protected get selected(): ProjectNavigation | undefined {
        return this.projects.find(item => item.id === this.project);
    }

    protected selectProject(event: Event): void {
        const project = this.projects.find(item => item.id === (event.target as HTMLSelectElement).value);
        if (project) void this.router.navigateByUrl(project.root);
    }

    ngAfterViewChecked(): void {
        const navigation = this.host.querySelector<HTMLElement>('.project-nav');
        const active = navigation?.querySelector<HTMLElement>('a.active');
        if (!navigation || !active) return;
        const navigationBounds = navigation.getBoundingClientRect();
        const activeBounds = active.getBoundingClientRect();
        if (activeBounds.left < navigationBounds.left) navigation.scrollLeft -= navigationBounds.left - activeBounds.left;
        else if (activeBounds.right > navigationBounds.right) navigation.scrollLeft += activeBounds.right - navigationBounds.right;
    }
}
