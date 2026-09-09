import {of, Subject} from 'rxjs';
import {SubmissionState} from './submission-state';

describe('SubmissionState', () => {
    it('blocks overlapping operations and allows a retry after failure', () => {
        const state = new SubmissionState();
        const first = new Subject<void>();
        const request = jasmine.createSpy().and.returnValue(first);
        state.run(request).subscribe({error: () => undefined});
        state.run(request).subscribe();
        expect(request).toHaveBeenCalledTimes(1);
        first.error(new Error('Offline'));
        expect(state.pending).toBeFalse();
        request.and.returnValue(of(undefined));
        state.run(request).subscribe();
        expect(request).toHaveBeenCalledTimes(2);
        expect(state.pending).toBeFalse();
    });

    it('releases the lock when cancelled or when constructing the request throws', () => {
        const state = new SubmissionState();
        const subscription = state.run(() => new Subject<void>()).subscribe();
        subscription.unsubscribe();
        expect(state.pending).toBeFalse();
        state.run(() => { throw new Error('Invalid request'); }).subscribe({error: () => undefined});
        expect(state.pending).toBeFalse();
    });
});
