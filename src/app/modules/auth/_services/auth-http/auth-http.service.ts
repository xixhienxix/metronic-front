import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { UserModel } from '../../_models/user.model';
import { environment } from '../../../../../environments/environment';
import { AuthModel } from '../../_models/auth.model';

const API_USERS_URL = `${environment.apiUrl}/auth`;

@Injectable({
  providedIn: 'root',
})
export class AuthHTTPService {
  constructor(private http: HttpClient,
    private _parametrosService) { }

  // public methods
  login(email: string, password: string): Observable<any> {
    const hotel = sessionStorage.getItem("HOTEL")
    return this.http.post<AuthModel>(`${API_USERS_URL}/login`, { email, password, hotel });
  }

  // CREATE =>  POST: add a new user to the server
  createUser(user: UserModel): Observable<UserModel> {
    const hotel = sessionStorage.getItem("HOTEL");
    let queryParams = new HttpParams();
    queryParams = queryParams.append("hotel",hotel);

    return this.http.post<UserModel>(API_USERS_URL,{params:queryParams,user});
  }

  // Your server should check email => If email exists send link to the user and return true | If email doesn't exist return false
  forgotPassword(email: string): Observable<boolean> {

    const hotel = sessionStorage.getItem("HOTEL");
    let queryParams = new HttpParams();
    queryParams = queryParams.append("hotel",hotel);

    return this.http.post<boolean>(`${API_USERS_URL}/forgot-password`, {
      params:queryParams,
      email,
    });
  }

  getUserByToken(token): Observable<UserModel> {
    const httpHeaders = new HttpHeaders({
      Authorization: `Bearer ${token}`,
    });
    const hotel = sessionStorage.getItem("HOTEL");
    let queryParams = new HttpParams();
    queryParams = queryParams.append("hotel",hotel);
    
    return this.http.get<UserModel>(`${API_USERS_URL}/me`, {
      params:queryParams,
      headers: httpHeaders,
    });
  }
}
