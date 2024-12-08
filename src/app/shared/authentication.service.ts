import {Injectable} from '@angular/core';
import {HttpClient, HttpHeaders, HttpParams} from '@angular/common/http';
import {catchError, Observable} from 'rxjs';

@Injectable({
    providedIn: 'root'
})
export class AuthenticationService {
    private loginUrl = 'http://raspi:4053/login';

    constructor(private http: HttpClient) {
    }

    login(username: string, password: string): Observable<any> {
        const body = new HttpParams().set('username', username).set('password', password);
        const headers = new HttpHeaders().set('Content-Type', 'application/x-www-form-urlencoded');
        return this.http.post(this.loginUrl, body.toString(), {headers}).pipe(
            catchError((error) => {
                if (error.status === 401) {
                    alert(error.error.detail);
                }
                return '';
            })
        )
    }
}
