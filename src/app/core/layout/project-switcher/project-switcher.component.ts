import {AfterViewChecked, Component, ElementRef, Input, inject} from '@angular/core';
import {Router, RouterLink, RouterLinkActive} from '@angular/router';
import {WorkspaceProject, PROJECTS, ProjectNavigation} from '../layout-route-data';

@Component({
    selector: 'app-project-switcher',
    imports: [RouterLink, RouterLinkActive],
    templateUrl: './project-switcher.component.html',
    styleUrl: './project-switcher.component.css'
})
export class ProjectSwitcherComponent implements AfterViewChecked {
    private readonly router = inject(Router);
    private readonly host = inject<ElementRef<HTMLElement>>(ElementRef).nativeElement;
    protected readonly projects = PROJECTS;
    @Input() project?: WorkspaceProject;

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
