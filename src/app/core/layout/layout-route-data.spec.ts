import {isWorkspaceDestination, PROJECTS} from './layout-route-data';

describe('remembered workspace catalog', () => {
    it('accepts registered destinations with queries but rejects invented children', () => {
        for (const project of PROJECTS) for (const child of project.children) {
            expect(isWorkspaceDestination(`${child.path}?period=month`)).toBeTrue();
        }
        expect(isWorkspaceDestination('/settings')).toBeTrue();
        expect(PROJECTS.map(project => project.id)).toEqual(['accounting', 'fuel']);
        expect(isWorkspaceDestination('/banking')).toBeFalse();
        expect(isWorkspaceDestination('/proximity')).toBeFalse();
        expect(isWorkspaceDestination('/accounting/not-a-route')).toBeFalse();
        expect(isWorkspaceDestination('/settings/anything')).toBeFalse();
        expect(isWorkspaceDestination('//evil.test/accounting')).toBeFalse();
    });
});
