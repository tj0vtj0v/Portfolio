import {ActivatedRouteSnapshot} from '@angular/router';

export type AppShell = 'portfolio' | 'workspace';
export type WorkspaceProject = 'accounting' | 'fuel';

export function isPortfolioDestination(url: string): boolean {
    return ['/home', '/about', '/projects', '/contact'].includes(cleanPath(url));
}

export interface LayoutContext {
    shell: AppShell;
    project?: WorkspaceProject;
}

export function layoutContext(snapshot: ActivatedRouteSnapshot): LayoutContext {
    let current: ActivatedRouteSnapshot | null = snapshot;
    let shell: AppShell = 'portfolio';
    let project: WorkspaceProject | undefined;
    while (current) {
        if (current.data['shell'] === 'portfolio' || current.data['shell'] === 'workspace') shell = current.data['shell'];
        if (isWorkspaceProject(current.data['project'])) project = current.data['project'];
        current = current.firstChild;
    }
    return {shell, project};
}

export function isWorkspaceDestination(url: string): boolean {
    const path = cleanPath(url);
    return ['/account', '/settings', ...PROJECTS.flatMap(project => project.children.map(child => child.path))].includes(path);
}

function isWorkspaceProject(value: unknown): value is WorkspaceProject {
    return value === 'accounting' || value === 'fuel';
}

function cleanPath(url: string): string {
    return url.split(/[?#]/, 1)[0].replace(/\/$/, '') || '/';
}

export interface ProjectNavigation {
    id: WorkspaceProject;
    name: string;
    root: string;
    children: ReadonlyArray<{label: string; path: string}>;
}

export const PROJECTS: readonly ProjectNavigation[] = [
    {id: 'accounting', name: 'Expense Tracker', root: '/accounting', children: [
        {label: 'Overview', path: '/accounting'}, {label: 'Expenses', path: '/accounting/expenses'},
        {label: 'Income', path: '/accounting/incomes'}, {label: 'Transfers', path: '/accounting/transfers'},
        {label: 'Accounts', path: '/accounting/accounts'}, {label: 'Categories', path: '/accounting/categories'}
    ]},
    {id: 'fuel', name: 'Fuel Tracker', root: '/fuel', children: [
        {label: 'Overview', path: '/fuel'}, {label: 'Refuels', path: '/fuel/refuels'}, {label: 'Cars', path: '/fuel/cars'}
    ]}
];
