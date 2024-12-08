import {Injectable} from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {Observable} from 'rxjs';

@Injectable({
    providedIn: 'root'
})
export class AuthenticationService {
    private loginUrl = 'http://80.209.200.73:4053/login';

    constructor(private http: HttpClient) {
    }

    login(username: string, password: string): Observable<any> {
        const credentials = {username, password};
        return this.http.post<HttpClient>(this.loginUrl, credentials)
    }
}
