import {TestBed} from '@angular/core/testing';
import {of, Subject} from 'rxjs';
import {AccountComponent} from '../../features/account/account.component';
import {RegisterComponent} from '../../features/register/register.component';

describe('Profile and registration submissions', () => {
    for (const kind of ['profile', 'registration']) {
        function setup() {
            const response = new Subject<void>();
            const request = jasmine.createSpy().and.returnValue(response);
            const service: any = {update: request, register: request, get: () => of({first_name: 'A', last_name: 'B', email: 'a@example.com'})};
            const editor: any = TestBed.runInInjectionContext(() => kind === 'profile' ? new AccountComponent(service) : new RegisterComponent(service));
            editor.user = {first_name: 'A', last_name: 'B', email: 'a@example.com', username: 'test', password: 'secret'};
            editor.repeatPassword = 'secret';
            const submit = () => kind === 'profile' ? editor.onUpdate() : editor.onRegister();
            return {editor, response, request, submit};
        }

        it(`${kind}: prevents duplicate writes and clears password fields on success`, () => {
            const {editor, response, request, submit} = setup();
            submit();
            submit();
            expect(request).toHaveBeenCalledTimes(1);
            response.next();
            response.complete();
            expect(editor.user.password ?? '').toBe('');
            expect(editor.repeatPassword ?? '').toBe('');
            expect(editor.submission.pending).toBeFalse();
        });

        it(`${kind}: preserves the draft and displays a failure for retry`, () => {
            const {editor, response, submit} = setup();
            const draft = {...editor.user};
            submit();
            response.error({status: 503});
            expect(editor.user).toEqual(draft);
            expect(editor.success).toBeFalse();
            expect(editor.submission.pending).toBeFalse();
            expect(editor.statusMessage).toContain('failed');
        });
    }
});
