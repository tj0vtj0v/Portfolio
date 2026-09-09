import {Injectable, inject} from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {Observable} from 'rxjs';
import {API_BASE_URL} from '../../core/auth/auth.service';

@Injectable({providedIn: 'root'})
export class ConnectorService {
    private readonly http = inject(HttpClient);

    add<T = any>(suffix: string, body: unknown): Observable<T> {
        return this.http.post<T>(`${API_BASE_URL}${suffix}`, body, {headers: {accept: 'application/json', 'Content-Type': 'application/json'}});
    }

    get<T = any>(suffix: string): Observable<T> {
        return this.http.get<T>(`${API_BASE_URL}${suffix}`, {headers: {accept: 'application/json'}});
    }

    update<T = any>(suffix: string, body: unknown): Observable<T> {
        return this.http.patch<T>(`${API_BASE_URL}${suffix}`, body, {headers: {accept: 'application/json', 'Content-Type': 'application/json'}});
    }

    delete<T = any>(suffix: string): Observable<T> {
        return this.http.delete<T>(`${API_BASE_URL}${suffix}`, {headers: {accept: '*/*'}});
    }
}
