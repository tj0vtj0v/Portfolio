import {defer, EMPTY, finalize, Observable} from 'rxjs';

/** One instance per editor; a failed request leaves the editor's data untouched. */
export class SubmissionState {
    pending = false;

    run<T>(request: () => Observable<T>): Observable<T> {
        return defer(() => {
            if (this.pending) return EMPTY;
            this.pending = true;
            return defer(request).pipe(finalize(() => this.pending = false));
        });
    }
}
