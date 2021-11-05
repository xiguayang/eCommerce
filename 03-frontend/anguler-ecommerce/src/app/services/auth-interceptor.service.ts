import { HttpEvent, HttpHandler, HttpInterceptor, HttpRequest } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { OktaAuthService } from '@okta/okta-angular';
import { from, Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class AuthInterceptorService implements HttpInterceptor {
 //HttpInterceptor is an interface provided by angular
 //inject Okta services in constructor
  constructor(private oktaAuth: OktaAuthService) { }

  //will intercept all outgoing HTTP requests of HttpClient
  intercept(request: HttpRequest<any>, next:HttpHandler):Observable<HttpEvent<any>>{
    return from(this.handleAccess(request,next))
  }
  //returns a promise
  private async handleAccess(request: HttpRequest<any>, next: HttpHandler): Promise<HttpEvent<any>> {
    //only add an access token for secured endpoints
    const securedEndpoints=['http://localhost:8080/api/orders'];
    if(securedEndpoints.some(url=>request.urlWithParams.includes(url))){
      //get access token
      const accessToken = await this.oktaAuth.getAccessToken();
      //getAccessToken is an Async call, adding await to wait the call to finish

      //request is immutable, must clone
      //clone the request and add new header with access token
      request= request.clone({
        setHeaders:{
          //attention: must have a space after 'Bearer '
          Authorization: 'Bearer '+accessToken
        }
      })
    }
    //Pass the request to the next interceptor in the chain
    return next.handle(request).toPromise();



  }
}
